'use client';

import { signInWithEmailAndPassword, createUserWithEmailAndPassword, deleteUser, signOut, User as FirebaseUser, } from 'firebase/auth';
import { collection, doc, getDoc, onSnapshot, setDoc, updateDoc, deleteDoc, getDocs, limit, query, where, } from 'firebase/firestore';
import { auth, db } from './firebase';
import { isFirebaseConnectionError, reportFirestoreError, withFirestoreErrorReporting } from './firestoreErrors';
import type {  Competition,  RegisteredSchool,  Submission,  AuthSession,  NewSubmissionInput, } from './types';
import { calculateAge } from './validation';

const COLLECTIONS = {
  competitions: 'competitions',
  schools: 'schools',
  submissions: 'submissions',
  notifications: 'notifications',
};

export type NotificationKind = 'registration' | 'submission' | 'update' | 'disqualification';

export interface AppNotification {
  id: string;
  target: 'admin' | 'school';
  schoolId?: string;
  kind: NotificationKind;
  status?: import('./types').SubmissionStatus;
  title: string;
  message: string;
  createdAt: number;
  read: boolean;
}

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

  const adminResponse = await fetch('/api/auth/session', { cache: 'no-store' });
  if (!adminResponse.ok) {
    throw new Error('Unable to verify the website admin session.');
  }
  const adminResult = await adminResponse.json() as {
    success: boolean;
    data?: { type?: string; adminEmail?: string };
  };
  if (
    adminResult.success &&
    adminResult.data?.type === 'admin' &&
    user.email?.trim().toLowerCase() === adminResult.data.adminEmail
  ) {
    return { type: 'admin' };
  }

  const schoolSnapshot = await withFirestoreErrorReporting(() =>
    getDoc(doc(db, COLLECTIONS.schools, user.uid))
  );
  if (!schoolSnapshot.exists()) return { type: 'guest' };

  const school = schoolSnapshot.data() as RegisteredSchool;
  if (school.status !== 'active') return { type: 'guest' };
  const safeSchool = { ...school };
  delete safeSchool.password;
  return { type: 'school', school: safeSchool as RegisteredSchool };
}

