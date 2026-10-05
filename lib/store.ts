'use client';

import { useState, useEffect } from 'react';
import {
  Competition,
  RegisteredSchool,
  PublicSchool,
  Submission,
  AuthSession,
  SubmissionStatus,
} from './types';
import { INITIAL_COMPETITIONS } from './constants';

// ─── main hook ──────────────────────────────────────────────────────────────

export function useMediaStore() {
  const [competitions] = useState<Competition[]>(INITIAL_COMPETITIONS);
  const [schools, setSchools] = useState<RegisteredSchool[]>([]);
  const [publicSchools, setPublicSchools] = useState<PublicSchool[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [session, setSessionState] = useState<AuthSession>({ type: 'guest' });
  const [isLoaded, setIsLoaded] = useState(false);

  // Load the server-verified session before requesting role-protected data.
  useEffect(() => {
    const loadStore = async () => {
      try {
        const sessionResponse = await fetch('/api/auth/session', { cache: 'no-store' });
        const sessionResult = await sessionResponse.json();
        if (!sessionResponse.ok || !sessionResult.success) {
          throw new Error(sessionResult.error || 'Unable to verify the current session.');
        }

        const currentSession: AuthSession = sessionResult.data;
        setSessionState(currentSession);
        const [publicSchoolsResponse, schoolsResponse, submissionsResponse] = await Promise.all([
          fetch('/api/schools/public'),
          currentSession.type === 'admin' ? fetch('/api/schools') : null,
          currentSession.type !== 'guest' ? fetch('/api/submissions') : null,
        ]);

        const publicSchoolsResult = await publicSchoolsResponse.json();
        if (publicSchoolsResponse.ok && publicSchoolsResult.success) {
          setPublicSchools(publicSchoolsResult.data);
        }
        if (schoolsResponse) {
          const result = await schoolsResponse.json();
          if (schoolsResponse.ok && result.success) setSchools(result.data);
        }
        if (submissionsResponse) {
          const result = await submissionsResponse.json();
          if (submissionsResponse.ok && result.success) setSubmissions(result.data);
        }
      } catch (error: unknown) {
        console.error('[media store hydration]', error);
      } finally {
        setIsLoaded(true);
      }
    };
    void loadStore();
  }, []);

  const _persistSession = (s: AuthSession) => {
    setSessionState(s);
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
    if (!res.ok || !json.success) throw new Error(json.error || 'Registration failed.');

    const school: RegisteredSchool = json.data;
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
    if (!res.ok || !json.success) {
      if (res.status === 401) return null;
      throw new Error(json.error || 'Unable to sign in.');
    }

    const school: RegisteredSchool = json.data;
    _persistSession({ type: 'school', school });

    const subsResponse = await fetch('/api/submissions');
    const subsResult = await subsResponse.json();
    if (!subsResponse.ok || !subsResult.success) {
      throw new Error(subsResult.error || 'Unable to load school submissions.');
    }
    setSubmissions(subsResult.data);

    return school;
  };

  const loginAdmin = async (email: string, pass: string): Promise<boolean> => {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass }),
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      if (response.status >= 500) {
        throw new Error(result.error || 'Admin login is temporarily unavailable.');
      }
      return false;
    }

    const sessionResponse = await fetch('/api/auth/session', { cache: 'no-store' });
    const sessionResult = await sessionResponse.json();
    if (!sessionResponse.ok || !sessionResult.success || sessionResult.data.type !== 'admin') {
      throw new Error(sessionResult.error || 'Unable to verify the admin session.');
    }
    _persistSession(sessionResult.data);

    const [schoolsResponse, submissionsResponse] = await Promise.all([
      fetch('/api/schools'),
      fetch('/api/submissions'),
    ]);
    const [schoolsResult, submissionsResult] = await Promise.all([
      schoolsResponse.json(),
      submissionsResponse.json(),
    ]);
    if (!schoolsResponse.ok || !schoolsResult.success) {
      throw new Error(schoolsResult.error || 'Unable to load registered schools.');
    }
    if (!submissionsResponse.ok || !submissionsResult.success) {
      throw new Error(submissionsResult.error || 'Unable to load submissions.');
    }
    setSchools(schoolsResult.data);
    setSubmissions(submissionsResult.data);
    return true;
  };

  const logout = async () => {
    const response = await fetch('/api/auth/logout', { method: 'POST' });
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Unable to sign out.');
    }
    _persistSession({ type: 'guest' });
    setSubmissions([]);
    setSchools([]);
  };

  const refreshSubmissions = async () => {
    const response = await fetch('/api/submissions', { cache: 'no-store' });
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Unable to refresh submissions.');
    }
    setSubmissions(result.data);
  };

  const submitEntry = async (
    entry: Omit<Submission, 'id' | 'submittedAt' | 'status' | 'studentAge'>
  ): Promise<Submission> => {
    const res = await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
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
