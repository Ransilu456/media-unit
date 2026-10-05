import { randomUUID } from 'node:crypto';
import { NextRequest } from 'next/server';
import { getRequestSession } from '@/lib/auth';
import { INITIAL_COMPETITIONS } from '@/lib/constants';
import { readDb, mutateDb } from '@/lib/db';
import { Submission } from '@/lib/types';
import {
  InvalidRequestError,
  calculateAge,
  readJsonRequest,
  validateSubmissionInput,
} from '@/lib/validation';

export async function GET(request: NextRequest) {
  const session = getRequestSession(request.headers.get('cookie'));
  if (!session) {
    return Response.json(
      { success: false, error: 'Authentication required.' },
      { status: 401 }
    );
  }

  const db = readDb();
  if (session.role === 'admin') {
    return Response.json({ success: true, data: db.submissions });
  }
  const school = db.schools.find((record) => record.id === session.schoolId);
  if (!school || school.status !== 'active') {
    return Response.json(
      { success: false, error: 'Active school session required.' },
      { status: 403 }
    );
  }

  return Response.json({
    success: true,
    data: db.submissions.filter((submission) => submission.schoolId === session.schoolId),
  });
}

export async function POST(request: NextRequest) {
  try {
    const session = getRequestSession(request.headers.get('cookie'));
    if (!session) {
      return Response.json(
        { success: false, error: 'Authentication required.' },
        { status: 401 }
      );
    }
    if (session.role !== 'school') {
      return Response.json(
        { success: false, error: 'Only school accounts can submit entries.' },
        { status: 403 }
      );
    }

    const body = await readJsonRequest(request);
    const validationErrors = validateSubmissionInput(body);
    if (Object.keys(validationErrors).length > 0) {
      return Response.json(
        {
          success: false,
          errors: validationErrors,
          error: Object.values(validationErrors)[0],
        },
        { status: 400 }
      );
    }
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      return Response.json({ success: false, error: 'Invalid submission data.' }, { status: 400 });
    }
    const input = body as Record<string, unknown>;
    if (input.schoolId !== session.schoolId) {
      return Response.json(
        { success: false, error: 'You can only submit entries for your own school.' },
        { status: 403 }
      );
    }

    const db = readDb();
    const school = db.schools.find((record) => record.id === session.schoolId);
    if (!school || school.status !== 'active') {
      return Response.json(
        { success: false, error: 'Active school session required.' },
        { status: 403 }
      );
    }
    const competition = INITIAL_COMPETITIONS.find((item) => item.id === input.competitionId);
    if (!competition || competition.status !== 'open') {
      return Response.json(
        { success: false, error: 'This competition is not accepting entries.' },
        { status: 400 }
      );
    }

    const existingCount = db.submissions.filter(
      (entry) => entry.competitionId === competition.id && entry.schoolId === school.id
    ).length;
    if (existingCount >= competition.maxEntriesPerSchool) {
      return Response.json(
        {
          success: false,
          error: `Entry limit (${competition.maxEntriesPerSchool}) reached for this competition.`,
        },
        { status: 409 }
      );
    }

    const studentBirthday = input.studentBirthday as string;
    const submittedAt = new Date().toISOString().slice(0, 10);
    const age = calculateAge(studentBirthday, new Date(`${submittedAt}T23:59:59.999Z`));
    if (age === null) {
      return Response.json(
        { success: false, error: 'Enter a valid student birthday.' },
        { status: 400 }
      );
    }

    const newSubmission: Submission = {
      id: `sub-${Date.now().toString(36)}-${randomUUID().slice(0, 8)}`,
      competitionId: competition.id,
      competitionTitle: competition.title,
      competitionMedium: competition.medium,
      schoolId: school.id,
      schoolName: school.name,
      category: competition.category,
      studentName: (input.studentName as string).trim(),
      studentGrade: (input.studentGrade as string).trim(),
      studentBirthday,
      studentAge: age,
      studentContact: (input.studentContact as string).trim(),
      entryTitle: (input.entryTitle as string).trim(),
      submissionLink: (input.submissionLink as string).trim(),
      synopsis: (input.synopsis as string).trim(),
      customValues: (input.customValues ?? {}) as Record<string, string>,
      status: 'submitted',
      submittedAt,
    };

    mutateDb((database) => database.submissions.unshift(newSubmission));
    return Response.json({ success: true, data: newSubmission }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof InvalidRequestError) {
      return Response.json({ success: false, error: error.message }, { status: 400 });
    }
    console.error('[POST /api/submissions]', error);
    return Response.json(
      { success: false, error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
