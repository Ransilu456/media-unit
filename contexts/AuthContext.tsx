'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState, } from 'react';
import { logEvent } from 'firebase/analytics';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { auth, getFirebaseAnalytics } from '@/lib/firebase';

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 5 * 60 * 1000; // 5min
const COOLDOWN_SECS = 2 * 60; // 2sec

export interface AuthContextValue {
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  rateLimited: boolean;
  cooldownRemaining: number;
  recordFailedAttempt: () => boolean;
  recordSuccess: (role: 'school' | 'admin') => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [rateLimited, setRateLimited] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

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
        setLoading(false);
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

  const recordFailedAttempt = useCallback((): boolean => {
    const now = Date.now();
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

    try {
      const analytics = await getFirebaseAnalytics();
      if (analytics) {
        logEvent(analytics, 'login', { method: role });
      }
    } catch {
      //  non-critical
    }
  }, []);

  const value: AuthContextValue = {
    firebaseUser,
    loading,
    rateLimited,
    cooldownRemaining,
    recordFailedAttempt,
    recordSuccess,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}
