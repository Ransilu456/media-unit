'use client';

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  deleteUser,
  getIdTokenResult,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import type {
  Competition,
  RegisteredSchool,
  Submission,
  AuthSession,
  NewSubmissionInput,
} from './types';
import { INITIAL_COMPETITIONS } from './constants';
import { calculateAge } from './validation';

const COLLECTIONS = {
  competitions: 'competitions',
  schools: 'schools',
  submissions: 'submissions',
};

// ── Badge generator ───────────────────────────────────────────────────────────
function generateBadgeCode(province: string): string {
  const provinceCodes: Record<string, string> = {
    'Western Province': 'WP',
    'Central Province': 'CP',
    'Southern Province': 'SP',
    'Northern Province': 'NP',
    'Eastern Province': 'EP',
    'North Western Province': 'NWP',
    'North Central Province': 'NCP',
    'Uva Province': 'UP',
    'Sabaragamuwa Province': 'SGP',
  };
  const code = provinceCodes[province] ?? 'LK';
  const rand = Math.floor(100 + Math.random() * 900);
  return `AGR-${code}-${rand}`;
}

export async function getFirebaseSession(
  user: FirebaseUser | null = auth.currentUser
): Promise<AuthSession> {
  if (!user) return { type: 'guest' };

  const token = await getIdTokenResult(user);
  if (token.claims.admin === true) return { type: 'admin' };

  const schoolSnapshot = await getDoc(doc(db, COLLECTIONS.schools, user.uid));
  if (!schoolSnapshot.exists()) return { type: 'guest' };

  const school = schoolSnapshot.data() as RegisteredSchool;
  if (school.status !== 'active') return { type: 'guest' };
  const safeSchool = { ...school };
  delete safeSchool.password;
  return { type: 'school', school: safeSchool as RegisteredSchool };
}

// ── AUTHENTICATION WITH FIREBASE ──────────────────────────────────────────────

export async function firebaseLoginSchool(
  email: string,
  pass: string
): Promise<RegisteredSchool | null> {
  const cleanEmail = email.trim().toLowerCase();

  const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass).catch((error: unknown) => {
    const code = (error as { code?: string }).code;
    if (code === 'auth/too-many-requests') {
      throw new Error('Too many failed login attempts. Please wait a few minutes and retry.');
    }
    if (code === 'auth/operation-not-allowed') {
      throw new Error('Email and password sign-in is not enabled for this Firebase project.');
    }
    if (code === 'auth/invalid-api-key') {
      throw new Error('Firebase is misconfigured. Check the public Firebase API key.');
    }
    if (code?.startsWith('auth/')) {
      throw new Error('Invalid school email or password. Please verify your credentials.');
    }
    throw error;
  });

  let schoolSnapshot;
  try {
    schoolSnapshot = await getDoc(doc(db, COLLECTIONS.schools, cred.user.uid));
  } catch {
    await signOut(auth).catch(() => undefined);
    throw new Error('Unable to read your school profile from Firestore. Check your connection and Firestore rules.');
  }
  if (!schoolSnapshot.exists()) {
    await signOut(auth).catch(() => undefined);
    throw new Error('Your Firebase account has no school profile. Complete school registration or contact the administrator.');
  }
  const school = schoolSnapshot.data() as RegisteredSchool;
  if (school.status === 'suspended') {
    await signOut(auth).catch(() => undefined);
    throw new Error('Your school registration has been suspended by the administrator.');
  }
  if (school.status !== 'active') {
    await signOut(auth).catch(() => undefined);
    throw new Error('Your school account is not active yet. Contact the administrator.');
  }
  const safeSchool = { ...school };
  delete safeSchool.password;
  return safeSchool as RegisteredSchool;
}

export async function firebaseLoginAdmin(
  email: string,
  pass: string
): Promise<boolean> {
  const cleanEmail = email.trim().toLowerCase();

  let user: FirebaseUser;
  try {
    const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
    user = cred.user;
  } catch (err: unknown) {
    const code = (err as { code?: string }).code ?? '';
    if (code === 'auth/too-many-requests') {
      throw new Error('Too many login attempts. Please wait a few minutes and try again.');
    }
    if (code === 'auth/operation-not-allowed') {
      throw new Error('Email and password sign-in is not enabled for this Firebase project.');
    }
    if (code.startsWith('auth/')) {
      throw new Error('Invalid admin credentials. Check your email and password.');
    }
    throw err;
  }

  const token = await getIdTokenResult(user, true);
  if (token.claims.admin !== true) {
    await signOut(auth);
    throw new Error('This Firebase account is not configured as an administrator.');
  }
  return true;
}

