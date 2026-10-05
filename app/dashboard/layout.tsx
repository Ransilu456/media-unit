import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth';
import { readDb } from '@/lib/db';

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  if (session?.role !== 'school') redirect('/login');

  const school = readDb().schools.find((record) => record.id === session.schoolId);
  if (!school || school.status !== 'active') redirect('/login');

  return children;
}
