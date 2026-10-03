'use client';

import { useState, useEffect } from 'react';
import {
  Competition,
  RegisteredSchool,
  Submission,
  AuthSession,
  SubmissionStatus,
} from './types';
import {
  INITIAL_COMPETITIONS,
  INITIAL_SCHOOLS,
  INITIAL_SUBMISSIONS,
} from './constants';

const STORAGE_KEYS = {
  COMPETITIONS: 'agradhi_competitions_v1',
  SCHOOLS: 'agradhi_schools_v1',
  SUBMISSIONS: 'agradhi_submissions_v1',
  SESSION: 'agradhi_auth_session_v1',
};

export function getStoredData<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

export function setStoredData<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage write error', e);
  }
}

export function useMediaStore() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [schools, setSchools] = useState<RegisteredSchool[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [session, setSession] = useState<AuthSession>({ type: 'guest' });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const comps = getStoredData<Competition[]>(STORAGE_KEYS.COMPETITIONS, INITIAL_COMPETITIONS);
    const schs = getStoredData<RegisteredSchool[]>(STORAGE_KEYS.SCHOOLS, INITIAL_SCHOOLS);
    const subs = getStoredData<Submission[]>(STORAGE_KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS);
    const sess = getStoredData<AuthSession>(STORAGE_KEYS.SESSION, { type: 'guest' });

    setCompetitions(comps);
    setSchools(schs);
    setSubmissions(subs);
    setSession(sess);
    setIsLoaded(true);
  }, []);

  const saveCompetitions = (newComps: Competition[]) => {
    setCompetitions(newComps);
    setStoredData(STORAGE_KEYS.COMPETITIONS, newComps);
  };

  const saveSchools = (newSchools: RegisteredSchool[]) => {
    setSchools(newSchools);
    setStoredData(STORAGE_KEYS.SCHOOLS, newSchools);
  };

  const saveSubmissions = (newSubs: Submission[]) => {
    setSubmissions(newSubs);
    setStoredData(STORAGE_KEYS.SUBMISSIONS, newSubs);
  };

  const saveSession = (newSess: AuthSession) => {
    setSession(newSess);
    setStoredData(STORAGE_KEYS.SESSION, newSess);
  };

  // Actions
  const registerSchool = (data: Omit<RegisteredSchool, 'id' | 'registeredAt' | 'badgeCode' | 'status'>) => {
    const newSchool: RegisteredSchool = {
      ...data,
      id: `scl-${Date.now().toString(36)}`,
      status: 'active',
      registeredAt: new Date().toISOString().split('T')[0],
      badgeCode: `AMU-SCL-${String(schools.length + 18).padStart(3, '0')}`,
    };
    const updated = [newSchool, ...schools];
    saveSchools(updated);
    saveSession({ type: 'school', school: newSchool });
    return newSchool;
  };

  const loginSchool = (email: string, pass: string): RegisteredSchool | null => {
    const found = schools.find(
      (s) => s.email.toLowerCase() === email.toLowerCase() && (!s.password || s.password === pass)
    );
    if (found) {
      saveSession({ type: 'school', school: found });
      return found;
    }
    return null;
  };

  const loginAdmin = (usernameOrEmail: string, pass: string): boolean => {
    if (
      (usernameOrEmail === 'admin@saranath.lk' || usernameOrEmail === 'admin') &&
      (pass === 'admin123' || pass === 'admin')
    ) {
      saveSession({ type: 'admin', adminName: 'Agradhi Executive Board' });
      return true;
    }
    return false;
  };

  const logout = () => {
    saveSession({ type: 'guest' });
  };

  const submitEntry = (entry: Omit<Submission, 'id' | 'submittedAt' | 'status'>) => {
    const newSub: Submission = {
      ...entry,
      id: `sub-${Date.now().toString(36)}`,
      submittedAt: new Date().toISOString().split('T')[0],
      status: 'submitted',
    };
    const updated = [newSub, ...submissions];
    saveSubmissions(updated);
    return newSub;
  };

  const addCompetition = (comp: Omit<Competition, 'id'>) => {
    const newComp: Competition = {
      ...comp,
      id: `comp-${Date.now().toString(36)}`,
    };
    const updated = [newComp, ...competitions];
    saveCompetitions(updated);
    return newComp;
  };

  const updateCompetition = (id: string, updates: Partial<Competition>) => {
    const updated = competitions.map((c) => (c.id === id ? { ...c, ...updates } : c));
    saveCompetitions(updated);
  };

  const deleteCompetition = (id: string) => {
    const updated = competitions.filter((c) => c.id !== id);
    saveCompetitions(updated);
  };

  const updateSubmissionStatus = (
    id: string,
    status: SubmissionStatus,
    score?: number,
    feedback?: string
  ) => {
    const updated = submissions.map((s) => {
      if (s.id === id) {
        return {
          ...s,
          status,
          ...(score !== undefined ? { score } : {}),
          ...(feedback !== undefined ? { judgeFeedback: feedback } : {}),
        };
      }
      return s;
    });
    saveSubmissions(updated);
  };

  const updateSchoolStatus = (id: string, status: 'active' | 'pending' | 'suspended') => {
    const updated = schools.map((s) => (s.id === id ? { ...s, status } : s));
    saveSchools(updated);
  };

  const resetToDefaults = () => {
    saveCompetitions(INITIAL_COMPETITIONS);
    saveSchools(INITIAL_SCHOOLS);
    saveSubmissions(INITIAL_SUBMISSIONS);
    saveSession({ type: 'guest' });
  };

  return {
    isLoaded,
    competitions,
    schools,
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
    resetToDefaults,
    setSession: saveSession,
  };
}
