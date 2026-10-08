import { FormSkeleton } from '@/components/ui/PortalSkeleton';
import { AuthPageShell } from '@/components/layout/AuthPageShell';

export default function LoginLoading() {
  return (
    <AuthPageShell>
      <FormSkeleton />
    </AuthPageShell>
  );
}
