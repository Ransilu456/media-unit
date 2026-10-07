import { PortalSkeleton } from '@/components/ui/PortalSkeleton';

export default function AdminLoading() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <PortalSkeleton sections={2} />
    </main>
  );
}
