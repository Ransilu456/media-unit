import { FormSkeleton } from '@/components/ui/PortalSkeleton';
import { AuthPageShell } from '@/components/layout/AuthPageShell';

export default function RegisterLoading() {
  return (
    <AuthPageShell>
      <FormSkeleton />
    </AuthPageShell>
  );
}