export async function firebaseLoginSchool(
  email: string,
  pass: string
): Promise<RegisteredSchool | null> {
  const cleanEmail = email.trim().toLowerCase();

  const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass).catch((error: unknown) => {
    const code = (error as { code?: string }).code;
    if (isFirebaseConnectionError(error)) {
      throw new Error('Unable to connect to Firebase. Check your internet connection and try signing in again.');
    }
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
    schoolSnapshot = await withFirestoreErrorReporting(() =>
      getDoc(doc(db, COLLECTIONS.schools, cred.user.uid))
    );
  } catch (error) {
    await signOut(auth).catch(() => undefined);
    if (isFirebaseConnectionError(error)) {
      throw new Error('Unable to connect to Firebase. Check your internet connection and retry.');
    }
    throw new Error('Unable to read your school profile from Firestore. Check your connection and Firestore rules.');
  }
  if (!schoolSnapshot.exists()) {
    await signOut(auth).catch(() => undefined);
    throw new Error('Your Firebase account has no school profile. Complete school registration or contact the administrator.');
  }
  const school = schoolSnapshot.data() as RegisteredSchool;
  if (school.status === 'pending') {
    await signOut(auth).catch(() => undefined);
    throw new Error('Your school registration is awaiting approval. You can sign in after the Agradhi administrator approves it.');
  }
  if (school.status === 'suspended') {
    await signOut(auth).catch(() => undefined);
    throw new Error('Your school account is suspended. Contact the Agradhi administrator.');
  }
  if (school.status === 'banned') {
    await signOut(auth).catch(() => undefined);
    throw new Error('Your school account is banned. Contact the Agradhi administrator.');
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

  const response = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: cleanEmail, password: pass }),
  });
  const result = await response.json() as { success: boolean; error?: string };
  if (!response.ok || !result.success) {
    throw new Error(result.error || 'Invalid admin credentials.');
  }

  try {
    const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
    if (cred.user.email?.trim().toLowerCase() !== cleanEmail) {
      throw new Error('The Firebase Authentication account does not match the admin email.');
    }
  } catch (err: unknown) {
    await fetch('/api/auth/logout', { method: 'POST' });
    const code = (err as { code?: string }).code ?? '';
    if (isFirebaseConnectionError(err)) {
      throw new Error('Unable to connect to Firebase. Check your internet connection and try signing in again.');
    }
    if (code === 'auth/too-many-requests') {
      throw new Error('Too many login attempts. Please wait a few minutes and try again.');
    }
    if (code === 'auth/operation-not-allowed') {
      throw new Error('Email and password sign-in is not enabled for this Firebase project.');
    }
    if (code.startsWith('auth/')) {
      throw new Error('Create this admin email and password in Firebase Authentication, then try again.');
    }
    throw err;
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
    if (isFirebaseConnectionError(err)) {
      throw new Error('Unable to connect to Firebase. Check your internet connection and try registering again.');
    }
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
  const safeData = { ...data };
  delete safeData.password;
  safeData.email = safeData.email.trim().toLowerCase();

  const newSchool: RegisteredSchool = {
    ...safeData,
    id: cred.user.uid,
    status: 'pending',
    registeredAt: new Date().toISOString(),
    badgeCode,
  };

  try {
    await withFirestoreErrorReporting(() =>
      setDoc(doc(db, COLLECTIONS.schools, cred.user.uid), newSchool)
    );
  } catch (error) {
    try {
      await deleteUser(cred.user);
    } catch (cleanupError) {
      console.error('[school registration cleanup]', cleanupError);
    }
    if ((error as { code?: string })?.code === 'resource-exhausted') throw error;
    if (isFirebaseConnectionError(error)) {
      throw new Error('Unable to connect to Firebase. Check your internet connection and retry registration.');
    }
    throw new Error('The school profile could not be saved to Firestore. Please retry registration.');
  }

  // Notify Admin Console of registration
  void firebaseCreateNotification({
    target: 'admin',
    kind: 'registration',
    title: 'New School Registration',
    message: `${newSchool.name} (${newSchool.district}) has registered and is pending approval.`,
    createdAt: Date.now(),
    read: false,
  });

  await signOut(auth);
  return newSchool;
}

export async function firebaseLogout(): Promise<void> {
  const [signOutResult, cookieResult] = await Promise.allSettled([
    signOut(auth),
    fetch('/api/auth/logout', { method: 'POST' }),
  ]);
  if (cookieResult.status === 'rejected') throw cookieResult.reason;
  if (!cookieResult.value.ok) throw new Error('Unable to end the website session.');
  if (signOutResult.status === 'rejected') throw signOutResult.reason;
}

