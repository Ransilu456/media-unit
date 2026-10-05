import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { readDb } from '@/lib/db';
import {
  SESSION_COOKIE_NAME,
  stripSchoolPassword,
  verifySessionToken,
} from '@/lib/auth';

export async function GET() {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);

  if (session?.role === 'admin') {
    return NextResponse.json({
      success: true,
      data: { type: 'admin', adminName: 'Agradhi Executive Board' },
    });
  }

  if (session?.role === 'school') {
    const school = readDb().schools.find((record) => record.id === session.schoolId);
    if (school?.status === 'active') {
      return NextResponse.json({
        success: true,
        data: { type: 'school', school: stripSchoolPassword(school) },
      });
    }
  }

  const response = NextResponse.json({
    success: true,
    data: { type: 'guest' },
  });
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
