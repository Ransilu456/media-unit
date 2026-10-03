'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { LoginForm } from '@/components/forms/LoginForm';

function LoginContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const initialTab = tabParam === 'admin' ? 'admin' : 'school';

  return (
    <>
      <Navbar />
      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
        <LoginForm initialTab={initialTab} />
      </main>
      <Footer />
    </>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600">Loading...</div>}>
      <LoginContent />
    </React.Suspense>
  );
}