export async function firebaseAddCompetition(
  data: Omit<Competition, 'id'>
): Promise<Competition> {
  const newComp: Competition = {
    ...data,
    id: `comp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  };

  await withFirestoreErrorReporting(() =>
    setDoc(doc(db, COLLECTIONS.competitions, newComp.id), newComp)
  );

  return newComp;
}

export async function firebaseUpdateCompetition(
  id: string,
  updates: Partial<Competition>
): Promise<void> {
  await withFirestoreErrorReporting(() =>
    updateDoc(doc(db, COLLECTIONS.competitions, id), updates)
  );
}

export async function firebaseDeleteCompetition(id: string): Promise<void> {
  const existingSubmission = await withFirestoreErrorReporting(() =>
    getDocs(query(
      collection(db, COLLECTIONS.submissions),
      where('competitionId', '==', id),
      limit(1)
    ))
  );
  if (!existingSubmission.empty) {
    throw new Error('This competition has submissions and cannot be deleted. Close entries instead to preserve the review history.');
  }

  await withFirestoreErrorReporting(() =>
    deleteDoc(doc(db, COLLECTIONS.competitions, id))
  );
}

export async function firebaseUpdateSchoolStatus(
  id: string,
  status: 'active' | 'pending' | 'suspended' | 'banned'
): Promise<void> {
  await withFirestoreErrorReporting(() =>
    updateDoc(doc(db, COLLECTIONS.schools, id), { status })
  );
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
    ...(entry.customValues && Object.keys(entry.customValues).length > 0
      ? { customValues: entry.customValues }
      : {}),
    status: 'submitted',
    submittedAt: new Date().toISOString(),
  };

  await withFirestoreErrorReporting(() =>
    setDoc(doc(db, COLLECTIONS.submissions, newSub.id), newSub)
  );

  // Notify Admin Console
  void firebaseCreateNotification({
    target: 'admin',
    kind: 'submission',
    title: 'New Competition Submission',
    message: `${newSub.schoolName || 'A school'} submitted “${newSub.entryTitle}” for ${newSub.competitionTitle || newSub.category}.`,
    createdAt: Date.now(),
    read: false,
  });

  // Notify ONLY the submitting school
  void firebaseCreateNotification({
    target: 'school',
    schoolId: newSub.schoolId,
    kind: 'submission',
    title: 'Entry Submitted Successfully',
    message: `“${newSub.entryTitle}” was received for ${newSub.competitionTitle || newSub.category} and is queued for jury review.`,
    createdAt: Date.now(),
    read: false,
  });

  return newSub;
}

export async function firebaseUpdateSubmission(
  id: string,
  updates: Partial<Submission>,
  submissionContext?: { schoolId: string; entryTitle: string }
): Promise<void> {
  await withFirestoreErrorReporting(() =>
    updateDoc(doc(db, COLLECTIONS.submissions, id), updates)
  );

  // Notify ONLY the reviewed school
  if (submissionContext?.schoolId) {
    const isDisqualified = updates.status === 'disqualified';
    const statusLabel = updates.status ? updates.status.replace('_', ' ') : 'updated';
    const scoreText = updates.score !== undefined ? ` Score: ${updates.score}/100.` : '';
    const feedbackText = updates.judgeFeedback ? ` Note: “${updates.judgeFeedback}”` : '';
    const guidanceText = isDisqualified
      ? ' Your school quota slot for this competition track has been reopened so you may submit a replacement entry for another eligible student.'
      : '';
    void firebaseCreateNotification({
      target: 'school',
      schoolId: submissionContext.schoolId,
      kind: isDisqualified ? 'disqualification' : 'update',
      status: updates.status,
      title: isDisqualified ? 'Entry Disqualified · Quota Slot Reopened' : 'Submission Adjudication Update',
      message: `“${submissionContext.entryTitle}” status is now ${statusLabel}.${scoreText}${feedbackText}${guidanceText}`,
      createdAt: Date.now(),
      read: false,
    });
  }
}

export function subscribeFirebaseCompetitions(
  onData: (competitions: Competition[], fromCache: boolean) => void,
  onError: (error: Error) => void
): () => void {
  return onSnapshot(
    collection(db, COLLECTIONS.competitions),
    { includeMetadataChanges: true },
    (snapshot) => onData(
      snapshot.docs.map((item) => item.data() as Competition),
      snapshot.metadata.fromCache
    ),
    (error) => {
      reportFirestoreError(error);
      onError(error);
    }
  );
}

export function subscribeFirebaseSchoolStatus(
  schoolId: string,
  onStatus: (status: RegisteredSchool['status'] | null, fromCache: boolean) => void,
  onError: (error: Error) => void
): () => void {
  return onSnapshot(
    doc(db, COLLECTIONS.schools, schoolId),
    { includeMetadataChanges: true },
    (snapshot) => {
      const school = snapshot.exists() ? snapshot.data() as RegisteredSchool : null;
      onStatus(school?.status ?? null, snapshot.metadata.fromCache);
    },
    (error) => {
      reportFirestoreError(error);
      onError(error);
    }
  );
}

export function subscribeFirebaseSchools(
  onData: (schools: RegisteredSchool[], fromCache: boolean) => void,
  onError: (error: Error) => void
): () => void {
  return onSnapshot(
    collection(db, COLLECTIONS.schools),
    { includeMetadataChanges: true },
    (snapshot) => onData(
      snapshot.docs.map((item) => item.data() as RegisteredSchool),
      snapshot.metadata.fromCache
    ),
    (error) => {
      reportFirestoreError(error);
      onError(error);
    }
  );
}

export function subscribeFirebaseSubmissions(
  schoolId: string | undefined,
  onData: (submissions: Submission[], fromCache: boolean) => void,
  onError: (error: Error) => void
): () => void {
  const submissions = collection(db, COLLECTIONS.submissions);
  const submissionsQuery = schoolId
    ? query(submissions, where('schoolId', '==', schoolId))
    : submissions;
  return onSnapshot(
    submissionsQuery,
    { includeMetadataChanges: true },
    (snapshot) => onData(
      snapshot.docs.map((item) => ({
        ...item.data(),
        id: item.id,
      }) as Submission),
      snapshot.metadata.fromCache
    ),
    (error) => {
      reportFirestoreError(error);
      onError(error);
    }
  );
}

export async function firebaseCreateNotification(
  notification: Omit<AppNotification, 'id'> & { id?: string }
): Promise<void> {
  const notifId = notification.id || `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const docData: AppNotification = {
    ...notification,
    id: notifId,
    read: notification.read ?? false,
    createdAt: notification.createdAt || Date.now(),
  };
  try {
    await withFirestoreErrorReporting(() =>
      setDoc(doc(db, COLLECTIONS.notifications, notifId), docData)
    );
  } catch (error) {
    console.warn('[firebase notification write skipped]', error);
  }
}

export async function firebaseMarkNotificationRead(id: string): Promise<void> {
  try {
    await withFirestoreErrorReporting(() =>
      updateDoc(doc(db, COLLECTIONS.notifications, id), { read: true })
    );
  } catch (error) {
    console.warn('[firebase mark notification read]', error);
  }
}

export async function firebaseClearNotifications(
  target: 'admin' | 'school',
  schoolId?: string
): Promise<void> {
  try {
    const notifsRef = collection(db, COLLECTIONS.notifications);
    const q = target === 'admin'
      ? query(notifsRef, where('target', '==', 'admin'))
      : schoolId
      ? query(notifsRef, where('target', '==', 'school'), where('schoolId', '==', schoolId))
      : null;

    if (!q) return;
    const snap = await getDocs(q);
    const deletions = snap.docs.map((d) => deleteDoc(d.ref));
    await Promise.all(deletions);
  } catch (error) {
    console.warn('[firebase clear notifications]', error);
  }
}

export function subscribeFirebaseNotifications(
  target: 'admin' | 'school',
  schoolId: string | undefined,
  onData: (notifications: AppNotification[]) => void,
  onError: (error: Error) => void
): () => void {
  const notifsRef = collection(db, COLLECTIONS.notifications);
  const notifsQuery = target === 'admin'
    ? query(notifsRef, where('target', '==', 'admin'))
    : schoolId
    ? query(notifsRef, where('target', '==', 'school'), where('schoolId', '==', schoolId))
    : null;

  if (!notifsQuery) {
    onData([]);
    return () => {};
  }

  return onSnapshot(
    notifsQuery,
    { includeMetadataChanges: true },
    (snapshot) => {
      const items = snapshot.docs.map((item) => item.data() as AppNotification);
      items.sort((a, b) => b.createdAt - a.createdAt);
      onData(items);
    },
    (error) => {
      reportFirestoreError(error);
      onError(error);
    }
  );
}
