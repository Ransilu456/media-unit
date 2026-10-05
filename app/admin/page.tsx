'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMediaStore } from '@/lib/store';
import { AdminPortalLayout, AdminTab } from '@/components/layout/AdminPortalLayout';
import { AdminSubmissionsReview } from '@/components/admin/AdminSubmissionsReview';
import { AdminCompetitionsManager } from '@/components/admin/AdminCompetitionsManager';
import { AdminSchoolsManager } from '@/components/admin/AdminSchoolsManager';
import { AdminOverview } from '@/components/admin/AdminOverview';

export default function AdminPage() {
  const { session, isLoaded } = useMediaStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  React.useEffect(() => {
    if (isLoaded && session.type !== 'admin') {
      router.push('/login?tab=admin');
    }
  }, [isLoaded, session.type, router]);

  if (!isLoaded || session.type !== 'admin') return null;

  return (
    <AdminPortalLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'overview' && <AdminOverview onTabChange={setActiveTab} />}
      {activeTab === 'submissions' && <AdminSubmissionsReview />}
      {activeTab === 'competitions' && <AdminCompetitionsManager />}
      {activeTab === 'schools' && <AdminSchoolsManager />}
    </AdminPortalLayout>
  );
}
