import 'server-only';
import { cert, getApps, initializeApp, type App, type ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function getFirebaseAdminApp(): App {
  const existingApp = getApps().find((firebaseApp) => firebaseApp.name === 'agradhi-server');
  if (existingApp) return existingApp;

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is not configured.');
  }

  const serviceAccount = JSON.parse(serviceAccountJson) as ServiceAccount & { project_id?: string };
  return initializeApp({
    credential: cert(serviceAccount),
    projectId: serviceAccount.projectId ?? serviceAccount.project_id,
  }, 'agradhi-server');
}

export function getFirebaseAdminAuth() {
  return getAuth(getFirebaseAdminApp());
}

export function getFirebaseAdminFirestore() {
  return getFirestore(getFirebaseAdminApp());
}