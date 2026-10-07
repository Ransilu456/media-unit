import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  getDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Competition, RegisteredSchool, Submission } from './types';
import type { DbData } from './db';

const COLLECTIONS = {
  competitions: 'competitions',
  schools: 'schools',
  submissions: 'submissions',
  metadata: 'metadata',
} as const;

let firestoreChecked = false;
let firestoreAvailable = false;

/**
 * Check whether Cloud Firestore is provisioned and responsive.
 * Caches positive responses so subsequent calls are instantaneous.
 */
export async function isFirestoreAvailable(timeoutMs = 3500): Promise<boolean> {
  if (firestoreAvailable) return true;

  try {
    const healthRef = doc(db, COLLECTIONS.metadata, 'health_check');
    const checkPromise = getDoc(healthRef);
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Firestore health-check timeout')), timeoutMs)
    );

    await Promise.race([checkPromise, timeoutPromise]);
    firestoreAvailable = true;
    firestoreChecked = true;
    return true;
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    // If not found or offline, Firestore has not been enabled in console yet
    firestoreChecked = true;
    firestoreAvailable = false;
    return false;
  }
}

/**
 * Fetch all application data from Cloud Firestore.
 * Returns null if Firestore is not available or uninitialized.
 */
export async function fetchAllFromFirestore(): Promise<DbData | null> {
  try {
    const [compSnap, schoolSnap, subSnap] = await Promise.all([
      getDocs(collection(db, COLLECTIONS.competitions)),
      getDocs(collection(db, COLLECTIONS.schools)),
      getDocs(collection(db, COLLECTIONS.submissions)),
    ]);

    const competitions: Competition[] = [];
    compSnap.forEach((d) => competitions.push(d.data() as Competition));

    const schools: RegisteredSchool[] = [];
    schoolSnap.forEach((d) => schools.push(d.data() as RegisteredSchool));

    const submissions: Submission[] = [];
    subSnap.forEach((d) => submissions.push(d.data() as Submission));

    // If completely empty in Firestore, return null so local defaults can seed it
    if (competitions.length === 0 && schools.length === 0 && submissions.length === 0) {
      return null;
    }

    firestoreAvailable = true;
    return { competitions, schools, submissions };
  } catch (error) {
    console.warn('[firebase-db] Unable to fetch from Cloud Firestore:', error);
    return null;
  }
}

/**
 * Push all local database records to Cloud Firestore (seeding/syncing).
 */
export async function syncAllToFirestore(
  data: DbData
): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const batch = writeBatch(db);
    let count = 0;

    for (const comp of data.competitions) {
      const ref = doc(db, COLLECTIONS.competitions, comp.id);
      batch.set(ref, comp);
      count++;
    }

    for (const school of data.schools) {
      const ref = doc(db, COLLECTIONS.schools, school.id);
      batch.set(ref, school);
      count++;
    }

    for (const sub of data.submissions) {
      const ref = doc(db, COLLECTIONS.submissions, sub.id);
      batch.set(ref, sub);
      count++;
    }

    const metaRef = doc(db, COLLECTIONS.metadata, 'sync_status');
    batch.set(metaRef, {
      lastSyncedAt: new Date().toISOString(),
      recordCount: count,
      version: '1.0',
    });

    await batch.commit();
    firestoreAvailable = true;
    return { success: true, count };
  } catch (error) {
    console.error('[firebase-db] Error syncing database to Cloud Firestore:', error);
    return {
      success: false,
      count: 0,
      error: error instanceof Error ? error.message : 'Unknown Firestore error',
    };
  }
}

// ── Competition Firestore Operations ──────────────────────────────────────────

export async function saveCompetitionToFirestore(comp: Competition): Promise<void> {
  try {
    await setDoc(doc(db, COLLECTIONS.competitions, comp.id), comp);
  } catch (error) {
    console.warn(`[firebase-db] Failed to save competition ${comp.id} to Firestore:`, error);
  }
}

export async function deleteCompetitionFromFirestore(compId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTIONS.competitions, compId));
  } catch (error) {
    console.warn(`[firebase-db] Failed to delete competition ${compId} from Firestore:`, error);
  }
}

// ── School Firestore Operations ───────────────────────────────────────────────

export async function saveSchoolToFirestore(school: RegisteredSchool): Promise<void> {
  try {
    await setDoc(doc(db, COLLECTIONS.schools, school.id), school);
  } catch (error) {
    console.warn(`[firebase-db] Failed to save school ${school.id} to Firestore:`, error);
  }
}

export async function updateSchoolInFirestore(
  schoolId: string,
  updates: Partial<RegisteredSchool>
): Promise<void> {
  try {
    await updateDoc(doc(db, COLLECTIONS.schools, schoolId), updates);
  } catch (error) {
    console.warn(`[firebase-db] Failed to update school ${schoolId} in Firestore:`, error);
  }
}

// ── Submission Firestore Operations ───────────────────────────────────────────

export async function saveSubmissionToFirestore(sub: Submission): Promise<void> {
  try {
    await setDoc(doc(db, COLLECTIONS.submissions, sub.id), sub);
  } catch (error) {
    console.warn(`[firebase-db] Failed to save submission ${sub.id} to Firestore:`, error);
  }
}

export async function updateSubmissionInFirestore(
  subId: string,
  updates: Partial<Submission>
): Promise<void> {
  try {
    await updateDoc(doc(db, COLLECTIONS.submissions, subId), updates);
  } catch (error) {
    console.warn(`[firebase-db] Failed to update submission ${subId} in Firestore:`, error);
  }
}
