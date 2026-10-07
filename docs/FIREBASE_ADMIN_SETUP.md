# Website administrator setup (no Firebase custom claim)

The website administrator is the school president using the website's `/admin` dashboard. The president is **not** a Firebase Console administrator. The site checks the president's email and password against the server-only `ADMIN_EMAIL` and `ADMIN_PASSWORD` values. It does not look up an admin role in Firestore and does not require an `admin: true` custom claim or Firebase Admin SDK service-account key.

## One-time setup

1. In Firebase Console for the project configured in the app, enable **Authentication → Sign-in method → Email/Password**.
2. In **Authentication → Users**, add one user using the same email and strong password you intend to configure as `ADMIN_EMAIL` and `ADMIN_PASSWORD`. Use the exact lowercase email in Firestore Rules too.
3. In Netlify, add these server environment variables:

   ```text
   ADMIN_EMAIL=president@example.org
   ADMIN_PASSWORD=<a unique strong password of at least 12 characters>
   SESSION_SECRET=<a random secret of at least 32 characters>
   ```

   `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `SESSION_SECRET` must not start with `NEXT_PUBLIC_`. They are only used by server-side routes. Configure the same values in `.env.local` for local development, using a private password and session secret.
4. Publish the Firestore security rules:
   - In the repository, open [`firestore.rules`](../firestore.rules). In `isAdmin()`, ensure the email literal (`adminsara@scladmin.com` in the supplied file) is the exact lowercase email from step 2 and matches `ADMIN_EMAIL`. Firestore Rules cannot read Netlify environment variables, so this email must be configured separately.
   - Sign in to [Firebase Console](https://console.firebase.google.com/) with an account that has permission to edit this Firebase project's Firestore rules. Select the correct project, then open **Build → Firestore Database → Rules**.
   - Copy the complete contents of `firestore.rules` into the Rules editor, review it, and click **Publish**. Publishing replaces the project's currently active rules. Do not publish until you have checked the project name and the admin email.
   - Confirm that the Rules page shows the new rules as published. Test with the president's account and a school account; do not test by temporarily allowing everyone to read or write.
5. Give the president the website URL, Firebase Auth email/password, and login instructions privately. The president signs in at `/login?tab=admin`; no service-account key or Firebase Console role is needed.

The website login first validates credentials against the server-only Netlify environment values, then signs into Firebase Authentication with the same account so Firestore can apply the email-based rules. The API also issues a signed, HTTP-only website session cookie. This does **not** use Firestore to decide whether those credentials are the website-admin credentials. Keep the Firebase Auth account password synchronized with `ADMIN_PASSWORD`; if it is changed, update both Firebase Authentication and Netlify environment variables, then redeploy.

Only this exact Firebase Auth email receives admin access under the provided Firestore Rules. All other users are subject to the school-specific rules. The president should not share their account; it is the site's single administrator login.

## School accounts

School teachers register from the website. Firebase Authentication creates their login account and Firestore stores their school profile with `pending` status. The president approves the school in the admin dashboard. Teachers can sign in and submit only while the school status is `active`; suspended and banned schools are blocked. The president can restore access by setting the status to `active`.

The site does not upload PDFs or other entry files. Teachers should upload entries to a school-approved cloud drive, configure sharing for the adjudicators, and paste the share link into the submission form. The dashboard stores and displays that URL.

## What goes to GitHub, Netlify, and Firebase

- **GitHub:** Commit the application source and configuration needed to build it, including `firestore.rules`, `netlify.toml`, `package.json`, and the lockfile. Netlify connects to this repository and builds/deploys the Next.js application from it. Keep the repository private if you do not want the source code and rules file to be publicly browsable.
- **Firebase:** `firestore.rules` is published separately in Firebase Console using the steps above. Connecting GitHub to Netlify does not publish Firestore Rules.
- **Netlify environment variables:** Configure the browser Firebase project settings required by the app, plus the server-only `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `SESSION_SECRET`, in the Netlify site's environment-variable settings. The server-only values must not use a `NEXT_PUBLIC_` prefix.
- **Never commit or upload:** `.env.local`, real passwords, `SESSION_SECRET`, private API keys, or service-account/private-key JSON files. This setup does not need a Firebase service-account key. Add local secret files to `.gitignore` and set the values directly in Netlify's environment settings. The Firebase **web app config** (including its API key) is intended to be used in client-side code and is not an admin secret; Firestore Rules and Firebase Authentication are what protect data and accounts.

## Can ordinary visitors see `firestore.rules`?

Treat the rules file as **public, not secret**. If the GitHub repository is public, anyone can open the file there. It is not normally bundled into the browser JavaScript just because Netlify builds the app, but security must never depend on hiding it. Firestore evaluates the published rules on Google's servers for every database request; visitors cannot bypass a denied rule by using browser developer tools or calling Firestore directly. They can read only data that the rules allow their account to read. For example, these rules intentionally allow public reads of competition documents, while school profiles and submissions have narrower access. Never put passwords, keys, or other secrets in the rules file.

See [`../PRODUCTION_DEPLOYMENT.md`](../PRODUCTION_DEPLOYMENT.md) for Netlify deployment, email notifications, real-time Firestore listeners, and quota behavior.
