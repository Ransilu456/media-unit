# Netlify and Firebase deployment

Use [PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md) for the current Netlify Next.js deployment steps, Firebase environment variables, website-admin setup, and school workflows.

Use [FIREBASE_ADMIN_SETUP.md](./FIREBASE_ADMIN_SETUP.md) for the exact distinction between the president's website-admin login and Firebase Console access. Use [firestore.rules](./firestore.rules) as the Firestore access-control starting point after replacing the admin-email placeholder.

Do not use an old static-export, open-rules, demo-data sync, or Firebase Storage instruction. The current website uses Next.js on Netlify and Firestore for records; it stores entry links, not uploaded files.
