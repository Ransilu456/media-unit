'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SchoolDashboardView } from '@/components/dashboard/SchoolDashboardView';

function DashboardContent() {
  const searchParams = useSearchParams();
  const entryComp = searchParams.get('entryComp') || undefined;

  return (
    <>
      <Navbar />
      <main className="flex-1 py-10">
        <SchoolDashboardView initialCompetitionId={entryComp} />
      </main>
      <Footer />
    </>
  );
}

export default function DashboardPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600">Loading dashboard...</div>}>
      <DashboardContent />
    </React.Suspense>
  );
}
