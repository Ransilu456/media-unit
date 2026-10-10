import { NextRequest, NextResponse } from 'next/server';
import { readDb, mutateDb } from '@/lib/db';
import { RegisteredSchool } from '@/lib/types';
import {
  getRequestSession,
  stripSchoolPassword,
} from '@/lib/auth';
import {
  InvalidRequestError,
  readJsonRequest,
} from '@/lib/validation';

const SCHOOL_STATUSES = ['active', 'pending', 'suspended', 'banned'] as const;

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

// Registration is handled by Firebase Authentication and reviewed by an administrator.
export async function POST() {
  return NextResponse.json(
    { success: false, error: 'Register through the school registration page. New accounts remain pending until an administrator approves them.' },
    { status: 410 }
  );
}

export async function PATCH(request: NextRequest) {
  const session = getRequestSession(request.headers.get('cookie'));
  if (session?.role !== 'admin') {
    return Response.json(
      { success: false, error: 'Admin access required.' },
      { status: 401 }
    );
  }

  try {
    const body = await readJsonRequest(request);
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      return Response.json({ success: false, error: 'Invalid school update.' }, { status: 400 });
    }
    const input = body as Record<string, unknown>;
    if (
      Object.keys(input).some((key) => key !== 'id' && key !== 'status')
      || typeof input.id !== 'string'
      || input.id.trim().length === 0
      || !SCHOOL_STATUSES.some((status) => status === input.status)
    ) {
      return Response.json({ success: false, error: 'Invalid school update.' }, { status: 400 });
    }

    const updatedDb = mutateDb((database) => {
      const record = database.schools.find((entry) => entry.id === input.id);
      if (record) record.status = input.status as RegisteredSchool['status'];
    });
    const school = updatedDb.schools.find((record) => record.id === input.id);
    if (!school) {
      return Response.json({ success: false, error: 'School not found.' }, { status: 404 });
    }

    return Response.json({ success: true, data: stripSchoolPassword(school) });
  } catch (error: unknown) {
    if (error instanceof InvalidRequestError) {
      return Response.json({ success: false, error: error.message }, { status: 400 });
    }
    console.error('[PATCH /api/schools]', error);
    return Response.json(
      { success: false, error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
