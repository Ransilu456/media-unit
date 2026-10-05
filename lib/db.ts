import path from 'node:path';
import fs from 'node:fs';
import { randomBytes } from 'node:crypto';
import type { Competition, RegisteredSchool, Submission } from './types';
import { validateDatabase } from './validation';
import { INITIAL_COMPETITIONS } from './constants';

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

export function readDb(): DbData {
  try {
    const stats = fs.lstatSync(DB_PATH);
    if (!stats.isFile() || stats.size > MAX_DATABASE_BYTES) {
      throw new Error(`Database file is not a regular file or exceeds ${MAX_DATABASE_BYTES} bytes.`);
    }
    const parsed: unknown = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    if (
      typeof parsed === 'object'
      && parsed !== null
      && !Array.isArray(parsed)
      && !Object.hasOwn(parsed, 'competitions')
    ) {
      (parsed as Record<string, unknown>).competitions = structuredClone(INITIAL_COMPETITIONS);
      validateDatabase(parsed);
      writeDb(parsed);
      return parsed;
    }
    validateDatabase(parsed);
    return parsed;
  } catch (error: unknown) {
    console.error('[database] Failed to read or validate data/db.json.', error);
    throw new Error('The local database is unreadable or contains invalid data.', { cause: error });
  }
}

export function writeDb(data: DbData): void {
  validateDatabase(data);
  const directory = path.dirname(DB_PATH);
  fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
  const temporaryPath = `${DB_PATH}.${process.pid}.${randomBytes(8).toString('hex')}.tmp`;
  let descriptor: number | undefined;

  try {
    const serialized = JSON.stringify(data, null, 2);
    if (Buffer.byteLength(serialized, 'utf8') > MAX_DATABASE_BYTES) {
      throw new Error(`Database exceeds the ${MAX_DATABASE_BYTES}-byte size limit.`);
    }
    descriptor = fs.openSync(temporaryPath, 'wx', 0o600);
    fs.writeFileSync(descriptor, serialized, 'utf8');
    fs.fsyncSync(descriptor);
    fs.closeSync(descriptor);
    descriptor = undefined;
    fs.renameSync(temporaryPath, DB_PATH);
  } catch (error: unknown) {
    if (descriptor !== undefined) fs.closeSync(descriptor);
    try {
      fs.unlinkSync(temporaryPath);
    } catch (cleanupError: unknown) {
      if ((cleanupError as NodeJS.ErrnoException).code !== 'ENOENT') {
        console.error('[database] Failed to remove incomplete temporary database file.', cleanupError);
      }
    }
    console.error('[database] Failed to write data/db.json.', error);
    throw new Error('The local database could not be saved.', { cause: error });
  }
}

export function mutateDb(fn: (db: DbData) => void): DbData {
  const db = readDb();
  fn(db);
  writeDb(db);
  return db;
}

export { INITIAL_COMPETITIONS as competitions };
