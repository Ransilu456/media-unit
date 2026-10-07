import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { initializeFirestore, getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import type { Analytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export const app: FirebaseApp =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const firebaseApp: FirebaseApp = app;

// Firebase services
export const auth: Auth = getAuth(app);

/**
 * Use long-polling instead of gRPC WebSocket streams.
 * Fixes IPv6 / WSA timeout errors on restrictive networks (e.g. ISPs that
 * block Google's gRPC endpoint 2001:4860:4844::/48).
 * initializeFirestore must be called before any getFirestore() call.
 */
export const db: Firestore = (() => {
  try {
    return initializeFirestore(app, {
      experimentalForceLongPolling: true,
      experimentalAutoDetectLongPolling: false,
    });
  } catch {
    // Already initialized (hot-reload), fall back to existing instance
    return getFirestore(app);
  }
})();

export const storage: FirebaseStorage = getStorage(app);

// Lazy analytics — only loaded in the browser
let _analytics: Analytics | null = null;

export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window === 'undefined') return null;
  if (_analytics) return _analytics;
  try {
    const { getAnalytics, isSupported } = await import('firebase/analytics');
    const supported = await isSupported();
    if (!supported) return null;
    _analytics = getAnalytics(app);
    return _analytics;
  } catch {
    return null;
  }
}

export default app;
