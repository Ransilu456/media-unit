'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams, useRouter } from 'next/navigation';
import { useMediaStore } from '@/lib/store';
import { SchoolPortalLayout, SchoolTab } from '@/components/layout/SchoolPortalLayout';
import { PortalSkeleton } from '@/components/ui/PortalSkeleton';

const SchoolDashboardView = dynamic(
  () => import('@/components/dashboard/SchoolDashboardView').then((module) => module.SchoolDashboardView),
  { loading: () => <PortalSkeleton sections={3} /> }
);

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { session, isLoaded, isCompetitionsLoaded, isSubmissionsLoaded } = useMediaStore();
  const [activeTab, setActiveTab] = useState<SchoolTab>('overview');

  React.useEffect(() => {
    if (isLoaded && session.type !== 'school') {
      router.push('/login');
    }
  }, [isLoaded, session.type, router]);

  if (!isLoaded) return <PortalSkeleton sections={3} />;
  if (session.type !== 'school') return null;
  if (!isCompetitionsLoaded || !isSubmissionsLoaded) return <PortalSkeleton sections={3} />;

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
      <main className="min-h-screen bg-[#f0f2f5] px-4 py-8 sm:px-6 lg:px-8">
        <PortalSkeleton sections={3} />
      </main>
    }>
      <DashboardContent />
    </React.Suspense>
  );
}
