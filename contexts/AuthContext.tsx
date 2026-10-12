'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState, } from 'react';
import { logEvent } from 'firebase/analytics';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { auth, getFirebaseAnalytics } from '@/lib/firebase';

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 5 * 60 * 1000; // 5min
const COOLDOWN_SECS = 2 * 60;
const ATTEMPT_STORAGE_KEY = 'agradhi_login_attempts_v1';

interface StoredLoginAttempts {
  attempts: number[];
  cooldownEnd: number;
}

export interface AuthContextValue {
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  rateLimited: boolean;
  cooldownRemaining: number;
  rateLimitInitialized: boolean;
  recordFailedAttempt: () => boolean;
  recordSuccess: (role: 'school' | 'admin') => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [rateLimited, setRateLimited] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [rateLimitInitialized, setRateLimitInitialized] = useState(false);

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
  const persistAttempts = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(ATTEMPT_STORAGE_KEY, JSON.stringify({
        attempts: attempts.current,
        cooldownEnd: cooldownEnd.current,
      } satisfies StoredLoginAttempts));
    } catch (error) {
      console.warn('[login rate limit] Unable to persist attempt state.', error);
    }
  }, []);

  const clearCooldown = useCallback(() => {
    if (cooldownTimer.current) clearInterval(cooldownTimer.current);
    cooldownEnd.current = 0;
    setRateLimited(false);
    setCooldownRemaining(0);
    attempts.current = [];
    persistAttempts();
    cooldownTimer.current = null;
  }, [persistAttempts]);

  const startCooldown = useCallback((endTime = Date.now() + COOLDOWN_SECS * 1000) => {
    if (cooldownTimer.current) clearInterval(cooldownTimer.current);
    cooldownEnd.current = endTime;
    setRateLimited(true);
    setCooldownRemaining(Math.max(0, Math.ceil((endTime - Date.now()) / 1000)));
    persistAttempts();
    cooldownTimer.current = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((cooldownEnd.current - Date.now()) / 1000));
      setCooldownRemaining(remaining);
      if (remaining === 0) {
        clearCooldown();
      }
    }, 1000);
  }, [clearCooldown, persistAttempts]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(ATTEMPT_STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (
          typeof parsed === 'object' &&
          parsed !== null &&
          'attempts' in parsed &&
          Array.isArray(parsed.attempts) &&
          parsed.attempts.every((attempt) => typeof attempt === 'number' && Number.isFinite(attempt)) &&
          'cooldownEnd' in parsed &&
          typeof parsed.cooldownEnd === 'number' &&
          Number.isFinite(parsed.cooldownEnd)
        ) {
          const state = parsed as StoredLoginAttempts;
          const now = Date.now();
          attempts.current = state.attempts.filter((attempt) => now - attempt < WINDOW_MS);
          if (state.cooldownEnd > now) {
            startCooldown(state.cooldownEnd);
          } else {
            cooldownEnd.current = 0;
            persistAttempts();
          }
        } else {
          window.localStorage.removeItem(ATTEMPT_STORAGE_KEY);
        }
      }
    } catch (error) {
      console.warn('[login rate limit] Unable to restore attempt state.', error);
      attempts.current = [];
      cooldownEnd.current = 0;
    } finally {
      setRateLimitInitialized(true);
    }
  }, [persistAttempts, startCooldown]);

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
    persistAttempts();
    return false;
  }, [persistAttempts, startCooldown]);

  const recordSuccess = useCallback(async (role: 'school' | 'admin') => {
    clearCooldown();

    try {
      const analytics = await getFirebaseAnalytics();
      if (analytics) {
        logEvent(analytics, 'login', { method: role });
      }
    } catch {
      //  non-critical
    }
  }, [clearCooldown]);

  const value: AuthContextValue = {
    firebaseUser,
    loading,
    rateLimited,
    cooldownRemaining,
    rateLimitInitialized,
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
