import path from 'node:path';
import fs from 'node:fs';
import { randomBytes } from 'node:crypto';
import type { Competition, RegisteredSchool, Submission } from './types';
import { validateDatabase } from './validation';

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

let cachedDb: DbData | null = null;

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
          (parsed as Record<string, unknown>).competitions = [];
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

  const fallbackDb: DbData = {
    competitions: [],
    schools: [],
    submissions: [],
  };
  cachedDb = fallbackDb;

  try {
    writeDb(fallbackDb);
  } catch {
  }

  return cachedDb;
}

export function writeDb(data: DbData): void {
  validateDatabase(data);
  cachedDb = data;

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
    console.warn('[database] Local disk write skipped or read-only (tolerated in serverless):', (diskError as Error).message);
  }

}

export function mutateDb(fn: (db: DbData) => void): DbData {
  const db = readDb();
  fn(db);
  writeDb(db);
  return db;
}
