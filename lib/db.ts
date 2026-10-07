import path from 'node:path';
import fs from 'node:fs';
import { randomBytes } from 'node:crypto';
import type { Competition, RegisteredSchool, Submission } from './types';
import { validateDatabase } from './validation';
import { INITIAL_COMPETITIONS } from './constants';
import { syncAllToFirestore, fetchAllFromFirestore } from './firebaseDb';

export type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { [key: string]: JsonValue };

export interface DbData {
  competitions: Competition[];
  schools: RegisteredSchool[];
  submissions: Submission[];
  admin?: JsonValue[];
}

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');
const MAX_DATABASE_BYTES = 10 * 1024 * 1024;

// In-memory cache ensures fast reads and serverless survivability
let cachedDb: DbData | null = null;
let firestoreSyncAttempted = false;

export function readDb(): DbData {
  if (cachedDb) {
    return cachedDb;
  }

  try {
    if (fs.existsSync(DB_PATH)) {
      const stats = fs.lstatSync(DB_PATH);
      if (stats.isFile() && stats.size <= MAX_DATABASE_BYTES) {
        const parsed: unknown = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
        if (
          typeof parsed === 'object' &&
          parsed !== null &&
          !Array.isArray(parsed) &&
          !Object.hasOwn(parsed, 'competitions')
        ) {
          (parsed as Record<string, unknown>).competitions = structuredClone(INITIAL_COMPETITIONS);
          validateDatabase(parsed);
          writeDb(parsed as DbData);
          cachedDb = parsed as DbData;
          return cachedDb;
        }
        validateDatabase(parsed);
        cachedDb = parsed as DbData;
        return cachedDb;
      }
    }
  } catch (error) {
    console.warn('[database] Note: Could not read local db.json, using memory store:', error);
  }

  // Fallback defaults for serverless / new environments
  const fallbackDb: DbData = {
    competitions: structuredClone(INITIAL_COMPETITIONS),
    schools: [],
    submissions: [],
  };
  cachedDb = fallbackDb;

  // Try to write initial copy to disk if possible
  try {
    writeDb(fallbackDb);
  } catch {
    // Read-only filesystem is tolerated
  }

  // Attempt non-blocking hydration from Firestore on cold boot
  if (!firestoreSyncAttempted) {
    firestoreSyncAttempted = true;
    void hydrateFromFirestore();
  }

  return cachedDb;
}

export function writeDb(data: DbData): void {
  validateDatabase(data);
  cachedDb = data;

  // 1. Try persisting to local disk (succeeds in local dev & persistent servers)
  try {
    const directory = path.dirname(DB_PATH);
    fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
    const temporaryPath = `${DB_PATH}.${process.pid}.${randomBytes(8).toString('hex')}.tmp`;
    let descriptor: number | undefined;

    const serialized = JSON.stringify(data, null, 2);
    if (Buffer.byteLength(serialized, 'utf8') <= MAX_DATABASE_BYTES) {
      descriptor = fs.openSync(temporaryPath, 'wx', 0o600);
      fs.writeFileSync(descriptor, serialized, 'utf8');
      fs.fsyncSync(descriptor);
      fs.closeSync(descriptor);
      descriptor = undefined;
      fs.renameSync(temporaryPath, DB_PATH);
    }
  } catch (diskError: unknown) {
    // In serverless environments like Vercel, the local filesystem outside /tmp is read-only.
    // We catch EROFS gracefully so requests never crash.
    console.warn('[database] Local disk write skipped or read-only (tolerated in serverless):', (diskError as Error).message);
  }

  // 2. Asynchronously persist to Cloud Firestore (production database backend)
  void syncAllToFirestore(data).catch((err) => {
    console.warn('[database] Firestore background sync notice:', err);
  });
}

export function mutateDb(fn: (db: DbData) => void): DbData {
  const db = readDb();
  fn(db);
  writeDb(db);
  return db;
}

/**
 * Hydrate in-memory database from Cloud Firestore if available.
 */
export async function hydrateFromFirestore(): Promise<boolean> {
  try {
    const remoteData = await fetchAllFromFirestore();
    if (remoteData && remoteData.competitions.length > 0) {
      cachedDb = remoteData;
      console.log('[database] Successfully hydrated state from Cloud Firestore.');
      return true;
    }
  } catch (error) {
    console.warn('[database] Cloud Firestore hydration not yet active:', error);
  }
  return false;
}

export { INITIAL_COMPETITIONS as competitions };
