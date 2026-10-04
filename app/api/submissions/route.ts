import { NextRequest } from 'next/server';
import { readDb, mutateDb } from '@/lib/db';
import { Submission } from '@/lib/types';

// GET /api/submissions?schoolId=xxx
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const schoolId = searchParams.get('schoolId');

  const db = readDb();
  const data = schoolId
    ? db.submissions.filter((s) => s.schoolId === schoolId)
    : db.submissions;

  return Response.json({ success: true, data });
}

// POST /api/submissions — create a new entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // ── Required field validation ───────────────────────────────
    const requiredFields: string[] = [
      'competitionId',
      'competitionTitle',
      'competitionMedium',
      'schoolId',
      'schoolName',
      'category',
      'studentName',
      'studentGrade',
      'studentBirthday',
      'studentContact',
      'entryTitle',
      'submissionLink',
      'synopsis',
    ];

    for (const field of requiredFields) {
      const val = body[field];
      if (val === undefined || val === null || !String(val).trim()) {
        return Response.json(
          { success: false, error: `Field "${field}" is required.` },
          { status: 400 }
        );
      }
    }

    // ── Birthday / age validation ───────────────────────────────
    const birthday = new Date(body.studentBirthday);
    if (isNaN(birthday.getTime())) {
      return Response.json(
        { success: false, error: 'Invalid student birthday date.' },
        { status: 400 }
      );
    }

    const today = new Date();
    const age = Math.floor(
      (today.getTime() - birthday.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    );

    if (age < 5 || age > 25) {
      return Response.json(
        { success: false, error: `Calculated age (${age}) seems incorrect. Please verify the birthday.` },
        { status: 400 }
      );
    }

    // ── URL validation ─────────────────────────────────────────
    try {
      new URL(body.submissionLink);
    } catch {
      return Response.json(
        { success: false, error: 'Submission link must be a valid URL (https://...).' },
        { status: 400 }
      );
    }

    // ── Synopsis length ────────────────────────────────────────
    const wordCount = String(body.synopsis).trim().split(/\s+/).length;
    if (wordCount < 20) {
      return Response.json(
        { success: false, error: 'Synopsis must be at least 20 words.' },
        { status: 400 }
      );
    }

    // ── Custom fields validation ───────────────────────────────
    const customValues: Record<string, string> = body.customValues ?? {};
    const customFieldErrors: string[] = body.requiredCustomFields ?? [];
    for (const fieldId of customFieldErrors) {
      if (!customValues[fieldId]?.trim()) {
        return Response.json(
          { success: false, error: `Required field "${fieldId}" is missing.` },
          { status: 400 }
        );
      }
    }

    // ── Per-competition entry limit check ───────────────────────
    const db = readDb();
    const existingCount = db.submissions.filter(
      (s) => s.competitionId === body.competitionId && s.schoolId === body.schoolId
    ).length;

    if (body.maxEntriesPerSchool && existingCount >= body.maxEntriesPerSchool) {
      return Response.json(
        { success: false, error: `Entry limit (${body.maxEntriesPerSchool}) reached for this competition.` },
        { status: 409 }
      );
    }

    // ── Create submission ──────────────────────────────────────
    const newSub: Submission = {
      id: `sub-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      competitionId: body.competitionId,
      competitionTitle: body.competitionTitle,
      competitionMedium: body.competitionMedium,
      schoolId: body.schoolId,
      schoolName: body.schoolName,
      category: body.category,
      studentName: String(body.studentName).trim(),
      studentGrade: String(body.studentGrade).trim(),
      studentBirthday: body.studentBirthday,
      studentAge: age,
      studentContact: String(body.studentContact).trim(),
      entryTitle: String(body.entryTitle).trim(),
      submissionLink: String(body.submissionLink).trim(),
      synopsis: String(body.synopsis).trim(),
      customValues,
      status: 'submitted',
      submittedAt: new Date().toISOString().split('T')[0],
    };

    mutateDb((d) => d.submissions.unshift(newSub));

    return Response.json({ success: true, data: newSub }, { status: 201 });
  } catch (err: unknown) {
    console.error('[POST /api/submissions]', err);
    return Response.json(
      { success: false, error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
