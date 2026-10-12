import { cert, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const [email, ...extraArgs] = process.argv.slice(2);
if (!email || extraArgs.length > 0 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error('Usage: node --env-file=.env.local tools/set-admin-claim.mjs <admin-email>');
  process.exit(1);
}

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
if (!serviceAccountJson) {
  console.error('FIREBASE_SERVICE_ACCOUNT_JSON is not set.');
  process.exit(1);
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(serviceAccountJson);
} catch {
  console.error('FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON.');
  process.exit(1);
}

if (serviceAccount.type !== 'service_account' || !serviceAccount.project_id || !serviceAccount.private_key) {
  console.error('FIREBASE_SERVICE_ACCOUNT_JSON is not a valid service-account key.');
  process.exit(1);
}

const app = initializeApp({
  credential: cert(serviceAccount),
  projectId: serviceAccount.project_id,
}, `admin-claim-assignment-${process.pid}`);

try {
  const auth = getAuth(app);
  const user = await auth.getUserByEmail(email.trim());
  await auth.setCustomUserClaims(user.uid, {
    ...user.customClaims,
    admin: true,
  });
  console.log(`Admin claim assigned to Firebase user ${user.uid}.`);
  console.log('The user must sign out and sign in again for the new claim to take effect.');
} catch (error) {
  console.error('Unable to assign the admin claim:', error instanceof Error ? error.message : 'Unknown error.');
  process.exitCode = 1;
} finally {
  await app.delete();
}
