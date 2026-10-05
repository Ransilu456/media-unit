import { NextRequest, NextResponse } from 'next/server';
import { readDb, mutateDb } from '@/lib/db';
import { RegisteredSchool } from '@/lib/types';
import {
  createSessionToken,
  getRequestSession,
  hashPassword,
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
  stripSchoolPassword,
} from '@/lib/auth';
import {
  InvalidRequestError,
  readJsonRequest,
  validateSchoolRegistration,
} from '@/lib/validation';

// GET /api/schools  — list all registered schools
export async function GET(request: NextRequest) {
  const session = getRequestSession(request.headers.get('cookie'));
  if (session?.role !== 'admin') {
    return NextResponse.json(
      { success: false, error: 'Admin access required.' },
      { status: 401 }
    );
  }
  const db = readDb();
  const schools = db.schools.map(stripSchoolPassword);
  return NextResponse.json({ success: true, data: schools });
}

// POST /api/schools  — register a new school
export async function POST(request: NextRequest) {
  try {
    const body = await readJsonRequest(request);
    const validationErrors = validateSchoolRegistration(body);
    if (Object.keys(validationErrors).length > 0) {
      return Response.json(
        { success: false, errors: validationErrors, error: Object.values(validationErrors)[0] },
        { status: 400 }
      );
    }
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      return Response.json({ success: false, error: 'Invalid registration data.' }, { status: 400 });
    }
    const registration = body as Record<string, unknown>;
    const getText = (field: string, fallback = '') => {
      const value = registration[field];
      return typeof value === 'string' ? value.trim() : fallback;
    };
    const email = getText('email').toLowerCase();
    const password = registration.password as string;

    // Duplicate email check
    const db = readDb();
    const emailExists = db.schools.some(
      (s) => s.email.toLowerCase() === email
    );
    if (emailExists) {
      return Response.json(
        { success: false, error: 'A school with this email is already registered.' },
        { status: 409 }
      );
    }

    // ── Create record ───────────────────────────────────────────
    const newSchool: RegisteredSchool = {
      id: `scl-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      name: getText('name'),
      registrationNumber: getText('registrationNumber') || `SCH-${Date.now().toString(36).toUpperCase()}`,
      province: getText('province'),
      district: getText('district'),
      teacherInCharge: getText('teacherInCharge'),
      teacherPhone: getText('teacherPhone'),
      mediaPresident: getText('mediaPresident'),
      presidentPhone: getText('presidentPhone'),
      email,
      password: hashPassword(password),
      status: 'active',
      registeredAt: new Date().toISOString().split('T')[0],
      badgeCode: `AMU-SCL-${String(db.schools.length + 18).padStart(3, '0')}`,
    };

    mutateDb((d) => d.schools.unshift(newSchool));

    const response = NextResponse.json(
      { success: true, data: stripSchoolPassword(newSchool) },
      { status: 201 }
    );
    response.cookies.set(
      SESSION_COOKIE_NAME,
      createSessionToken({ role: 'school', schoolId: newSchool.id }),
      sessionCookieOptions()
    );
    return response;
  } catch (err: unknown) {
    if (err instanceof InvalidRequestError) {
      return Response.json({ success: false, error: err.message }, { status: 400 });
    }
    console.error('[POST /api/schools]', err);
    return Response.json(
      { success: false, error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
