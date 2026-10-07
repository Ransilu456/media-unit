'use client';

import {
  createContext,
  createElement,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
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

// ─── Main media store hook powered by Firebase ───────────────────────────────

function useMediaStoreState() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [schools, setSchools] = useState<RegisteredSchool[]>([]);
  const [publicSchools, setPublicSchools] = useState<PublicSchool[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [session, setSessionState] = useState<AuthSession>({ type: 'guest' });
  const [isLoaded, setIsLoaded] = useState(false);

  const _persistSession = (s: AuthSession) => {
    setSessionState(s);
  };

  // Firebase Auth is the session source; Firestore supplies the user profile.
  useEffect(() => {
    let active = true;
    let authEvent = 0;
    let subscriptions: Array<() => void> = [];
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const currentEvent = ++authEvent;
      subscriptions.forEach((stop) => stop());
      subscriptions = [];
      setIsLoaded(false);
      setSchools([]);
      setPublicSchools([]);
      setSubmissions([]);
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
        subscriptions.push(
          subscribeFirebaseCompetitions((loadedCompetitions) => {
            if (!active || currentEvent !== authEvent) return;
            setCompetitions(loadedCompetitions);
          }, (error) => console.warn('[firestore competitions listener]', error))
        );

        if (currentSession.type === 'admin') {
          subscriptions.push(
            subscribeFirebaseSchools((loadedSchools) => {
              if (!active || currentEvent !== authEvent) return;
              setSchools(loadedSchools);
              setPublicSchools(loadedSchools.map((school) => ({
                id: school.id,
                name: school.name,
                province: school.province,
                district: school.district,
                badgeCode: school.badgeCode,
              })));
            }, (error) => console.warn('[firestore schools listener]', error))
          );
          subscriptions.push(
            subscribeFirebaseSubmissions(undefined, (loadedSubmissions) => {
              if (active && currentEvent === authEvent) setSubmissions(loadedSubmissions);
            }, (error) => console.warn('[firestore submissions listener]', error))
          );
        } else if (currentSession.type === 'school' && currentSession.school) {
          subscriptions.push(
            subscribeFirebaseSchoolStatus(
              currentSession.school.id,
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
          subscriptions.push(
            subscribeFirebaseSubmissions(currentSession.school.id, (loadedSubmissions) => {
              if (active && currentEvent === authEvent) setSubmissions(loadedSubmissions);
            }, (error) => console.warn('[firestore submissions listener]', error))
          );
        }
        setIsLoaded(true);
      })();
    });

    return () => {
      active = false;
      subscriptions.forEach((stop) => stop());
      unsubscribe();
    };
  }, []);

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
    competitions,
    schools,
    publicSchools,
    submissions,
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
