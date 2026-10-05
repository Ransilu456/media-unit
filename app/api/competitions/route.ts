import { randomUUID } from 'node:crypto';
import { NextRequest } from 'next/server';
import { getRequestSession } from '@/lib/auth';
import { readDb, mutateDb } from '@/lib/db';
import type { Competition } from '@/lib/types';
import { InvalidRequestError, readJsonRequest, validateCompetitionInput } from '@/lib/validation';

function isAdmin(request: NextRequest): boolean {
  return getRequestSession(request.headers.get('cookie'))?.role === 'admin';
}

export async function GET() {
  try {
    return Response.json({ success: true, data: readDb().competitions });
  } catch (error: unknown) {
    console.error('[GET /api/competitions]', error);
    return Response.json(
      { success: false, error: 'Unable to load competitions.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) {
    return Response.json({ success: false, error: 'Admin access required.' }, { status: 401 });
  }

  try {
    const body = await readJsonRequest(request);
    const errors = validateCompetitionInput(body);
    if (Object.keys(errors).length > 0) {
      return Response.json(
        { success: false, errors, error: Object.values(errors)[0] },
        { status: 400 }
      );
    }

    const competitionData = body as Omit<Competition, 'id'>;
    const db = readDb();
    if (db.competitions.some((competition) => competition.slug === competitionData.slug)) {
      return Response.json(
        { success: false, error: 'A competition with this slug already exists.' },
        { status: 409 }
      );
    }

    const competition: Competition = { ...competitionData, id: `comp-${randomUUID()}` };
    mutateDb((database) => database.competitions.push(competition));
    return Response.json({ success: true, data: competition }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof InvalidRequestError) {
      return Response.json({ success: false, error: error.message }, { status: 400 });
    }
    console.error('[POST /api/competitions]', error);
    return Response.json(
      { success: false, error: 'Unable to save the competition.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  if (!isAdmin(request)) {
    return Response.json({ success: false, error: 'Admin access required.' }, { status: 401 });
  }

  try {
    const body = await readJsonRequest(request);
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      return Response.json({ success: false, error: 'Invalid competition update.' }, { status: 400 });
    }
    const { id, ...competitionData } = body as Record<string, unknown>;
    if (typeof id !== 'string' || !id.trim()) {
      return Response.json({ success: false, error: 'Competition ID is required.' }, { status: 400 });
    }
    const errors = validateCompetitionInput(competitionData);
    if (Object.keys(errors).length > 0) {
      return Response.json(
        { success: false, errors, error: Object.values(errors)[0] },
        { status: 400 }
      );
    }

    const db = readDb();
    if (!db.competitions.some((competition) => competition.id === id)) {
      return Response.json({ success: false, error: 'Competition not found.' }, { status: 404 });
    }
    const updated = competitionData as Omit<Competition, 'id'>;
    if (db.competitions.some((competition) => competition.id !== id && competition.slug === updated.slug)) {
      return Response.json(
        { success: false, error: 'A competition with this slug already exists.' },
        { status: 409 }
      );
    }

    const updatedDb = mutateDb((database) => {
      const index = database.competitions.findIndex((competition) => competition.id === id);
      if (index >= 0) database.competitions[index] = { ...updated, id };
    });
    const competition = updatedDb.competitions.find((record) => record.id === id);
    if (!competition) {
      return Response.json({ success: false, error: 'Competition not found.' }, { status: 404 });
    }
    return Response.json({ success: true, data: competition });
  } catch (error: unknown) {
    if (error instanceof InvalidRequestError) {
      return Response.json({ success: false, error: error.message }, { status: 400 });
    }
    console.error('[PATCH /api/competitions]', error);
    return Response.json(
      { success: false, error: 'Unable to save the competition.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAdmin(request)) {
    return Response.json({ success: false, error: 'Admin access required.' }, { status: 401 });
  }

  try {
    const body = await readJsonRequest(request);
    if (typeof body !== 'object' || body === null || Array.isArray(body)
      || Object.keys(body).some((key) => key !== 'id')) {
      return Response.json({ success: false, error: 'Competition ID is required.' }, { status: 400 });
    }

    const competitionId = (body as Record<string, unknown>).id;
    if (typeof competitionId !== 'string' || !competitionId.trim()) {
      return Response.json({ success: false, error: 'Competition ID is required.' }, { status: 400 });
    }
    const db = readDb();
    const competition = db.competitions.find((record) => record.id === competitionId);
    if (!competition) {
      return Response.json({ success: false, error: 'Competition not found.' }, { status: 404 });
    }
    if (db.submissions.some((submission) => submission.competitionId === competition.id)) {
      return Response.json(
        { success: false, error: 'This competition has submissions and cannot be deleted.' },
        { status: 409 }
      );
    }

    mutateDb((database) => {
      database.competitions = database.competitions.filter((record) => record.id !== competition.id);
    });
    return Response.json({ success: true, data: { id: competition.id } });
  } catch (error: unknown) {
    if (error instanceof InvalidRequestError) {
      return Response.json({ success: false, error: error.message }, { status: 400 });
    }
    console.error('[DELETE /api/competitions]', error);
    return Response.json(
      { success: false, error: 'Unable to delete the competition.' },
      { status: 500 }
    );
  }
}
