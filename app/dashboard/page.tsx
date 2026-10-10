'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams, useRouter } from 'next/navigation';
import { useMediaStore } from '@/lib/store';
import { SchoolPortalLayout, SchoolTab } from '@/components/layout/SchoolPortalLayout';
import { PortalSkeleton } from '@/components/ui/PortalSkeleton';
import { FirestoreNetworkError } from '@/components/ui/FirestoreNetworkError';

const SchoolDashboardView = dynamic(
  () => import('@/components/dashboard/SchoolDashboardView').then((module) => module.SchoolDashboardView),
  { loading: () => <PortalSkeleton sections={3} /> }
);

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const {
    session,
    isLoaded,
    sessionError,
    competitionsError,
    submissionsError,
    retrySession,
    retryCompetitions,
    retrySubmissions,
    isCompetitionsLoaded,
    isSubmissionsLoaded,
  } = useMediaStore();
  const [activeTab, setActiveTab] = useState<SchoolTab>('overview');

  React.useEffect(() => {
    if (isLoaded && !sessionError && session.type !== 'school') {
      router.push('/login');
    }
  }, [isLoaded, sessionError, session.type, router]);

  if (!isLoaded) return <PortalSkeleton sections={3} />;
  if (sessionError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
        <div className="w-full max-w-xl">
          <FirestoreNetworkError
            title="Unable to verify your session"
            message="Your school account could not be checked because Firebase is unreachable."
            onRetry={retrySession}
          />
        </div>
      </main>
    );
  }
  if (session.type !== 'school') return null;

  const entryComp = searchParams.get('entryComp') || undefined;
  const isDataLoading = !isCompetitionsLoaded || !isSubmissionsLoaded;

  return (
    <SchoolPortalLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {isDataLoading ? (
        <PortalSkeleton sections={3} />
      ) : (
        <>
          <div className="mb-6 space-y-3">
            {competitionsError && (
              <FirestoreNetworkError
                compact
                title="Competition data is temporarily unavailable"
                message={competitionsError}
                onRetry={retryCompetitions}
              />
            )}
            {submissionsError && (
              <FirestoreNetworkError
                compact
                title="Submission data is temporarily unavailable"
                message={submissionsError}
                onRetry={retrySubmissions}
              />
            )}
          </div>
          <SchoolDashboardView
            activeTab={activeTab}
            onTabChange={setActiveTab}
            initialCompetitionId={entryComp}
          />
        </>
      )}
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
