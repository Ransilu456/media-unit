/**
 * lib/db.ts  — Server-side only. Reads and writes data/db.json.
 * Never import this from client components or 'use client' files.
 */
import path from 'path';
import fs from 'fs';
import { RegisteredSchool, Submission } from './types';
import { INITIAL_COMPETITIONS } from './constants';

export interface DbData {
  schools: RegisteredSchool[];
  submissions: Submission[];
}

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

export function readDb(): DbData {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<DbData>;
    return {
      schools: parsed.schools ?? [],
      submissions: parsed.submissions ?? [],
    };
  } catch {
    return { schools: [], submissions: [] };
  }
}

export function writeDb(data: DbData): void {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

/** Convenience: read, mutate, write */
export function mutateDb(fn: (db: DbData) => void): DbData {
  const db = readDb();
  fn(db);
  writeDb(db);
  return db;
}

// Re-export competitions from constants (they don't need persistence)
export { INITIAL_COMPETITIONS as competitions };
