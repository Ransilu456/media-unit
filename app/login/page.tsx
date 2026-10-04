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
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-[calc(100vh-200px)]">
        <LoginForm initialTab={initialTab} />
      </main>
      <Footer />
    </>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">Loading...</div>}>
      <LoginContent />
    </React.Suspense>
  );
}
