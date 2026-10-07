import { FormSkeleton } from '@/components/ui/PortalSkeleton';

export default function LoginLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <FormSkeleton />
    </main>
  );
}
