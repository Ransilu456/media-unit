'use client';

import { createContext, createElement, useCallback, useContext, useState, useEffect, useRef, type ReactNode, } from 'react';
import { usePathname } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import type { Competition, RegisteredSchool, PublicSchool, Submission, AuthSession, SubmissionStatus, NewSubmissionInput, } from './types';
import { validateSubmissionInput } from './validation';
import {
  getFirebaseSession,
  firebaseLoginSchool,
  firebaseLoginAdmin,
  firebaseRegisterSchool,
  firebaseLogout,
  firebaseAddCompetition,
  firebaseUpdateCompetition,
  firebaseDeleteCompetition,
  firebaseUpdateSchoolStatus,
  firebaseSubmitEntry,
  firebaseUpdateSubmission,
  subscribeFirebaseCompetitions,
  subscribeFirebaseSchools,
  subscribeFirebaseSchoolStatus,
  subscribeFirebaseSubmissions,
  subscribeFirebaseNotifications,
  firebaseMarkNotificationRead,
  firebaseClearNotifications,
  type AppNotification,
} from './firebaseOperations';
import { sendDeviceNotification, registerServiceWorker } from './browserNotifications';

const FIRESTORE_CACHE_WAIT_MS = 7000;
const SESSION_ERROR_WAIT_MS = 4000;
const COMPETITIONS_CACHE_TTL_MS = 5 * 60 * 1000;
const COMPETITIONS_SESSION_CACHE_KEY = 'agradhi_public_competitions_v1';

interface CachedCompetitions {
  fetchedAt: number;
  items: Competition[];
}

function clearCachedCompetitions(): void {
  try {
    sessionStorage.removeItem(COMPETITIONS_SESSION_CACHE_KEY);
  } catch (error) {
    console.warn('[competitions session cache removal]', error);
  }
}

function readCachedCompetitions(): CachedCompetitions | null {
  try {
    const cached = sessionStorage.getItem(COMPETITIONS_SESSION_CACHE_KEY);
    if (!cached) return null;

    const parsed = JSON.parse(cached) as Partial<CachedCompetitions>;
    if (
      typeof parsed.fetchedAt !== 'number' ||
      !Array.isArray(parsed.items) ||
      Date.now() - parsed.fetchedAt >= COMPETITIONS_CACHE_TTL_MS ||
      parsed.items.some((item) => !item || typeof item.id !== 'string' || typeof item.title !== 'string')
    ) {
      sessionStorage.removeItem(COMPETITIONS_SESSION_CACHE_KEY);
      return null;
    }

    return parsed as CachedCompetitions;
  } catch (error) {
    console.warn('[competitions session cache]', error);
    return null;
  }
}

export type DashboardNotification = AppNotification;

