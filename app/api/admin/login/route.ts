import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdminAuth } from '@/lib/firebaseAdmin';
import { createSessionToken, SESSION_COOKIE_NAME, sessionCookieOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization');
    const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : '';
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Sign in with your Firebase account first.' },
        { status: 401 }
      );
    }

    const decodedToken = await getFirebaseAdminAuth().verifyIdToken(token, true);
    if (decodedToken.admin !== true) {
      return NextResponse.json(
        { success: false, error: 'This Firebase account does not have admin access.' },
        { status: 403 }
      );
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(
      SESSION_COOKIE_NAME,
      createSessionToken({ role: 'admin' }),
      sessionCookieOptions()
    );
    return response;
  } catch (error: unknown) {
    console.error('[POST /api/admin/login]', error);
    return NextResponse.json(
      { success: false, error: 'Unable to verify admin access. Please sign in again.' },
      { status: 500 }
    );
  }
}
