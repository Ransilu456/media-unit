import { NextRequest } from 'next/server';
import { readDb, mutateDb } from '@/lib/db';
import { RegisteredSchool } from '@/lib/types';

// GET /api/schools  — list all registered schools
export async function GET() {
  const db = readDb();
  return Response.json({ success: true, data: db.schools });
}

// POST /api/schools  — register a new school
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // ── Validation ─────────────────────────────────────────────
    const required: string[] = [
      'name', 'province', 'district',
      'teacherInCharge', 'teacherPhone',
      'email', 'password',
    ];
    for (const field of required) {
      if (!body[field] || !String(body[field]).trim()) {
        return Response.json(
          { success: false, error: `Field "${field}" is required.` },
          { status: 400 }
        );
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return Response.json(
        { success: false, error: 'Invalid email address.' },
        { status: 400 }
      );
    }

    if (body.password.length < 4) {
      return Response.json(
        { success: false, error: 'Password must be at least 4 characters.' },
        { status: 400 }
      );
    }

    // Duplicate email check
    const db = readDb();
    const emailExists = db.schools.some(
      (s) => s.email.toLowerCase() === body.email.toLowerCase()
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
      name: String(body.name).trim(),
      registrationNumber: body.registrationNumber?.trim() || `SCH-${Date.now().toString(36).toUpperCase()}`,
      province: String(body.province).trim(),
      district: String(body.district).trim(),
      teacherInCharge: String(body.teacherInCharge).trim(),
      teacherPhone: String(body.teacherPhone).trim(),
      mediaPresident: String(body.mediaPresident ?? '').trim(),
      presidentPhone: String(body.presidentPhone ?? '').trim(),
      email: String(body.email).trim().toLowerCase(),
      password: String(body.password),
      status: 'active',
      registeredAt: new Date().toISOString().split('T')[0],
      badgeCode: `AMU-SCL-${String(db.schools.length + 18).padStart(3, '0')}`,
    };

    const updated = mutateDb((d) => d.schools.unshift(newSchool));

    return Response.json({ success: true, data: newSchool }, { status: 201 });
  } catch (err: unknown) {
    console.error('[POST /api/schools]', err);
    return Response.json(
      { success: false, error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
