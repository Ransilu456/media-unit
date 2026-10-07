# Production deployment and account workflow

## Architecture and data

- Netlify hosts the Next.js website.
- Firebase Authentication stores sign-in accounts and verifies email/password credentials.
- Cloud Firestore is the application's database. It stores documents in `schools`, `competitions`, and `submissions`.
- The app does not use Firebase Realtime Database.
- Submission files are not uploaded by this app. A school submits a link, which is stored in the submission document and shown as a clickable link to the website administrator.

The primary admin is an **administrator of this website**, not a Firebase Console user. The president signs in at `/login?tab=admin`. The server checks the submitted email/password against server-only `ADMIN_EMAIL` and `ADMIN_PASSWORD` environment variables, then Firebase Authentication signs in the same account for Firestore access. No `admin: true` custom claim or Firestore lookup is used to validate the website admin credentials. The president does not need Firebase Console access or a service-account key. Follow [FIREBASE_ADMIN_SETUP.md](./FIREBASE_ADMIN_SETUP.md) to create the president's Auth account and configure Netlify and Firestore Rules.

## Deploy to Netlify

The repository includes `netlify.toml` with a Next.js build command and adapter, and `.nvmrc` selects Node.js 22 for Netlify builds. Connect the Git repository in Netlify (**Add new project → Import an existing project**) and set the **Base directory** to the repository root (leave it blank if the app is at the root). Use the configured build command `npm run build`; Netlify can install dependencies from the committed `package-lock.json`. The publish directory is `.next` as configured in `netlify.toml`; do not change it to `dist` because this is a Next.js app with server routes and needs the [Netlify Next.js adapter](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/).

The framework selector showing **Unknown** does not by itself prove the repository is misconfigured: the repository still has the required `package.json`, build script, lockfile, and Netlify config. Commit and push these files (including `.nvmrc`, `package.json`, `package-lock.json`, and `netlify.toml`) to the branch Netlify deploys. If the deploy log stops at “Installing dependencies”, open the full deploy log and inspect the dependency-install phase for the actual npm error. That excerpt alone does not include enough information to identify an install failure. If it still fails after the Node 22 pin, use **Clear cache and deploy site** once; if it fails again, capture the first npm error lines from the full log, omitting environment-variable values.

Set these variables in the Netlify site's environment-variable settings for the production build:

```text
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID (optional)
```

Use the web-app config from the same Firebase project where you enable Authentication and create Firestore. `NEXT_PUBLIC_*` values are sent to browsers; they are project identifiers, not server secrets. Firestore Rules—not secrecy of the web API key—must protect data.

Also add these three **server-only** variables in Netlify and local `.env.local`:

```text
ADMIN_EMAIL
ADMIN_PASSWORD
SESSION_SECRET
```

Use the same `ADMIN_EMAIL` and `ADMIN_PASSWORD` in Firebase Authentication's user list. Generate a unique random `SESSION_SECRET` of at least 32 characters. Never prefix these values with `NEXT_PUBLIC_`; do not expose or share the password or session secret.

The admin API checks the first two variables and signs an HTTP-only session cookie with the third. The president's Firebase Auth account must use the same email/password, and `firestore.rules` must contain that exact admin email so Firestore grants website-admin access. No `firebase-admin` package, service-account JSON, custom claim, or local claim-setup script is required.

After the first deploy:

1. In Firebase Console, enable **Authentication → Sign-in method → Email/Password** and create the `(default)` **Cloud Firestore** database if it does not exist.
2. Publish the contents of [`firestore.rules`](./firestore.rules) in **Firestore Database → Rules** before inviting schools. Review any existing rules first; publishing replaces the rules currently in that project.
3. In **Authentication → Settings → Authorized domains**, add the production `*.netlify.app` hostname and any custom domain. Use the stable production hostname for sign-in tests; unique deploy-preview hostnames may need to be added separately.
4. Create the admin Auth user and set its claim by following [FIREBASE_ADMIN_SETUP.md](./FIREBASE_ADMIN_SETUP.md).
5. Test registration, approval, school submission, admin review, suspension, and ban/restore on the production URL.

### Netlify request and free-plan limits

Netlify's published [Free plan pricing](https://www.netlify.com/pricing/) currently shows a shared **300-credit limit**. It is not a promise of unlimited hosting or one fixed number of monthly requests. The published usage table currently charges 2 credits per 10,000 web requests, 20 credits per GB of bandwidth, 10 credits per GB-hour of compute, and 15 credits per production deploy. For illustration, if absolutely no credits were used for deploys, compute, or bandwidth, 300 credits at the web-request rate would correspond to 1.5 million web requests; real capacity is lower because all usage draws from the same credit allowance. Plan amounts and pricing can change, so use your Netlify billing dashboard as the authoritative current limit.

