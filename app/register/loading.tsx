import { FormSkeleton } from '@/components/ui/PortalSkeleton';

export default function RegisterLoading() {
  return (
    <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-slate-50 px-4 py-12">
      <FormSkeleton />
    </main>
  );
}