export async function firebaseRegisterSchool(
  data: Omit<RegisteredSchool, 'id' | 'registeredAt' | 'badgeCode' | 'status'>
): Promise<RegisteredSchool> {
  if (!data.password || data.password.length < 12) {
    throw new Error('Password must be at least 12 characters.');
  }

  let cred;
  try {
    cred = await createUserWithEmailAndPassword(auth, data.email.trim().toLowerCase(), data.password);
  } catch (err: unknown) {
    const authError = err as { code?: string; message?: string };
    if (authError.code === 'auth/email-already-in-use') {
      throw new Error('A school delegation with this email is already registered. Please sign in directly.');
    }
    if (authError.code === 'auth/weak-password') {
      throw new Error('Password must be at least 12 characters.');
    }
    if (authError.code === 'auth/invalid-email') {
      throw new Error('Please enter a valid email address.');
    }
    throw new Error(authError.message || 'Failed to create school account in Firebase Auth.');
  }

  const badgeCode = generateBadgeCode(data.province);

  // Strip password before storing — Firebase Auth handles hashing,
  // we must never persist plain-text passwords to Firestore.
  const safeData = { ...data };
  delete safeData.password;

  const newSchool: RegisteredSchool = {
    ...safeData,
    id: cred.user.uid,
    status: 'active',
    registeredAt: new Date().toISOString(),
    badgeCode,
  };

  // Persist the profile in Firestore; remove the Auth user if profile creation fails.
  try {
    await setDoc(doc(db, COLLECTIONS.schools, cred.user.uid), newSchool);
  } catch {
    try {
      await deleteUser(cred.user);
    } catch {}
    throw new Error('The school profile could not be saved to Firestore. Please retry registration.');
  }

  return newSchool;
}

export async function firebaseLogout(): Promise<void> {
  await signOut(auth);
}

// ── COMPETITIONS CRUD WITH CLOUD FIRESTORE ────────────────────────────────────

export async function firebaseGetCompetitions(): Promise<Competition[]> {
  const snap = await getDocs(collection(db, COLLECTIONS.competitions));
  if (!snap.empty) {
    return snap.docs.map((competitionDoc) => competitionDoc.data() as Competition);
  }

  const user = auth.currentUser;
  if (!user || (await getIdTokenResult(user)).claims.admin !== true) return [];

  for (const competition of INITIAL_COMPETITIONS) {
    await setDoc(doc(db, COLLECTIONS.competitions, competition.id), competition);
  }
  return INITIAL_COMPETITIONS;
}

export async function firebaseAddCompetition(
  data: Omit<Competition, 'id'>
): Promise<Competition> {
  const newComp: Competition = {
    ...data,
    id: `comp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  };

  await setDoc(doc(db, COLLECTIONS.competitions, newComp.id), newComp);

  return newComp;
}

export async function firebaseUpdateCompetition(
  id: string,
  updates: Partial<Competition>
): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.competitions, id), updates);
}

export async function firebaseDeleteCompetition(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.competitions, id));
}

// ── SCHOOLS CRUD WITH CLOUD FIRESTORE ─────────────────────────────────────────

export async function firebaseGetSchools(): Promise<RegisteredSchool[]> {
  const user = auth.currentUser;
  if (!user || (await getIdTokenResult(user)).claims.admin !== true) return [];
  const snap = await getDocs(collection(db, COLLECTIONS.schools));
  return snap.docs.map((schoolDoc) => schoolDoc.data() as RegisteredSchool);
}

export async function firebaseUpdateSchoolStatus(
  id: string,
  status: 'active' | 'pending' | 'suspended'
): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.schools, id), { status });
}

// ── SUBMISSIONS CRUD WITH CLOUD FIRESTORE ─────────────────────────────────────

export async function firebaseGetSubmissions(schoolId?: string): Promise<Submission[]> {
  const user = auth.currentUser;
  if (!user) return [];
  const isAdmin = (await getIdTokenResult(user)).claims.admin === true;
  if (!isAdmin && (!schoolId || schoolId !== user.uid)) return [];

  const submissions = collection(db, COLLECTIONS.submissions);
  const submissionsQuery = schoolId && !isAdmin
    ? query(submissions, where('schoolId', '==', schoolId))
    : submissions;
  const snap = await getDocs(submissionsQuery);
  return snap.docs.map((submissionDoc) => submissionDoc.data() as Submission);
}

export async function firebaseSubmitEntry(
  entry: NewSubmissionInput
): Promise<Submission> {
  const newSub: Submission = {
    id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    competitionId: entry.competitionId,
    competitionTitle: entry.competitionTitle ?? '',
    competitionMedium: entry.competitionMedium ?? 'None',
    schoolId: entry.schoolId,
    schoolName: entry.schoolName ?? '',
    category: entry.category,
    studentName: entry.studentName,
    studentGrade: entry.studentGrade,
    studentBirthday: entry.studentBirthday,
    studentAge: calculateAge(entry.studentBirthday) ?? 0,
    studentContact: entry.studentContact,
    entryTitle: entry.entryTitle,
    submissionLink: entry.submissionLink,
    synopsis: entry.synopsis,
    status: 'submitted',
    submittedAt: new Date().toISOString(),
  };

  await setDoc(doc(db, COLLECTIONS.submissions, newSub.id), newSub);

  return newSub;
}

export async function firebaseUpdateSubmission(
  id: string,
  updates: Partial<Submission>
): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.submissions, id), updates);
}
