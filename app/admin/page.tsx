'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useMediaStore } from '@/lib/store';
import { AdminPortalLayout, AdminTab } from '@/components/layout/AdminPortalLayout';
import { PortalSkeleton } from '@/components/ui/PortalSkeleton';
import { FirestoreNetworkError } from '@/components/ui/FirestoreNetworkError';

const AdminOverview = dynamic(
  () => import('@/components/admin/AdminOverview').then((module) => module.AdminOverview),
  { loading: () => <PortalSkeleton sections={2} /> }
);
const AdminSubmissionsReview = dynamic(
  () => import('@/components/admin/AdminSubmissionsReview').then((module) => module.AdminSubmissionsReview),
  { loading: () => <PortalSkeleton sections={3} /> }
);
const AdminCompetitionsManager = dynamic(
  () => import('@/components/admin/AdminCompetitionsManager').then((module) => module.AdminCompetitionsManager),
  { loading: () => <PortalSkeleton sections={2} /> }
);
const AdminSchoolsManager = dynamic(
  () => import('@/components/admin/AdminSchoolsManager').then((module) => module.AdminSchoolsManager),
  { loading: () => <PortalSkeleton sections={3} /> }
);

export default function AdminPage() {
  const {
    session,
    isLoaded,
    sessionError,
    competitionsError,
    schoolsError,
    submissionsError,
    retrySession,
    retryCompetitions,
    retrySchools,
    retrySubmissions,
    isCompetitionsLoaded,
    isSchoolsLoaded,
    isSubmissionsLoaded,
  } = useMediaStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  React.useEffect(() => {
    if (isLoaded && !sessionError && session.type !== 'admin') {
      router.push('/login?tab=admin');
    }
  }, [isLoaded, sessionError, session.type, router]);

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <PortalSkeleton sections={2} />
      </main>
    );
  }
  if (sessionError) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl">
          <FirestoreNetworkError
            title="Unable to verify your session"
            message="The admin session could not be checked because Firebase or the session service is unreachable."
            onRetry={retrySession}
          />
        </div>
      </main>
    );
  }
  if (session.type !== 'admin') return null;
  if (!isCompetitionsLoaded || !isSchoolsLoaded || !isSubmissionsLoaded) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <PortalSkeleton sections={2} />
      </main>
    );
  }

  return (
    <AdminPortalLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="mb-6 space-y-3">
        {competitionsError && (
          <FirestoreNetworkError
            compact
            title="Competition data is temporarily unavailable"
            message={competitionsError}
            onRetry={retryCompetitions}
          />
        )}
        {schoolsError && (
          <FirestoreNetworkError
            compact
            title="School data is temporarily unavailable"
            message={schoolsError}
            onRetry={retrySchools}
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
      {activeTab === 'overview' && <AdminOverview onTabChange={setActiveTab} />}
      {activeTab === 'submissions' && <AdminSubmissionsReview />}
      {activeTab === 'competitions' && <AdminCompetitionsManager />}
      {activeTab === 'schools' && <AdminSchoolsManager />}
    </AdminPortalLayout>
  );
}
