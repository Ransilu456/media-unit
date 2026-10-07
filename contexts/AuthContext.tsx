'use client';

/**
 * AuthContext — wraps the application to expose session state globally.
 *
 * Features:
 *  • Session resolved from Firebase Auth and Firestore
 *  • Rate-limit guard: tracks failed login attempts in memory.
 *    After MAX_ATTEMPTS consecutive failures within WINDOW_MS the context
 *    surfaces a `rateLimited` flag + remaining cooldown seconds so the UI
 *    can render a friendly UX instead of a raw error.
 *  • Persists analytics ping to Firebase on successful login.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { logEvent } from 'firebase/analytics';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { auth, getFirebaseAnalytics } from '@/lib/firebase';
import { getFirebaseSession } from '@/lib/firebaseOperations';
import type { AuthSession } from '@/lib/types';

// ─── Constants ────────────────────────────────────────────────────────────────
/** Max failed attempts before showing the rate-limit cooldown screen */
const MAX_ATTEMPTS = 5;
/** Sliding window in ms (5 minutes) */
const WINDOW_MS = 5 * 60 * 1000;
/** Cooldown duration in seconds (2 minutes) */
const COOLDOWN_SECS = 2 * 60;

// ─── Types ────────────────────────────────────────────────────────────────────
export interface AuthContextValue {
  /** Current session from the server cookie */
  session: AuthSession;
  /** Firebase authenticated user */
  firebaseUser: FirebaseUser | null;
  /** True while the initial session hydration is in progress */
  loading: boolean;
  /** True when the rate-limit has been triggered */
  rateLimited: boolean;
  /** Seconds remaining on the current cooldown (0 when not rate-limited) */
  cooldownRemaining: number;
  /**
   * Call after a failed login attempt. Increments the attempt counter.
   * Returns `true` if the user is now rate-limited.
   */
  recordFailedAttempt: () => boolean;
  /** Call after a successful login so the counter resets */
  recordSuccess: (role: 'school' | 'admin') => void;
  /** Refresh the session from the server (e.g. after logout) */
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession>({ type: 'guest' });
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [rateLimited, setRateLimited] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  // Firebase Auth is the persisted identity; Firestore provides the school profile.
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        for (const key of [
          'agradhi_client_session_v1',
          'agradhi_demo_schools_v1',
          'agradhi_demo_submissions_v1',
          'agradhi_demo_competitions_v1',
        ]) {
          localStorage.removeItem(key);
        }
      }
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setFirebaseUser(user);
        void getFirebaseSession(user)
          .then(setSession)
          .catch((error: unknown) => {
            console.warn('[firebase session]', error);
            setSession({ type: 'guest' });
          })
          .finally(() => setLoading(false));
      });
      return () => unsubscribe();
    } catch (err) {
      console.warn('[firebase auth]', err);
    }
  }, []);

  // Attempt timestamps stored in a ref to avoid re-renders
  const attempts = useRef<number[]>([]);
  const cooldownTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const cooldownEnd = useRef<number>(0);

  // ── Firebase session refresh ──────────────────────────────────────────────
  const refreshSession = useCallback(async () => {
    try {
      setSession(await getFirebaseSession());
    } catch {
      setSession({ type: 'guest' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  // ── Cooldown ticker ────────────────────────────────────────────────────────
  const startCooldown = useCallback(() => {
    if (cooldownTimer.current) clearInterval(cooldownTimer.current);
    cooldownEnd.current = Date.now() + COOLDOWN_SECS * 1000;
    setRateLimited(true);
    setCooldownRemaining(COOLDOWN_SECS);

    cooldownTimer.current = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((cooldownEnd.current - Date.now()) / 1000));
      setCooldownRemaining(remaining);
      if (remaining === 0) {
        setRateLimited(false);
        attempts.current = [];
        if (cooldownTimer.current) clearInterval(cooldownTimer.current);
        cooldownTimer.current = null;
      }
    }, 1000);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cooldownTimer.current) clearInterval(cooldownTimer.current);
    };
  }, []);

  // ── Attempt tracking ───────────────────────────────────────────────────────
  const recordFailedAttempt = useCallback((): boolean => {
    const now = Date.now();
    // Slide the window — drop old attempts
    attempts.current = attempts.current.filter((t) => now - t < WINDOW_MS);
    attempts.current.push(now);

    if (attempts.current.length >= MAX_ATTEMPTS) {
      startCooldown();
      return true;
    }
    return false;
  }, [startCooldown]);

  const recordSuccess = useCallback(async (role: 'school' | 'admin') => {
    attempts.current = [];
    setRateLimited(false);
    setCooldownRemaining(0);
    if (cooldownTimer.current) {
      clearInterval(cooldownTimer.current);
      cooldownTimer.current = null;
    }

    // Fire analytics event (best-effort)
    try {
      const analytics = await getFirebaseAnalytics();
      if (analytics) {
        logEvent(analytics, 'login', { method: role });
      }
    } catch {
      // Analytics is non-critical
    }
  }, []);

  const value: AuthContextValue = {
    session,
    firebaseUser,
    loading,
    rateLimited,
    cooldownRemaining,
    recordFailedAttempt,
    recordSuccess,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ──────────────────────────────────────────────────────────────────────
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}
