'use client';

import { useState, useEffect } from 'react';
import {
  Competition,
  RegisteredSchool,
  Submission,
  AuthSession,
  SubmissionStatus,
} from './types';
import { INITIAL_COMPETITIONS } from './constants';

const SESSION_KEY = 'agradhi_auth_session_v2';

// ─── session helpers ────────────────────────────────────────────────────────

function getSession(): AuthSession {
  if (typeof window === 'undefined') return { type: 'guest' };
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : { type: 'guest' };
  } catch {
    return { type: 'guest' };
  }
}

function saveSession(sess: AuthSession) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(sess));
}

// ─── main hook ──────────────────────────────────────────────────────────────

export function useMediaStore() {
  const [competitions] = useState<Competition[]>(INITIAL_COMPETITIONS);
  const [schools, setSchools] = useState<RegisteredSchool[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [session, setSessionState] = useState<AuthSession>({ type: 'guest' });
  const [isLoaded, setIsLoaded] = useState(false);

  // Hydrate session from localStorage, then fetch API data
  useEffect(() => {
    const sess = getSession();
    setSessionState(sess);

    Promise.all([
      fetch('/api/schools').then((r) => r.json()),
      sess.type === 'school' && sess.school
        ? fetch(`/api/submissions?schoolId=${sess.school.id}`).then((r) => r.json())
        : Promise.resolve({ data: [] }),
    ])
      .then(([schoolsRes, subsRes]) => {
        if (schoolsRes.success) setSchools(schoolsRes.data);
        if (subsRes.success) setSubmissions(subsRes.data);
      })
      .catch(console.error)
      .finally(() => setIsLoaded(true));
  }, []);

  const _persistSession = (s: AuthSession) => {
    setSessionState(s);
    saveSession(s);
  };

  // ── Actions ──────────────────────────────────────────────────────────────

  const registerSchool = async (
    data: Omit<RegisteredSchool, 'id' | 'registeredAt' | 'badgeCode' | 'status'>
  ): Promise<RegisteredSchool> => {
    const res = await fetch('/api/schools', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Registration failed.');

    const school: RegisteredSchool = json.data;
    setSchools((prev) => [school, ...prev]);
    _persistSession({ type: 'school', school });
    return school;
  };

  const loginSchool = async (
    email: string,
    pass: string
  ): Promise<RegisteredSchool | null> => {
    const res = await fetch('/api/schools/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass }),
    });
    const json = await res.json();
    if (!json.success) return null;

    const school: RegisteredSchool = json.data;
    _persistSession({ type: 'school', school });

    // Load this school's submissions
    const subsRes = await fetch(`/api/submissions?schoolId=${school.id}`).then((r) => r.json());
    if (subsRes.success) setSubmissions(subsRes.data);

    return school;
  };

  const loginAdmin = (usernameOrEmail: string, pass: string): boolean => {
    if (
      (usernameOrEmail === 'admin@saranath.lk' || usernameOrEmail === 'admin') &&
      (pass === 'admin123' || pass === 'admin')
    ) {
      _persistSession({ type: 'admin', adminName: 'Agradhi Executive Board' });
      return true;
    }
    return false;
  };

  const logout = () => {
    _persistSession({ type: 'guest' });
    setSubmissions([]);
  };

  const submitEntry = async (
    entry: Omit<Submission, 'id' | 'submittedAt' | 'status' | 'studentAge'>
  ): Promise<Submission> => {
    // Find competition to pass maxEntries for server validation
    const comp = competitions.find((c) => c.id === entry.competitionId);

    const res = await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...entry,
        maxEntriesPerSchool: comp?.maxEntriesPerSchool,
        requiredCustomFields: comp?.customFields
          .filter((f) => f.required)
          .map((f) => f.id) ?? [],
      }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Submission failed.');

    const newSub: Submission = json.data;
    setSubmissions((prev) => [newSub, ...prev]);
    return newSub;
  };

  // Stub for admin status update — would call a PATCH API in production
  const updateSubmissionStatus = (
    id: string,
    status: SubmissionStatus,
    score?: number,
    feedback?: string
  ) => {
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status, ...(score !== undefined ? { score } : {}), ...(feedback !== undefined ? { judgeFeedback: feedback } : {}) }
          : s
      )
    );
  };

  const updateSchoolStatus = (id: string, status: 'active' | 'pending' | 'suspended') => {
    setSchools((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
  };

  // Admin competition management stubs (competitions are currently read-only from constants)
  const addCompetition = (comp: Omit<Competition, 'id'>): Competition => {
    const newComp: Competition = { ...comp, id: `comp-${Date.now().toString(36)}` };
    return newComp;
  };

  const updateCompetition = (_id: string, _updates: Partial<Competition>) => {
    // No-op: competitions are loaded from constants
  };

  const deleteCompetition = (_id: string) => {
    // No-op: competitions are loaded from constants
  };

  const resetToDefaults = () => {
    _persistSession({ type: 'guest' });
    setSubmissions([]);
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
    setSession: _persistSession,
  };
}
