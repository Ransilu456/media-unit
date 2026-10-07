import { NextRequest, NextResponse } from 'next/server';
import { getRequestSession } from '@/lib/auth';
import { readDb } from '@/lib/db';
import { isFirestoreAvailable, syncAllToFirestore, fetchAllFromFirestore } from '@/lib/firebaseDb';

export async function GET(request: NextRequest) {
  const session = getRequestSession(request.headers.get('cookie'));
  if (session?.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
  }

  const isOnline = await isFirestoreAvailable(2500);
  const localDb = readDb();

  return NextResponse.json({
    success: true,
    data: {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? 'keshan-a8827',
      isFirestoreOnline: isOnline,
      localCounts: {
        competitions: localDb.competitions.length,
        schools: localDb.schools.length,
        submissions: localDb.submissions.length,
      },
    },
  });
}

export async function POST(request: NextRequest) {
  const session = getRequestSession(request.headers.get('cookie'));
  if (session?.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
  }

  const localDb = readDb();
  const result = await syncAllToFirestore(localDb);

  if (!result.success) {
    return NextResponse.json(
      {
        success: false,
        error:
          result.error ||
          'Failed to sync with Cloud Firestore. Please ensure Firestore is created in Firebase Console.',
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: `Successfully synced ${result.count} records to Cloud Firestore.`,
    count: result.count,
  });
}
