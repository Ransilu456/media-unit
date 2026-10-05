import { NextRequest, NextResponse } from 'next/server';
import { readDb, mutateDb } from '@/lib/db';
import {
  createSessionToken,
  hashPassword,
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
  stripSchoolPassword,
  verifyPassword,
} from '@/lib/auth';

// POST /api/schools/login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return Response.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const db = readDb();
    const school = db.schools.find(
      (s) => s.email.toLowerCase() === String(email).toLowerCase()
    );

    if (!school) {
      return Response.json(
        { success: false, error: 'Email or password is incorrect.' },
        { status: 401 }
      );
    }

    if (!school.password || typeof password !== 'string') {
      return Response.json(
        { success: false, error: 'Email or password is incorrect.' },
        { status: 401 }
      );
    }

    if (school.status !== 'active') {
      return Response.json(
        { success: false, error: 'This school account is not active. Contact Agradhi admin.' },
        { status: 403 }
      );
    }

    const passwordCheck = verifyPassword(password, school.password);
    if (!passwordCheck.valid) {
      return Response.json(
        { success: false, error: 'Email or password is incorrect.' },
        { status: 401 }
      );
    }
    if (passwordCheck.needsRehash) {
      const upgradedPassword = hashPassword(password);
      mutateDb((database) => {
        const record = database.schools.find((entry) => entry.id === school.id);
        if (record) record.password = upgradedPassword;
      });
    }

    const response = NextResponse.json({
      success: true,
      data: stripSchoolPassword(school),
    });
    response.cookies.set(
      SESSION_COOKIE_NAME,
      createSessionToken({ role: 'school', schoolId: school.id }),
      sessionCookieOptions()
    );
    return response;
  } catch (err: unknown) {
    console.error('[POST /api/schools/login]', err);
    return Response.json(
      { success: false, error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
