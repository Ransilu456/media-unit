# Firebase authentication and application access

## School accounts

Firebase Authentication verifies school email/password logins. A school profile is stored at `schools/{Firebase UID}` in Cloud Firestore. New school profiles are `pending`; an active profile is required to use the school dashboard and submit entries. Suspended and banned profiles are blocked, and the website admin can reinstate them by setting the status to `active`.

While signed in, a school can read only its own profile and submissions. Firestore Rules enforce this boundary independently of the UI. Status changes are delivered to the connected school dashboard, which signs that school out if access is suspended or banned.

## Website administrator

The president is the administrator of this website, not a Firebase Console administrator. The server-side `/api/admin/login` route checks the submitted credentials against `ADMIN_EMAIL` and `ADMIN_PASSWORD`, then issues a signed, HTTP-only session cookie. The same email/password account must also exist in Firebase Authentication so the website can access Firestore as that user.

No Firestore read, Firebase Admin SDK, service-account key, or `admin: true` custom claim is used to check whether the supplied credentials match the website's admin credentials. Firestore Rules separately authorize the exact admin email for data operations. Set a private `SESSION_SECRET` of at least 32 characters in the server environment. The three variables must remain server-only; never prefix them with `NEXT_PUBLIC_`.

## Firestore Rules

Publish [`firestore.rules`](./firestore.rules) in Firebase Console → Firestore Database → Rules after setting the email literal in `isAdmin()` to the exact lowercase admin email from `ADMIN_EMAIL` (the supplied file currently uses `adminsara@scladmin.com`). Firestore Rules cannot read Netlify environment variables, so keep this email synchronized manually. Rules allow public reads of competition listings, school users to read their own profile and active-school submissions, and the configured admin email to manage schools, competitions and submissions. New school documents must be created with `pending` status.

Review existing rules before publishing because publishing replaces the current rules. Do not use open rules such as `allow read, write: if true`.

## Live data, quotas, and entry files

Authenticated dashboard screens listen for Firestore changes. Firestore listeners provide live updates but count document reads, including their initial query and documents changed while connected. Reconnects can cause additional reads.

When Firestore reports quota exhaustion, the app shows a service-unavailable page on routes other than the home page. The home page remains available; reloading repeatedly does not reset a Firestore quota.

The application does not upload PDFs or other files. A teacher should upload entry files to a school-approved cloud drive, set appropriate reviewer access, and paste the share link into the submission form. The URL and submission details are stored in Firestore.

For Netlify setup, the admin account, school approval, and operational guidance, see [`PRODUCTION_DEPLOYMENT.md`](./PRODUCTION_DEPLOYMENT.md) and [`FIREBASE_ADMIN_SETUP.md`](./FIREBASE_ADMIN_SETUP.md).
