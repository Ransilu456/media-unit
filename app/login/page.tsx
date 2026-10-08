'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { AuthPageShell } from '@/components/layout/AuthPageShell';
import { LoginForm } from '@/components/forms/LoginForm';
import { FormSkeleton } from '@/components/ui/PortalSkeleton';

function LoginContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const initialTab = tabParam === 'admin' ? 'admin' : 'school';

  return (
    <AuthPageShell>
      <div className="w-full">
        <LoginForm initialTab={initialTab} />
      </div>
    </AuthPageShell>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={
      <AuthPageShell>
        <FormSkeleton />
      </AuthPageShell>
    }>
      <LoginContent />
    </React.Suspense>
  );
}
