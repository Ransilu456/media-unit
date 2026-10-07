'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { LoginForm } from '@/components/forms/LoginForm';
import { FormSkeleton } from '@/components/ui/PortalSkeleton';

function LoginContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const initialTab = tabParam === 'admin' ? 'admin' : 'school';

  return (
    <>
      <Navbar />
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-[calc(100vh-200px)]">
        <LoginForm initialTab={initialTab} />
      </main>
      <Footer />
    </>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
        <FormSkeleton />
      </main>
    }>
      <LoginContent />
    </React.Suspense>
  );
}