Netlify usage is separate from Firebase quotas. Firestore browser reads/writes and live listeners go from each visitor's browser directly to Firebase, so those Firestore operations use Firebase quota, not Netlify function requests. Netlify serves the website and runs its Next.js/server API work (including the admin credential/session endpoints); those requests, bandwidth and compute use Netlify credits. Monitor both Netlify billing/usage and Firebase **Firestore → Usage**.

## School registration, approval, suspension, and bans

New school registration creates a Firebase Auth user and a `schools/{uid}` Firestore document with status `pending`. The registration page tells the teacher that approval is required and signs the account out. The teacher cannot submit entries until an admin changes the status to `active`.

When the teacher tries to sign in while pending, the login page explains that the registration is awaiting approval. After approval, the same email/password works; they do not need a new account. `suspended` and `banned` accounts cannot sign in to the school portal or read/create school submissions. A live school-profile listener signs out an already-open school session when its status is changed. Both blocks are reversible by the website admin: set the school back to `active` to restore access.

Existing school documents are **not** automatically changed by this code update. Review existing records in the admin dashboard and set any accounts that should not yet have access to `pending`, `suspended`, or `banned`.

The admin dashboard can use the school's email link to open the administrator's configured mail app with a message addressed to that school. This is a manual `mailto:` action, not an automatic email. Teachers can also check by attempting to sign in: pending accounts receive the current status message. The app does not currently send transactional email. Automatic delivery needs an email provider and a trusted server-side sender; free-tier availability, sending limits, verification requirements, and card requirements vary, so do not assume it will remain free. Do not put an email-provider secret in browser code.

## Live dashboard updates and Firestore free usage

Signed-in dashboards use Firestore listeners for competitions, school status, schools, and submissions. When a record changes, connected dashboards receive the update without a manual refresh. Listener connections do not have a separate subscription fee, but the initial query and changed documents count as Firestore document reads; reconnects can cause reads again. Every write still counts against the write quota. More frequent live updates therefore use more of the free daily quota than a page that only loads once.

Firestore's currently published free quota includes 50,000 document reads/day, 20,000 writes/day, 20,000 deletes/day, and 1 GiB stored data for a free database (see [Firebase's current quota documentation](https://firebase.google.com/docs/firestore/quotas) for changes and project eligibility). When a Firestore operation reports a quota-exhaustion error, the app displays a service-unavailable page on all routes except `/`; the home page remains available. The app cannot know the quota is exhausted before Firebase rejects an operation. The message is not proof of an exact remaining-read count, and repeated refreshes do not reset quotas.

On the Spark plan, operations beyond the available Firestore quota can be rejected until the quota resets. This is a service interruption rather than a way to continue unlimited free usage. If the project is ever upgraded to a billing plan, review billing alerts and cost controls first.

## Submission links and PDFs

Firestore stores the submitted URL and the admin dashboard opens that link. Keep PDFs and other large student work at a school-approved host that provides a shareable URL, and configure sharing so the intended reviewers can open it. The app does not copy those files into Firebase Storage.

Avoid storing PDF bytes or base64 text in Firestore. A Firestore document is limited to 1 MiB; base64 makes file data roughly one-third larger, consumes database space, and every document read transfers that data again. Firestore is suitable for metadata and links, not large binary files. [Cloud Storage for Firebase currently requires the Blaze billing plan](https://firebase.google.com/docs/storage/faqs-storage-changes-announced-sept-2024), so it is not used for this Spark-only workflow.

## Security and privacy checklist

- Publish `firestore.rules` before accepting real school data. Admin UI checks alone are not security; Firestore Rules enforce the same roles for direct SDK/API requests.
- The rules make competition information readable publicly, limit school profiles to the owner and admin, and limit school submissions to that active school and admin.
- The website admin's Firebase Auth email, configured in Firestore Rules, can read and manage schools, competitions, and submissions through the app. No custom token claim is used. Never give the president's login credentials to teachers.
- Use a unique strong password for the president, deliver it privately, and rotate it if it is shared or exposed. The admin claim is a role flag, not a Firebase Console permission.
- Limit access to Netlify environment variables and Firebase Authentication user management. Keep the president's credentials private and rotate them in both Netlify and Firebase Authentication if they are exposed.
- Student names, birth dates, contacts, school data, and entry links are personal information. Collect only what the event needs and define who may view it and how long to retain it.
