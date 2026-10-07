'use client';

import {
  createContext,
  createElement,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import { usePathname } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import type {
  Competition,
  RegisteredSchool,
  PublicSchool,
  Submission,
  AuthSession,
  SubmissionStatus,
  NewSubmissionInput,
} from './types';
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
} from './firebaseOperations';

export interface DashboardNotification {
  id: string;
  kind: 'registration' | 'submission' | 'update';
  title: string;
  message: string;
  createdAt: number;
  read: boolean;
}

// ─── Main media store hook powered by Firebase ───────────────────────────────

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
  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);

  const _persistSession = (s: AuthSession) => {
    setSessionState(s);
  };

  // Firebase Auth is the session source; Firestore supplies the user profile.
  useEffect(() => {
    let active = true;
    let authEvent = 0;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const currentEvent = ++authEvent;
      setIsLoaded(false);
      setCompetitions([]);
      setSchools([]);
      setPublicSchools([]);
      setSubmissions([]);
      setNotifications([]);
      setIsCompetitionsLoaded(false);
      setIsSchoolsLoaded(false);
      setIsSubmissionsLoaded(false);
      void (async () => {
        let currentSession: AuthSession;
        try {
          currentSession = await getFirebaseSession(user);
        } catch (error) {
          console.warn('[firebase session initialization]', error);
          if (active && currentEvent === authEvent) setSessionState({ type: 'guest' });
          if (active && currentEvent === authEvent) setIsLoaded(true);
          return;
        }

        if (!active || currentEvent !== authEvent) return;
        setSessionState(currentSession);
        setIsLoaded(true);
      })();
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    let active = true;
    const subscriptions: Array<() => void> = [];
    const notify = (notification: DashboardNotification) => {
      setNotifications((current) => {
        if (current.some((item) => item.id === notification.id)) return current;
        return [notification, ...current].slice(0, 30);
      });
    };
    const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');
    const isSchoolDashboard = pathname === '/dashboard' || pathname.startsWith('/dashboard/');
    const isCompetitionPage = pathname === '/' || pathname === '/competitions';
    const needsCompetitions = isCompetitionPage
      || (isSchoolDashboard && session.type === 'school')
      || (isAdminRoute && session.type === 'admin');
    const needsAdminData = isAdminRoute && session.type === 'admin';
    const needsSchoolSubmissions = session.type === 'school'
      && Boolean(session.school)
      && (isSchoolDashboard || pathname === '/competitions');
    setIsCompetitionsLoaded(!needsCompetitions);
    setIsSchoolsLoaded(!needsAdminData);
    setIsSubmissionsLoaded(!(needsAdminData || needsSchoolSubmissions));

    if (needsCompetitions) {
      subscriptions.push(
        subscribeFirebaseCompetitions((loadedCompetitions) => {
          if (!active) return;
          setCompetitions(loadedCompetitions);
          setIsCompetitionsLoaded(true);
        }, (error) => {
          console.warn('[firestore competitions listener]', error);
          if (active) setIsCompetitionsLoaded(true);
        })
      );
    } else {
      setCompetitions((current) => current.length === 0 ? current : []);
    }

    if (isAdminRoute && session.type === 'admin') {
      let knownSchoolIds: Set<string> | null = null;
      subscriptions.push(
        subscribeFirebaseSchools((loadedSchools, fromCache) => {
          if (!active) return;
          if (!fromCache && knownSchoolIds) {
            loadedSchools
              .filter((school) => !knownSchoolIds?.has(school.id))
              .forEach((school) => notify({
                id: `registration:${school.id}`,
                kind: 'registration',
                title: 'New school registration',
                message: `${school.name} has registered and is awaiting review.`,
                createdAt: Date.now(),
                read: false,
              }));
          }
          if (!fromCache) knownSchoolIds = new Set(loadedSchools.map((school) => school.id));
          setSchools(loadedSchools);
          setPublicSchools(loadedSchools.map((school) => ({
            id: school.id,
            name: school.name,
            province: school.province,
            district: school.district,
            badgeCode: school.badgeCode,
          })));
          setIsSchoolsLoaded(true);
        }, (error) => {
          console.warn('[firestore schools listener]', error);
          if (active) setIsSchoolsLoaded(true);
        })
      );
      let knownSubmissions: Map<string, Submission> | null = null;
      subscriptions.push(
        subscribeFirebaseSubmissions(undefined, (loadedSubmissions, fromCache) => {
          if (!active) return;
          if (!fromCache && knownSubmissions) {
            loadedSubmissions.forEach((submission) => {
              const previous = knownSubmissions?.get(submission.id);
              if (!previous) {
                notify({
                  id: `submission:${submission.id}`,
                  kind: 'submission',
                  title: 'New competition submission',
                  message: `${submission.schoolName} submitted “${submission.entryTitle}”.`,
                  createdAt: Date.now(),
                  read: false,
                });
              }
            });
          }
          if (!fromCache) {
            knownSubmissions = new Map(loadedSubmissions.map((submission) => [submission.id, submission]));
          }
          setSubmissions(loadedSubmissions);
          setIsSubmissionsLoaded(true);
        }, (error) => {
          console.warn('[firestore submissions listener]', error);
          if (active) setIsSubmissionsLoaded(true);
        })
      );
    } else {
      setSchools((current) => current.length === 0 ? current : []);
      setPublicSchools((current) => current.length === 0 ? current : []);
    }

    if (needsSchoolSubmissions && session.type === 'school' && session.school) {
      let knownSchoolSubmissions: Map<string, Submission> | null = null;
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
          if (!fromCache && knownSchoolSubmissions) {
            loadedSubmissions.forEach((submission) => {
              const previous = knownSchoolSubmissions?.get(submission.id);
              if (!previous) {
                notify({
                  id: `submission:${submission.id}`,
                  kind: 'submission',
                  title: 'Entry received',
                  message: `“${submission.entryTitle}” was submitted to ${submission.competitionTitle}.`,
                  createdAt: Date.now(),
                  read: false,
                });
                return;
              }

              if (
                previous.status !== submission.status
                || previous.score !== submission.score
                || previous.judgeFeedback !== submission.judgeFeedback
              ) {
                const updateKey = [
                  submission.id,
                  submission.status,
                  submission.score ?? '',
                  submission.judgeFeedback ?? '',
                ].join(':');
                const createdAt = Date.now();
                notify({
                  id: `review:${updateKey}:${createdAt}`,
                  kind: 'update',
                  title: 'Entry review updated',
                  message: `“${submission.entryTitle}” is now ${submission.status.replaceAll('_', ' ')}${submission.score !== undefined ? ` with a score of ${submission.score}` : ''}${submission.judgeFeedback ? `. ${submission.judgeFeedback}` : ''}.`,
                  createdAt,
                  read: false,
                });
              }
            });
          }
          if (!fromCache) {
            knownSchoolSubmissions = new Map(loadedSubmissions.map((submission) => [submission.id, submission]));
          }
          setSubmissions(loadedSubmissions);
          setIsSubmissionsLoaded(true);
        }, (error) => {
          console.warn('[firestore submissions listener]', error);
          if (active) setIsSubmissionsLoaded(true);
        })
      );
    } else if (!needsAdminData) {
      setSubmissions((current) => current.length === 0 ? current : []);
    }

    return () => {
      active = false;
      subscriptions.forEach((stop) => stop());
    };
  }, [isLoaded, pathname, session]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const registerSchool = async (
    data: Omit<RegisteredSchool, 'id' | 'registeredAt' | 'badgeCode' | 'status'>
  ): Promise<RegisteredSchool> => {
    return firebaseRegisterSchool(data);
  };

  const loginSchool = async (
    email: string,
    pass: string
  ): Promise<RegisteredSchool | null> => {
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
    setNotifications((current) => current.map((notification) => ({ ...notification, read: true })));
  };

  const clearNotifications = () => setNotifications([]);

  const submitEntry = async (
    entry: NewSubmissionInput
  ): Promise<Submission> => {
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

  const updateSubmissionStatus = async (
    id: string,
    status: SubmissionStatus,
    score?: number,
    feedback?: string
  ): Promise<void> => {
    await firebaseUpdateSubmission(id, {
      status,
      score,
      judgeFeedback: feedback,
    });

    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status, score: score !== undefined ? score : s.score, judgeFeedback: feedback !== undefined ? feedback : s.judgeFeedback }
          : s
      )
    );
  };

  const updateSchoolStatus = async (
    id: string,
    status: 'active' | 'pending' | 'suspended' | 'banned'
  ): Promise<void> => {
    await firebaseUpdateSchoolStatus(id, status);
    setSchools((prev) =>
      prev.map((school) => (school.id === id ? { ...school, status } : school))
    );
  };

  const addCompetition = async (
    comp: Omit<Competition, 'id'>
  ): Promise<Competition> => {
    if (competitions.some((existing) => existing.slug === comp.slug)) {
      throw new Error('A competition with this URL slug already exists.');
    }
    const newComp = await firebaseAddCompetition(comp);
    setCompetitions((prev) => [...prev, newComp]);
    return newComp;
  };

  const updateCompetition = async (
    id: string,
    updates: Partial<Omit<Competition, 'id'>>
  ): Promise<void> => {
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

export function useMediaStore(): MediaStoreValue {
  const store = useContext(MediaStoreContext);
  if (!store) {
    throw new Error('useMediaStore must be used inside <MediaStoreProvider>');
  }
  return store;
}
