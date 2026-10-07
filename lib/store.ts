'use client';

import { useState, useEffect, useCallback } from 'react';
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
import { INITIAL_COMPETITIONS } from './constants';
import { validateSubmissionInput } from './validation';
import {
  getFirebaseSession,
  firebaseLoginSchool,
  firebaseLoginAdmin,
  firebaseRegisterSchool,
  firebaseLogout,
  firebaseGetCompetitions,
  firebaseAddCompetition,
  firebaseUpdateCompetition,
  firebaseDeleteCompetition,
  firebaseGetSchools,
  firebaseUpdateSchoolStatus,
  firebaseGetSubmissions,
  firebaseSubmitEntry,
  firebaseUpdateSubmission,
} from './firebaseOperations';

// ─── Main media store hook powered by Firebase ───────────────────────────────

export function useMediaStore() {
  const [competitions, setCompetitions] = useState<Competition[]>(INITIAL_COMPETITIONS);
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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const currentEvent = ++authEvent;
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
        const [compsResult, schoolsResult, submissionsResult] = await Promise.allSettled([
          firebaseGetCompetitions(),
          currentSession.type === 'admin' ? firebaseGetSchools() : Promise.resolve([]),
          firebaseGetSubmissions(
            currentSession.type === 'school' ? currentSession.school?.id : undefined
          ),
        ]);
        if (!active || currentEvent !== authEvent) return;
        if (compsResult.status === 'fulfilled') setCompetitions(compsResult.value);
        else console.warn('[firestore competitions]', compsResult.reason);
        if (schoolsResult.status === 'fulfilled') {
          const loadedSchools = schoolsResult.value;
          setSchools(loadedSchools);
          setPublicSchools(loadedSchools.map((school) => ({
            id: school.id,
            name: school.name,
            province: school.province,
            district: school.district,
            badgeCode: school.badgeCode,
          })));
        } else console.warn('[firestore schools]', schoolsResult.reason);
        if (submissionsResult.status === 'fulfilled') setSubmissions(submissionsResult.value);
        else console.warn('[firestore submissions]', submissionsResult.reason);

        if (active && currentEvent === authEvent) {
          setIsLoaded(true);
        }
      })();
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  // ── Actions ────────────────────────────────────────────────────────────────

  const registerSchool = async (
    data: Omit<RegisteredSchool, 'id' | 'registeredAt' | 'badgeCode' | 'status'>
  ): Promise<RegisteredSchool> => {
    const school = await firebaseRegisterSchool(data);
    _persistSession({ type: 'school', school });
    setSchools((prev) => [school, ...prev]);
    setPublicSchools((prev) => [
      {
        id: school.id,
        name: school.name,
        province: school.province,
        district: school.district,
        badgeCode: school.badgeCode,
      },
      ...prev,
    ]);
    return school;
  };

  const loginSchool = async (
    email: string,
    pass: string
  ): Promise<RegisteredSchool | null> => {
    const school = await firebaseLoginSchool(email, pass);
    if (!school) return null;

    _persistSession({ type: 'school', school });
    const userSubs = await firebaseGetSubmissions(school.id);
    setSubmissions(userSubs);
    return school;
  };

  const loginAdmin = async (email: string, pass: string): Promise<boolean> => {
    const ok = await firebaseLoginAdmin(email, pass);
    if (!ok) return false;

    _persistSession({ type: 'admin' });

    // Non-blocking fetch of all schools and submissions
    void Promise.all([
      firebaseGetSchools(),
      firebaseGetSubmissions(),
    ]).then(([allSchools, allSubs]) => {
      setSchools(allSchools);
      setSubmissions(allSubs);
    }).catch((err) => {
      console.warn('[admin post-login data load]', err);
    });

    return true;
  };

  const logout = async () => {
    await firebaseLogout();
    _persistSession({ type: 'guest' });
    setSubmissions([]);
  };

  const refreshSubmissions = useCallback(async () => {
    const currentSession = await getFirebaseSession();
    const schoolId = currentSession.type === 'school' ? currentSession.school?.id : undefined;
    const subs = await firebaseGetSubmissions(schoolId);
    setSubmissions(subs);
  }, []);

  const submitEntry = async (
    entry: NewSubmissionInput
  ): Promise<Submission> => {
    const validationErrors = validateSubmissionInput(entry, competitions);
    if (Object.keys(validationErrors).length > 0) {
      throw new Error(Object.values(validationErrors)[0]);
    }

    const newSub = await firebaseSubmitEntry(entry);
    setSubmissions((prev) => [newSub, ...prev]);
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
    status: 'active' | 'pending' | 'suspended'
  ): Promise<void> => {
    await firebaseUpdateSchoolStatus(id, status);
    setSchools((prev) =>
      prev.map((school) => (school.id === id ? { ...school, status } : school))
    );
  };

  const addCompetition = async (
    comp: Omit<Competition, 'id'>
  ): Promise<Competition> => {
    const newComp = await firebaseAddCompetition(comp);
    setCompetitions((prev) => [...prev, newComp]);
    return newComp;
  };

  const updateCompetition = async (
    id: string,
    updates: Partial<Omit<Competition, 'id'>>
  ): Promise<void> => {
    await firebaseUpdateCompetition(id, updates);
    setCompetitions((prev) =>
      prev.map((comp) => (comp.id === id ? { ...comp, ...updates } : comp))
    );
  };

  const deleteCompetition = async (id: string): Promise<void> => {
    await firebaseDeleteCompetition(id);
    setCompetitions((prev) => prev.filter((comp) => comp.id !== id));
  };

  const resetToDefaults = () => {
    return logout();
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
    refreshSubmissions,
    submitEntry,
    addCompetition,
    updateCompetition,
    deleteCompetition,
    updateSubmissionStatus,
    updateSchoolStatus,
    resetToDefaults,
  };
}
