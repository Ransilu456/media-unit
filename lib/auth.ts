import {
  createHash,
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from 'node:crypto';
import type { RegisteredSchool } from '@/lib/types';

export const SESSION_COOKIE_NAME = 'agradhi_session';
export const SESSION_MAX_AGE = 60 * 60 * 8;

export type SessionClaims =
  | { role: 'admin'; expiresAt: number }
  | { role: 'school'; schoolId: string; expiresAt: number };

export type NewSessionClaims =
  | { role: 'admin' }
  | { role: 'school'; schoolId: string };

const developmentSecret = 'development-only-session-secret-change-before-deploy';

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret && Buffer.byteLength(secret) >= 32) return secret;
  if (process.env.NODE_ENV !== 'production') return developmentSecret;
  throw new Error('SESSION_SECRET must be set to at least 32 characters.');
}

export function createSessionToken(
  session: NewSessionClaims
): string {
  const payload = Buffer.from(
    JSON.stringify({ ...session, expiresAt: Date.now() + SESSION_MAX_AGE * 1000 })
  ).toString('base64url');
  const signature = createHmac('sha256', getSessionSecret())
    .update(payload)
    .digest('base64url');
  return `${payload}.${signature}`;
}

export function stripSchoolPassword(
  school: RegisteredSchool
): Omit<RegisteredSchool, 'password'> {
  const safeSchool = { ...school };
  delete safeSchool.password;
  return safeSchool;
}

export function constantTimeStringEqual(actual: string, expected: string): boolean {
  const actualHash = createHash('sha256').update(actual).digest();
  const expectedHash = createHash('sha256').update(expected).digest();
  return timingSafeEqual(actualHash, expectedHash);
}

export function verifySessionToken(token: string | undefined): SessionClaims | null {
  if (!token) return null;

  try {
    const [payload, signature, extra] = token.split('.');
    if (!payload || !signature || extra) return null;
    const expected = createHmac('sha256', getSessionSecret())
      .update(payload)
      .digest();
    const received = Buffer.from(signature, 'base64url');
    if (received.length !== expected.length || !timingSafeEqual(received, expected)) {
      return null;
    }

    const claims = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf8')
    ) as SessionClaims;
    if (!Number.isSafeInteger(claims.expiresAt) || claims.expiresAt <= Date.now()) {
      return null;
    }
    if (claims.role === 'admin') return claims;
    if (claims.role === 'school' && typeof claims.schoolId === 'string') {
      return claims;
    }
    return null;
  } catch {
    return null;
  }
}

export function getRequestSession(cookieHeader: string | null): SessionClaims | null {
  try {
    const token = cookieHeader
      ?.split(';')
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith(`${SESSION_COOKIE_NAME}=`))
      ?.slice(SESSION_COOKIE_NAME.length + 1);
    return verifySessionToken(token ? decodeURIComponent(token) : undefined);
  } catch {
    return null;
  }
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: SESSION_MAX_AGE,
  };
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('base64url');
  const hash = scryptSync(password, salt, 64).toString('base64url');
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(
  password: string,
  storedPassword: string
): { valid: boolean; needsRehash: boolean } {
  const [algorithm, salt, storedHash] = storedPassword.split('$');
  if (algorithm === 'scrypt' && salt && storedHash) {
    try {
      const expected = Buffer.from(storedHash, 'base64url');
      const actual = scryptSync(password, salt, expected.length);
      return {
        valid: expected.length === actual.length && timingSafeEqual(actual, expected),
        needsRehash: false,
      };
    } catch {
      return { valid: false, needsRehash: false };
    }
  }

  return {
    valid: constantTimeStringEqual(password, storedPassword),
    needsRehash: true,
  };
}
