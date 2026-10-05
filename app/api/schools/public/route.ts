import { readDb } from '@/lib/db';

export async function GET() {
  const schools = readDb().schools.map(({ id, name, province, district, badgeCode }) => ({
    id,
    name,
    province,
    district,
    badgeCode,
  }));
  return Response.json({ success: true, data: schools });
}
