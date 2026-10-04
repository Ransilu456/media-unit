import { NextRequest } from 'next/server';
import { readDb, mutateDb } from '@/lib/db';
import { RegisteredSchool } from '@/lib/types';

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
        { success: false, error: 'No school found with this email address.' },
        { status: 401 }
      );
    }

    if (school.password && school.password !== password) {
      return Response.json(
        { success: false, error: 'Incorrect password.' },
        { status: 401 }
      );
    }

    if (school.status === 'suspended') {
      return Response.json(
        { success: false, error: 'This school account has been suspended. Contact Agradhi admin.' },
        { status: 403 }
      );
    }

    // Return school data without password
    const { password: _pw, ...safeSchool } = school;
    return Response.json({ success: true, data: safeSchool });
  } catch (err: unknown) {
    console.error('[POST /api/schools/login]', err);
    return Response.json(
      { success: false, error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
