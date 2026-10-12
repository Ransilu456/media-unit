import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from '@/lib/auth';

export async function GET() {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);

  if (session?.role === 'admin') {
    return NextResponse.json({
      success: true,
      data: {
        type: 'admin',
        adminName: 'Agradhi Executive Board',
      },
    });
  }

  return NextResponse.json({
    success: true,
    data: { type: 'guest' },
  });
}