function useMediaStoreState() {
  const pathname = usePathname();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [schools, setSchools] = useState<RegisteredSchool[]>([]);
  const [publicSchools, setPublicSchools] = useState<PublicSchool[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [session, setSessionState] = useState<AuthSession>({ type: 'guest' });
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCompetitionsLoaded, setIsCompetitionsLoaded] = useState(false);
  const [isSchoolsLoaded, setIsSchoolsLoaded] = useState(false);
  const [isSubmissionsLoaded, setIsSubmissionsLoaded] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [competitionsError, setCompetitionsError] = useState<string | null>(null);
  const [schoolsError, setSchoolsError] = useState<string | null>(null);
  const [submissionsError, setSubmissionsError] = useState<string | null>(null);
  const [sessionRetry, setSessionRetry] = useState(0);
  const [competitionsRetry, setCompetitionsRetry] = useState(0);
  const [schoolsRetry, setSchoolsRetry] = useState(0);
  const [submissionsRetry, setSubmissionsRetry] = useState(0);
  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
  const competitionsServerFetchedAt = useRef(0);
  const knownNotificationIds = useRef<Set<string> | null>(null);

  useEffect(() => {
    void registerServiceWorker();
  }, []);

  const retrySession = useCallback(() => {
    setSessionError(null);
    setIsLoaded(false);
    setSessionRetry((attempt) => attempt + 1);
  }, []);
  const retryCompetitions = useCallback(() => {
    competitionsServerFetchedAt.current = 0;
    if (typeof window !== 'undefined') clearCachedCompetitions();
    setCompetitionsError(null);
    setIsCompetitionsLoaded(false);
    setCompetitionsRetry((attempt) => attempt + 1);
  }, []);
  const retrySchools = useCallback(() => {
    setSchoolsError(null);
    setIsSchoolsLoaded(false);
    setSchoolsRetry((attempt) => attempt + 1);
  }, []);
  const retrySubmissions = useCallback(() => {
    setSubmissionsError(null);
    setIsSubmissionsLoaded(false);
    setSubmissionsRetry((attempt) => attempt + 1);
  }, []);

  const _persistSession = (s: AuthSession) => {
    setSessionState(s);
  };

  useEffect(() => {
    let active = true;
    let authEvent = 0;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const currentEvent = ++authEvent;
      setIsLoaded(false);
      setSchools([]);
      setPublicSchools([]);
      setSubmissions([]);
      setNotifications([]);
      setIsCompetitionsLoaded(false);
      setIsSchoolsLoaded(false);
      setIsSubmissionsLoaded(false);
      setSessionError(null);
      void (async () => {
        let currentSession: AuthSession;
        try {
          currentSession = await getFirebaseSession(user);
        } catch (error) {
          console.warn('[firebase session initialization]', error);
          await new Promise<void>((resolve) => setTimeout(resolve, SESSION_ERROR_WAIT_MS));
          if (active && currentEvent === authEvent) {
            setSessionState({ type: 'guest' });
            setSessionError(error instanceof Error ? error.message : 'Unable to verify your sign-in session.');
            setIsLoaded(true);
          }
          return;
        }

        if (!active || currentEvent !== authEvent) return;
        setSessionState(currentSession);
        setIsLoaded(true);
      })();
    }, (error) => {
      console.warn('[firebase auth session]', error);
      void (async () => {
        await new Promise<void>((resolve) => setTimeout(resolve, SESSION_ERROR_WAIT_MS));
        if (!active) return;
        setSessionState({ type: 'guest' });
        setSessionError(error.message || 'Unable to verify your sign-in session.');
        setIsLoaded(true);
      })();
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [sessionRetry]);

  useEffect(() => {
    if (!sessionError && !competitionsError && !schoolsError && !submissionsError) return;
    const retryFailedLoads = () => {
      if (sessionError) retrySession();
      if (competitionsError) retryCompetitions();
      if (schoolsError) retrySchools();
      if (submissionsError) retrySubmissions();
    };
    window.addEventListener('online', retryFailedLoads);
    return () => window.removeEventListener('online', retryFailedLoads);
  }, [
    competitionsError,
    retryCompetitions,
    retrySchools,
    retrySession,
    retrySubmissions,
    schoolsError,
    sessionError,
    submissionsError,
  ]);

  const isPublicCompetitionRoute = pathname === '/' || pathname === '/competitions';
  const competitionSessionReady = isPublicCompetitionRoute || isLoaded;
  const competitionSessionType = isPublicCompetitionRoute ? 'public' : session.type;
  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');
  const isSchoolDashboard = pathname === '/dashboard' || pathname.startsWith('/dashboard/');
  const needsCompetitions = isPublicCompetitionRoute
    || (isSchoolDashboard && session.type === 'school')
    || (isAdminRoute && session.type === 'admin');

  useEffect(() => {
    if (!needsCompetitions) {
      setIsCompetitionsLoaded(true);
      setCompetitionsError(null);
      return;
    }

    if (typeof window !== 'undefined' && competitionsServerFetchedAt.current === 0) {
      const cached = readCachedCompetitions();
      if (cached) {
        competitionsServerFetchedAt.current = cached.fetchedAt;
        setCompetitions(cached.items);
      }
    }

    if (Date.now() - competitionsServerFetchedAt.current < COMPETITIONS_CACHE_TTL_MS) {
      setIsCompetitionsLoaded(true);
      setCompetitionsError(null);
      return;
    }

    let active = true;
    let cacheTimer: ReturnType<typeof setTimeout> | undefined;
    setIsCompetitionsLoaded(false);
    setCompetitionsError(null);

    const unsubscribe = subscribeFirebaseCompetitions((loadedCompetitions, fromCache) => {
      if (!active) return;
      setCompetitions(loadedCompetitions);
      if (fromCache) {
        if (!cacheTimer) {
          cacheTimer = setTimeout(() => {
            if (!active) return;
            setCompetitionsError(
              'Competition data could not be confirmed with the server. Check your connection and retry.'
            );
            setIsCompetitionsLoaded(true);
          }, FIRESTORE_CACHE_WAIT_MS);
        }
        return;
      }

      competitionsServerFetchedAt.current = Date.now();
      try {
        sessionStorage.setItem(COMPETITIONS_SESSION_CACHE_KEY, JSON.stringify({
          fetchedAt: competitionsServerFetchedAt.current,
          items: loadedCompetitions,
        }));
      } catch (error) {
        console.warn('[competitions session cache write]', error);
      }
      if (cacheTimer) clearTimeout(cacheTimer);
      setCompetitionsError(null);
      setIsCompetitionsLoaded(true);
    }, (error) => {
      console.warn('[firestore competitions listener]', error);
      if (!active) return;
      if (cacheTimer) clearTimeout(cacheTimer);
      setCompetitionsError('Competition data could not be loaded. Check your connection and retry.');
      setIsCompetitionsLoaded(true);
    });

    return () => {
      active = false;
      if (cacheTimer) clearTimeout(cacheTimer);
      unsubscribe();
    };
  }, [
    competitionSessionReady,
    competitionSessionType,
    competitionsRetry,
    isPublicCompetitionRoute,
    needsCompetitions,
    pathname,
  ]);

  useEffect(() => {
    if (!isLoaded) return;

    let active = true;
    const subscriptions: Array<() => void> = [];
    const cacheTimers = new Map<string, ReturnType<typeof setTimeout>>();
    const clearCacheTimer = (key: string) => {
      const timer = cacheTimers.get(key);
      if (timer) clearTimeout(timer);
      cacheTimers.delete(key);
    };
    const handleSnapshotStatus = (
      key: string,
      fromCache: boolean,
      setError: (message: string | null) => void,
      setLoaded: (loaded: boolean) => void,
      message: string
    ) => {
      if (fromCache) {
        if (!cacheTimers.has(key)) {
          cacheTimers.set(key, setTimeout(() => {
            if (!active) return;
            setError(message);
            setLoaded(true);
          }, FIRESTORE_CACHE_WAIT_MS));
        }
        return;
      }
      clearCacheTimer(key);
      setError(null);
      setLoaded(true);
    };
    const handleListenerError = (
      key: string,
      error: Error,
      setError: (message: string | null) => void,
      setLoaded: (loaded: boolean) => void,
      message: string
    ) => {
      console.warn(`[firestore ${key} listener]`, error);
      clearCacheTimer(key);
      if (!active) return;
      setError(message);
      setLoaded(true);
    };
    const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');
    const isSchoolDashboard = pathname === '/dashboard' || pathname.startsWith('/dashboard/');
    const needsAdminData = isAdminRoute && session.type === 'admin';
    const needsSchoolSubmissions = session.type === 'school'
      && Boolean(session.school)
      && (isSchoolDashboard || pathname === '/competitions');
    setIsSchoolsLoaded(!needsAdminData);
    setIsSubmissionsLoaded(!(needsAdminData || needsSchoolSubmissions));
    setSchoolsError(null);
    setSubmissionsError(null);

    if (isAdminRoute && session.type === 'admin') {
      subscriptions.push(
        subscribeFirebaseSchools((loadedSchools, fromCache) => {
          if (!active) return;
          setSchools(loadedSchools);
          setPublicSchools(loadedSchools.map((school) => ({
            id: school.id,
            name: school.name,
            province: school.province,
            district: school.district,
            badgeCode: school.badgeCode,
          })));

          handleSnapshotStatus(
            'schools',
            fromCache,
            setSchoolsError,
            setIsSchoolsLoaded,
            'School data could not be confirmed with the server. Check your connection and retry.'
          );
        }, (error) => {
          handleListenerError(
            'schools',
            error,
            setSchoolsError,
            setIsSchoolsLoaded,
            'School data could not be loaded. Check your connection and retry.'
          );
        })
      );
      subscriptions.push(
        subscribeFirebaseSubmissions(undefined, (loadedSubmissions, fromCache) => {
          if (!active) return;
          setSubmissions(loadedSubmissions);
          handleSnapshotStatus(
            'submissions',
            fromCache,
            setSubmissionsError,
            setIsSubmissionsLoaded,
            'Submission data could not be confirmed with the server. Check your connection and retry.'
          );
        }, (error) => {
          handleListenerError(
            'submissions',
            error,
            setSubmissionsError,
            setIsSubmissionsLoaded,
            'Submission data could not be loaded. Check your connection and retry.'
          );
        })
      );
    } else {
      setSchools((current) => current.length === 0 ? current : []);
      setPublicSchools((current) => current.length === 0 ? current : []);
    }

    if (needsSchoolSubmissions && session.type === 'school' && session.school) {
      if (isSchoolDashboard) {
        subscriptions.push(
          subscribeFirebaseSchoolStatus(
            session.school.id,
            (status, fromCache) => {
              if (!fromCache && status !== 'active') {
                void firebaseLogout().catch((error: unknown) => {
                  console.warn('[school access revocation]', error);
                });
              }
            },
            (error) => console.warn('[firestore school status listener]', error)
          )
        );
      }
      subscriptions.push(
        subscribeFirebaseSubmissions(session.school.id, (loadedSubmissions, fromCache) => {
          if (!active) return;
          setSubmissions(loadedSubmissions);
          handleSnapshotStatus(
            'submissions',
            fromCache,
            setSubmissionsError,
            setIsSubmissionsLoaded,
            'Submission data could not be confirmed with the server. Check your connection and retry.'
          );
        }, (error) => {
          handleListenerError(
            'submissions',
            error,
            setSubmissionsError,
            setIsSubmissionsLoaded,
            'Submission data could not be loaded. Check your connection and retry.'
          );
        })
      );
    } else if (!needsAdminData) {
      setSubmissions((current) => current.length === 0 ? current : []);
    }

    // Subscribe to targeted Firestore notifications
    const currentUser = auth.currentUser;
    const handleIncomingNotifications = (items: AppNotification[]) => {
      if (!active) return;
      if (knownNotificationIds.current !== null) {
        items.forEach((item) => {
          if (!knownNotificationIds.current!.has(item.id) && !item.read) {
            void sendDeviceNotification(item.title, {
              body: item.message,
              tag: item.id,
              url: session.type === 'admin' ? '/admin' : '/dashboard',
            });
          }
        });
      }
      knownNotificationIds.current = new Set(items.map((i) => i.id));
      setNotifications(items);
    };

    if (session.type === 'admin' && currentUser) {
      subscriptions.push(
        subscribeFirebaseNotifications('admin', undefined, handleIncomingNotifications, (err) =>
          console.warn('[firestore notifications listener]', err)
        )
      );
    } else if (session.type === 'school' && session.school?.id && currentUser?.uid === session.school.id) {
      subscriptions.push(
        subscribeFirebaseNotifications('school', session.school.id, handleIncomingNotifications, (err) =>
          console.warn('[firestore notifications listener]', err)
        )
      );
    } else {
      knownNotificationIds.current = null;
      setNotifications([]);
    }

    return () => {
      active = false;
      cacheTimers.forEach((timer) => clearTimeout(timer));
      subscriptions.forEach((stop) => stop());
    };
  }, [isLoaded, pathname, session, schoolsRetry, submissionsRetry]);

  const registerSchool = async ( data: Omit<RegisteredSchool, 'id' | 'registeredAt' | 'badgeCode' | 'status'> ): Promise<RegisteredSchool> => {
    return firebaseRegisterSchool(data);
  };

  const loginSchool = async ( email: string, pass: string ): Promise<RegisteredSchool | null> => {
    const school = await firebaseLoginSchool(email, pass);
    if (!school) return null;

    _persistSession({ type: 'school', school });
    return school;
  };

  const loginAdmin = async (email: string, pass: string): Promise<boolean> => {
    const ok = await firebaseLoginAdmin(email, pass);
    if (!ok) return false;

    _persistSession({ type: 'admin' });

    return true;
  };

  const logout = async () => {
    await firebaseLogout();
    _persistSession({ type: 'guest' });
    setSubmissions([]);
  };

  const markNotificationsRead = () => {
    notifications.forEach((n) => {
      if (!n.read) void firebaseMarkNotificationRead(n.id);
    });
    setNotifications((current) => current.map((notification) => ({ ...notification, read: true })));
  };

  const clearNotifications = () => {
    const target = session.type === 'admin' ? 'admin' : 'school';
    const schoolId = session.type === 'school' ? session.school?.id : undefined;
    void firebaseClearNotifications(target, schoolId);
    setNotifications([]);
  };

  const submitEntry = async ( entry: NewSubmissionInput ): Promise<Submission> => {
    const validationErrors = validateSubmissionInput(entry, competitions);

    if (Object.keys(validationErrors).length > 0) {
      throw new Error(Object.values(validationErrors)[0]);
    }

    const newSub = await firebaseSubmitEntry(entry);
    setSubmissions((prev) => [
      newSub,
      ...prev.filter((submission) => submission.id !== newSub.id),
    ]);
    return newSub;
  };

  const updateSubmissionStatus = async ( id: string, status: SubmissionStatus, score?: number, feedback?: string ): Promise<void> => {
    const existing = submissions.find((s) => s.id === id);
    const context = existing ? { schoolId: existing.schoolId, entryTitle: existing.entryTitle } : undefined;
    await firebaseUpdateSubmission(id, { status, score, judgeFeedback: feedback }, context);

    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status, score: score !== undefined ? score : s.score, judgeFeedback: feedback !== undefined ? feedback : s.judgeFeedback }
          : s
      )
    );
  };

  const updateSchoolStatus = async ( id: string, status: 'active' | 'pending' | 'suspended' | 'banned' ): Promise<void> => {
    await firebaseUpdateSchoolStatus(id, status);
    setSchools((prev) =>
      prev.map((school) => (school.id === id ? { ...school, status } : school))
    );
  };

  const addCompetition = async ( comp: Omit<Competition, 'id'> ): Promise<Competition> => {

    if (competitions.some((existing) => existing.slug === comp.slug)) {
      throw new Error('A competition with this URL slug already exists.');
    }

    const newComp = await firebaseAddCompetition(comp);
    setCompetitions((prev) => [...prev, newComp]);

    return newComp;
  };

  const updateCompetition = async ( id: string, updates: Partial<Omit<Competition, 'id'>> ): Promise<void> => {

    if (updates.slug && competitions.some((existing) => existing.id !== id && existing.slug === updates.slug)) {
      throw new Error('A competition with this URL slug already exists.');
    }

    await firebaseUpdateCompetition(id, updates);
    setCompetitions((prev) =>
      prev.map((comp) => (comp.id === id ? { ...comp, ...updates } : comp))
    );
  };

  const deleteCompetition = async (id: string): Promise<void> => {
    await firebaseDeleteCompetition(id);
    setCompetitions((prev) => prev.filter((comp) => comp.id !== id));
  };

  return {
    isLoaded,
    isCompetitionsLoaded,
    isSchoolsLoaded,
    isSubmissionsLoaded,
    sessionError,
    competitionsError,
    schoolsError,
    submissionsError,
    retrySession,
    retryCompetitions,
    retrySchools,
    retrySubmissions,
    competitions,
    schools,
    publicSchools,
    submissions,
    notifications,
    markNotificationsRead,
    clearNotifications,
    session,
    registerSchool,
    loginSchool,
    loginAdmin,
    logout,
    submitEntry,
    addCompetition,
    updateCompetition,
    deleteCompetition,
    updateSubmissionStatus,
    updateSchoolStatus,
  };
}

type MediaStoreValue = ReturnType<typeof useMediaStoreState>;
const MediaStoreContext = createContext<MediaStoreValue | null>(null);

export function MediaStoreProvider({ children }: { children: ReactNode }) {
  const store = useMediaStoreState();
  return createElement(MediaStoreContext.Provider, { value: store }, children);
}

export function useOptionalMediaStore(): MediaStoreValue | null {
  return useContext(MediaStoreContext);
}

export function useMediaStore(): MediaStoreValue {
  const store = useContext(MediaStoreContext);
  if (!store) {
    throw new Error('useMediaStore must be used inside <MediaStoreProvider>');
  }
  return store;
}
