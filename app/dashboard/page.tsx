'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams, useRouter } from 'next/navigation';
import { useMediaStore } from '@/lib/store';
import { SchoolPortalLayout, SchoolTab } from '@/components/layout/SchoolPortalLayout';
import { PortalOverviewSkeleton } from '@/components/ui/PortalSkeleton';
import { FirestoreNetworkError } from '@/components/ui/FirestoreNetworkError';

const SchoolDashboardView = dynamic(
  () => import('@/components/dashboard/SchoolDashboardView').then((module) => module.SchoolDashboardView),
  { loading: () => <PortalOverviewSkeleton /> }
);

const noop = () => {};

function DashboardRouteSkeleton() {
  return (
    <SchoolPortalLayout
      activeTab="overview"
      onTabChange={noop}
      searchQuery=""
      onSearchQueryChange={noop}
    >
      <PortalOverviewSkeleton />
    </SchoolPortalLayout>
  );
}

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
  } = useMediaStore();
  const [activeTab, setActiveTab] = useState<SchoolTab>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const handleSearchQueryChange = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) setActiveTab('students');
  };

  React.useEffect(() => {
    if (isLoaded && !sessionError && session.type !== 'school') {
      router.push('/login');
    }
  }, [isLoaded, sessionError, session.type, router]);

  if (!isLoaded) {
    return (
      <SchoolPortalLayout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchQueryChange={handleSearchQueryChange}
      >
        <PortalOverviewSkeleton />
      </SchoolPortalLayout>
    );
  }
  if (sessionError) {
    return (
      <SchoolPortalLayout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchQueryChange={handleSearchQueryChange}
      >
        <div className="mx-auto flex min-h-[50vh] w-full max-w-xl items-center justify-center px-2 py-8">
          <FirestoreNetworkError
            title="Unable to verify your session"
            message="Your school account could not be checked because Firebase is unreachable."
            onRetry={retrySession}
          />
        </div>
      </SchoolPortalLayout>
    );
  }
  if (session.type !== 'school') return null;

  const entryComp = searchParams.get('entryComp') || undefined;

  return (
    <SchoolPortalLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      searchQuery={searchQuery}
      onSearchQueryChange={handleSearchQueryChange}
    >
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
          searchEntryQuery={searchQuery}
          onSearchEntryQueryChange={setSearchQuery}
          initialCompetitionId={entryComp}
        />
      </>
    </SchoolPortalLayout>
  );
}

export default function DashboardPage() {
  return (
    <React.Suspense fallback={<DashboardRouteSkeleton />}>
      <DashboardContent />
    </React.Suspense>
  );
}
