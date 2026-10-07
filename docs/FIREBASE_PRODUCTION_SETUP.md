# Firebase production setup

This application uses Firebase Authentication and **Cloud Firestore**. It does not use Realtime Database or Firebase Storage, and it does not upload entry files.

Follow [FIREBASE_ADMIN_SETUP.md](./FIREBASE_ADMIN_SETUP.md) to create the website president's login, set server-only Netlify credentials, and configure the admin email in Firestore Rules. Follow [PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md) for Netlify deployment, school approval/suspension, live data, privacy, and quota information.

Do not enable open Firestore rules. Before publishing, set the email literal in `isAdmin()` in `firestore.rules` to the exact lowercase email configured as `ADMIN_EMAIL` (the supplied file currently uses `adminsara@scladmin.com`). Firestore Rules cannot read Netlify environment variables, so keep the values synchronized manually. Existing school profiles are not automatically migrated or changed to pending when deploying a new version.
