'use client';

import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useMediaStore } from '@/lib/store';
import { SchoolPortalLayout, SchoolTab } from '@/components/layout/SchoolPortalLayout';
import { SchoolDashboardView } from '@/components/dashboard/SchoolDashboardView';

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { session, isLoaded } = useMediaStore();
  const [activeTab, setActiveTab] = useState<SchoolTab>('overview');

  React.useEffect(() => {
    if (isLoaded && session.type !== 'school') {
      router.push('/login');
    }
  }, [isLoaded, session.type, router]);

  if (!isLoaded || session.type !== 'school') return null;

  const entryComp = searchParams.get('entryComp') || undefined;

  return (
    <SchoolPortalLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <SchoolDashboardView
        activeTab={activeTab}
        onTabChange={setActiveTab}
        initialCompetitionId={entryComp}
      />
    </SchoolPortalLayout>
  );
}

export default function DashboardPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center">
        <p className="text-slate-500 text-sm">Loading portal...</p>
      </div>
    }>
      <DashboardContent />
    </React.Suspense>
  );
}
