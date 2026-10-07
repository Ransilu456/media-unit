import { randomUUID } from 'node:crypto';
import { NextRequest } from 'next/server';
import { getRequestSession } from '@/lib/auth';
import { readDb, mutateDb } from '@/lib/db';
import { Submission, SubmissionStatus } from '@/lib/types';
import {
  InvalidRequestError,
  calculateAge,
  isSubmissionInput,
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
    const db = readDb();
    const validationErrors = validateSubmissionInput(body, db.competitions);
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
    if (!isSubmissionInput(body)) {
      return Response.json({ success: false, error: 'Invalid submission data.' }, { status: 400 });
    }
    const input = body;
    if (input.schoolId !== session.schoolId) {
      return Response.json(
        { success: false, error: 'You can only submit entries for your own school.' },
        { status: 403 }
      );
    }

    const school = db.schools.find((record) => record.id === session.schoolId);
    if (!school || school.status !== 'active') {
      return Response.json(
        { success: false, error: 'Active school session required.' },
        { status: 403 }
      );
    }
    const competition = db.competitions.find((item) => item.id === input.competitionId);
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

    const studentBirthday = input.studentBirthday;
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
      studentName: input.studentName.trim(),
      studentGrade: input.studentGrade.trim(),
      studentBirthday,
      studentAge: age,
      studentContact: input.studentContact.trim(),
      entryTitle: input.entryTitle.trim(),
      submissionLink: input.submissionLink.trim(),
      synopsis: input.synopsis.trim(),
      ...(input.customValues && Object.keys(input.customValues).length > 0
        ? { customValues: input.customValues }
        : {}),
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
      return Response.json({ success: false, error: 'Invalid submission update.' }, { status: 400 });
    }
    const input = body as Record<string, unknown>;
    const allowedFields = new Set(['id', 'status', 'score', 'feedback']);
    const statuses: readonly SubmissionStatus[] = [
      'submitted',
      'under_review',
      'verified',
      'shortlisted',
      'winner',
      'disqualified',
    ];
    if (
      Object.keys(input).some((key) => !allowedFields.has(key))
      || typeof input.id !== 'string'
      || input.id.trim().length === 0
      || (input.status !== undefined && !statuses.some((status) => status === input.status))
      || (input.score !== undefined
        && (typeof input.score !== 'number' || !Number.isFinite(input.score) || input.score < 0 || input.score > 100))
      || (input.feedback !== undefined
        && (typeof input.feedback !== 'string' || input.feedback.length > 2000))
      || (input.status === 'disqualified'
        && (typeof input.feedback !== 'string' || !input.feedback.trim()))
      || (input.status === undefined && input.score === undefined && input.feedback === undefined)
    ) {
      return Response.json({ success: false, error: 'Invalid submission update.' }, { status: 400 });
    }

    const updatedDb = mutateDb((database) => {
      const record = database.submissions.find((entry) => entry.id === input.id);
      if (!record) return;
      if (input.status !== undefined) record.status = input.status as SubmissionStatus;
      if (input.score !== undefined) record.score = input.score as number;
      if (input.feedback !== undefined) record.judgeFeedback = input.feedback as string;
    });
    const submission = updatedDb.submissions.find((record) => record.id === input.id);
    if (!submission) {
      return Response.json({ success: false, error: 'Submission not found.' }, { status: 404 });
    }

    return Response.json({ success: true, data: submission });
  } catch (error: unknown) {
    if (error instanceof InvalidRequestError) {
      return Response.json({ success: false, error: error.message }, { status: 400 });
    }
    console.error('[PATCH /api/submissions]', error);
    return Response.json(
      { success: false, error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
