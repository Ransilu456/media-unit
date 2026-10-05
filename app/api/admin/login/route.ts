import { NextRequest, NextResponse } from 'next/server';
import {
  constantTimeStringEqual,
  createSessionToken,
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
} from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword || adminPassword.length < 12) {
      console.error('[POST /api/admin/login] Admin credentials are not configured securely.');
      return NextResponse.json(
        { success: false, error: 'Admin login is not configured. Contact the site administrator.' },
        { status: 503 }
      );
    }
    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      email.trim().toLowerCase() !== adminEmail.trim().toLowerCase() ||
      !constantTimeStringEqual(password, adminPassword)
    ) {
      return NextResponse.json(
        { success: false, error: 'Invalid admin credentials.' },
        { status: 401 }
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
      { success: false, error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
