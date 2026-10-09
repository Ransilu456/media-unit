'use client';

import { ArrowRight, CheckCircle2, ClipboardCheck, FileText, School, Trophy, Radio, Activity } from 'lucide-react';
import { useMemo } from 'react';
import { useMediaStore } from '@/lib/store';
import type { AdminTab } from '@/components/layout/AdminPortalLayout';
import { StatusBadge } from '@/components/ui/Badge';
import { RadialMetricCard } from '@/components/dashboard/RadialMetricCard';
import { SegmentedGauge } from '@/components/dashboard/SegmentedGauge';
import { ConcentricOrbitalChart } from '@/components/dashboard/ConcentricOrbitalChart';
import { DotMatrixChart } from '@/components/dashboard/DotMatrixChart';
import { StackedBarChart } from '@/components/dashboard/StackedBarChart';

const categoryColors = ['#0f766e', '#2563eb', '#d97706', '#7c3aed', '#0891b2', '#64748b'];

export function AdminOverview({ onTabChange }: { onTabChange: (tab: AdminTab) => void }) {
  const { schools, competitions, submissions, isSchoolsLoaded, isSubmissionsLoaded } = useMediaStore();

  const { pending, verifiedCount, shares, clearancePct, monthlyData, categoryBreakdown } = useMemo(() => {
    let pendingCount = 0;
    let verified = 0;
    const countsByCategory = new Map<string, number>();
    const countsByMonth = new Map<string, number>();

    submissions.forEach((submission) => {
      if (submission.status === 'submitted' || submission.status === 'under_review') pendingCount += 1;
      if (['verified', 'shortlisted', 'winner'].includes(submission.status)) verified += 1;
      countsByCategory.set(
        submission.category,
        (countsByCategory.get(submission.category) ?? 0) + 1
      );

      // Bucket by month (use submittedAt ISO string)
      try {
        const d = new Date(submission.submittedAt);
        const key = d.toLocaleString('en-GB', { month: 'short', year: 'numeric' });
        countsByMonth.set(key, (countsByMonth.get(key) ?? 0) + 1);
      } catch {
        // skip malformed dates
      }
    });

    const total = Math.max(submissions.length, 1);
    const clearance = submissions.length > 0 ? Math.round((verified / submissions.length) * 100) : 0;

    // Build last-6-month labels regardless of data
    const last6: { month: string; count: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString('en-GB', { month: 'short', year: 'numeric' });
      const shortLabel = d.toLocaleString('en-GB', { month: 'short' });
      last6.push({ month: shortLabel, count: countsByMonth.get(label) ?? 0 });
    }

    const catBreakdown = [...countsByCategory].map(([name, count], index) => ({
      name,
      count,
      value: count,
      color: categoryColors[index % categoryColors.length],
    }));

    return {
      pending: pendingCount,
      verifiedCount: verified,
      clearancePct: clearance,
      shares: [...countsByCategory].map(([name, count], index) => ({
        name,
        percentage: Math.round((count / total) * 100),
        color: categoryColors[index % categoryColors.length],
      })),
      monthlyData: last6,
      categoryBreakdown: catBreakdown,
    };
  }, [submissions]);

  const radarEntries = useMemo(() => {
    return submissions.map((s, idx) => ({
      id: s.id,
      title: s.entryTitle,
      studentName: s.studentName,
      category: s.category,
      status: s.status,
      color: categoryColors[idx % categoryColors.length],
    }));
  }, [submissions]);

  const pendingSchools = schools.filter((school) => school.status === 'pending').length;
  const openCompetitions = competitions.filter((competition) => competition.status === 'open').length;

  return (
    <div className="max-w-7xl space-y-6">
      {/* Header with live system indicator */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Agradhi Media Unit · Central Adjudication Console
            </p>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-950">
            Administrator Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time delegation metrics, adjudication radar, and national competition telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-2xs">
            <Radio size={13} className="text-amber-600 animate-pulse" />
            <span>2026 Academic Season Active</span>
          </span>
        </div>
      </section>

      {/* Action Prompt / What needs attention */}
      <section aria-labelledby="admin-next-steps" className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs">
        <div className="mb-4">
          <h2 id="admin-next-steps" className="text-sm font-semibold text-slate-900">What needs attention</h2>
          <p className="mt-0.5 text-xs text-slate-500">Review pending school approvals and judge grading queues.</p>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <button
            type="button"
            onClick={() => onTabChange('submissions')}
            className="group rounded-xl border border-slate-200 p-4 text-left transition-colors hover:border-amber-300 hover:bg-amber-50/40"
          >
            <span className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <ClipboardCheck size={16} className="text-amber-700" /> Review entries
              </span>
              <ArrowRight size={15} className="text-slate-400 group-hover:text-amber-700" />
            </span>
            <span className="mt-2 block text-xs leading-5 text-slate-600">
              {pending
                ? `${pending} ${pending === 1 ? 'entry needs' : 'entries need'} review. Open the submission to set a decision, score, and school feedback.`
                : 'No entries are awaiting review. You can browse all past adjudications.'}
            </span>
          </button>
          <button
            type="button"
            onClick={() => onTabChange('schools')}
            className="group rounded-xl border border-slate-200 p-4 text-left transition-colors hover:border-blue-300 hover:bg-blue-50/40"
          >
            <span className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <School size={16} className="text-blue-700" /> School accounts
              </span>
              <ArrowRight size={15} className="text-slate-400 group-hover:text-blue-700" />
            </span>
            <span className="mt-2 block text-xs leading-5 text-slate-600">
              {pendingSchools
                ? `${pendingSchools} ${pendingSchools === 1 ? 'school is' : 'schools are'} pending approval. Activate a school to let it submit student entries.`
                : 'Review registered schools and check that approved delegations are active.'}
            </span>
          </button>
          <button
            type="button"
            onClick={() => onTabChange('competitions')}
            className="group rounded-xl border border-slate-200 p-4 text-left transition-colors hover:border-teal-300 hover:bg-teal-50/40"
          >
            <span className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Trophy size={16} className="text-teal-700" /> Competition tracks
              </span>
              <ArrowRight size={15} className="text-slate-400 group-hover:text-teal-700" />
            </span>
            <span className="mt-2 block text-xs leading-5 text-slate-600">
              {openCompetitions
                ? `${openCompetitions} tracks currently accepting entries. Check deadlines and entry quotas.`
                : 'All competition gates locked. Open a track to receive submissions.'}
            </span>
          </button>
        </div>
      </section>

      {/* Primary KPI Metrics */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <RadialMetricCard
          label="Registered schools"
          value={String(schools.length)}
          description="All school delegations"
          strokeColor="#2563eb"
          isLoading={!isSchoolsLoaded}
        />
        <RadialMetricCard
          label="Entries received"
          value={String(submissions.length)}
          description="Total student submissions"
          strokeColor="#0f766e"
          isLoading={!isSubmissionsLoaded}
        />
        <RadialMetricCard
          label="Entries in review"
          value={String(pending)}
          percentage={submissions.length ? Math.round((pending / submissions.length) * 100) : 0}
          description="Awaiting jury grading"
          strokeColor="#d97706"
          isLoading={!isSubmissionsLoaded}
        />
        <RadialMetricCard
          label="Verified / finalist"
          value={String(verifiedCount)}
          percentage={submissions.length ? Math.round((verifiedCount / submissions.length) * 100) : 0}
          description="Cleared &amp; adjudicated"
          strokeColor="#7c3aed"
          isLoading={!isSubmissionsLoaded}
        />
      </section>

      {/* Visual Analytics Showcase: Concentric Orbital Radar + Segmented Gauge */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <ConcentricOrbitalChart
            percentage={clearancePct}
            label="Adjudication Clearance Radar"
            sublabel={
              submissions.length > 0
                ? `${verifiedCount} of ${submissions.length} student entries evaluated by jury board`
                : 'Awaiting student entries for live radar telemetry'
            }
            entries={radarEntries}
            categories={categoryBreakdown}
            totalSubmissions={submissions.length}
          />
        </div>

        <div className="lg:col-span-6">
          <SegmentedGauge
            title="Category distribution"
            subtitle={`${openCompetitions} competition tracks active`}
            totalCount={submissions.length}
            countLabel="Entries"
            categories={shares}
          />
        </div>
      </section>

      {/* Stacked Bar Chart for Competition Velocity */}
      <section>
        <StackedBarChart
          title="All-Island Competition Velocity & Intake"
          totalSubmissions={submissions.length}
          period="Active 2026 Academic Season"
          schoolCount={schools.length}
          monthlyData={monthlyData}
          categoryBreakdown={categoryBreakdown}
        />
      </section>

      {/* Activity Heatmap & Recent Submissions Grid */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left: Recent Submissions Feed */}
        <div className="xl:col-span-7 rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Recent student submissions</h2>
              <p className="text-xs text-slate-500 mt-0.5">Live status and judge evaluation</p>
            </div>
            <button
              type="button"
              onClick={() => onTabChange('submissions')}
              className="text-xs font-semibold text-slate-700 hover:text-slate-950 underline underline-offset-4"
            >
              {pending ? `Review ${pending} entries` : 'View all'}
            </button>
          </div>

          {!isSubmissionsLoaded ? (
            <div className="divide-y divide-slate-100 p-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3.5 animate-pulse">
                  <div className="h-9 w-9 rounded-xl bg-slate-100 shrink-0" />
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <div className="h-3.5 w-44 rounded bg-slate-200/80" />
                    <div className="h-2.5 w-28 rounded bg-slate-100" />
                  </div>
                  <div className="h-6 w-16 rounded-full bg-slate-100 shrink-0" />
                </div>
              ))}
            </div>
          ) : submissions.length ? (
            <div className="divide-y divide-slate-100">
              {submissions.slice(0, 6).map((submission) => (
                <div key={submission.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/50 transition-colors">
                  <div className="h-9 w-9 shrink-0 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                    <FileText size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{submission.entryTitle}</p>
                    <p className="truncate text-xs text-slate-500">{submission.studentName} · {submission.schoolName}</p>
                  </div>
                  <StatusBadge status={submission.status} />
                </div>
              ))}
            </div>
          ) : (
            <div className="px-5 py-12 text-center">
              <CheckCircle2 size={24} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-medium text-slate-700">No submissions yet</p>
              <p className="text-xs text-slate-500 mt-1">Entries will appear here as registered school delegations submit their files.</p>
            </div>
          )}
        </div>

        {/* Right: Dot Matrix Chart */}
        <div className="xl:col-span-5">
          <DotMatrixChart
            title="Monthly Submission Pulse"
            subtitle="Delegation entry intake across active academic calendar"
            monthlyData={monthlyData}
            totalSubmissions={submissions.length}
          />
        </div>
      </section>

      {/* Footer Metrics */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'Open competitions', value: openCompetitions, icon: Trophy },
          { label: 'Total competitions', value: competitions.length, icon: FileText },
          { label: 'Registered schools', value: schools.length, icon: School },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-2xs">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <Icon size={16} />
            </span>
            <span className="min-w-0">
              <span className="block text-lg font-bold leading-tight text-slate-900">{value}</span>
              <span className="block text-xs text-slate-500">{label}</span>
            </span>
          </div>
        ))}
      </section>
    </div>
  );
}
