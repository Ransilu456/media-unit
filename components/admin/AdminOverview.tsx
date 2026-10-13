'use client';

import { ArrowRight, CheckCircle2, ClipboardCheck, School, Trophy } from 'lucide-react';
import { useMemo } from 'react';
import { useMediaStore } from '@/lib/store';
import type { AdminTab } from '@/components/layout/AdminPortalLayout';
import { StatusBadge } from '@/components/ui/Badge';
import { RadialMetricCard } from '@/components/dashboard/RadialMetricCard';
import { SegmentedGauge } from '@/components/dashboard/SegmentedGauge';
import { DotMatrixChart } from '@/components/dashboard/DotMatrixChart';
import { StackedBarChart } from '@/components/dashboard/StackedBarChart';

const categoryColors = ['#f97316', '#3b82f6', '#14b8a6', '#22c55e', '#fb923c', '#0ea5e9'];

function formatSubmissionDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(date);
}

export function AdminOverview({ onTabChange }: { onTabChange: (tab: AdminTab) => void }) {
  const { schools, competitions, submissions, isSchoolsLoaded, isSubmissionsLoaded } = useMediaStore();

  const { pending, verifiedCount, shares, monthlyData, categoryBreakdown } = useMemo(() => {
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
      shares: [...countsByCategory].map(([name, count], index) => ({
        name,
        percentage: Math.round((count / total) * 100),
        color: categoryColors[index % categoryColors.length],
      })),
      monthlyData: last6,
      categoryBreakdown: catBreakdown,
    };
  }, [submissions]);

  const recentSubmissionGroups = useMemo(() => {
    const groups = new Map<string, {
      schoolName: string;
      schoolLocation: string;
      competitions: Map<string, { title: string; submissions: typeof submissions }>;
    }>();
    [...submissions]
      .sort((left, right) => (Date.parse(right.submittedAt) || 0) - (Date.parse(left.submittedAt) || 0))
      .slice(0, 6)
      .forEach((submission) => {
        const schoolId = submission.schoolId || submission.schoolName;
        const schoolName = schools.find((school) => school.id === submission.schoolId)?.name
          ?? submission.schoolName
          ?? 'Unregistered school';
        const schoolRecord = schools.find((school) => school.id === submission.schoolId);
        let group = groups.get(schoolId);
        if (!group) {
          group = {
            schoolName,
            schoolLocation: schoolRecord
              ? [schoolRecord.district, schoolRecord.province].filter(Boolean).join(', ')
              : '',
            competitions: new Map(),
          };
          groups.set(schoolId, group);
        }
        const competition = group.competitions.get(submission.competitionId);
        if (competition) competition.submissions.push(submission);
        else group.competitions.set(submission.competitionId, {
          title: submission.competitionTitle,
          submissions: [submission],
        });
      });
    return [...groups.entries()].map(([schoolId, group]) => [
      schoolId,
      {
        schoolName: group.schoolName,
        schoolLocation: group.schoolLocation,
        competitions: [...group.competitions.entries()],
      },
    ] as const);
  }, [schools, submissions]);

  const pendingSchools = schools.filter((school) => school.status === 'pending').length;
  const openCompetitions = competitions.filter((competition) => competition.status === 'open').length;

  return (
    <div className="max-w-7xl space-y-5">
      <section aria-label="Admin shortcuts" className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <button
            type="button"
            onClick={() => onTabChange('submissions')}
            className="group flex items-center justify-between gap-3 rounded-2xl border border-sky-100 bg-white p-4 text-left shadow-[0_8px_28px_rgba(59,130,246,0.07)] transition-colors hover:bg-sky-50/70"
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                <ClipboardCheck size={18} />
              </span>
              <span>
                <span className="block text-sm font-semibold text-slate-900">Review entries</span>
                <span className="mt-0.5 block text-xs text-slate-500">{pending} awaiting review</span>
              </span>
            </span>
            <ArrowRight size={16} className="shrink-0 text-sky-500 transition-transform group-hover:translate-x-0.5" />
          </button>
          <button
            type="button"
            onClick={() => onTabChange('schools')}
            className="group flex items-center justify-between gap-3 rounded-2xl border border-teal-100 bg-white p-4 text-left shadow-[0_8px_28px_rgba(20,184,166,0.07)] transition-colors hover:bg-teal-50/70"
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                <School size={18} />
              </span>
              <span>
                <span className="block text-sm font-semibold text-slate-900">Schools</span>
                <span className="mt-0.5 block text-xs text-slate-500">{pendingSchools} pending approval</span>
              </span>
            </span>
            <ArrowRight size={16} className="shrink-0 text-teal-500 transition-transform group-hover:translate-x-0.5" />
          </button>
          <button
            type="button"
            onClick={() => onTabChange('competitions')}
            className="group flex items-center justify-between gap-3 rounded-2xl border border-orange-100 bg-white p-4 text-left shadow-[0_8px_28px_rgba(249,115,22,0.07)] transition-colors hover:bg-orange-50/70"
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
                <Trophy size={18} />
              </span>
              <span>
                <span className="block text-sm font-semibold text-slate-900">Competitions</span>
                <span className="mt-0.5 block text-xs text-slate-500">{openCompetitions} open</span>
              </span>
            </span>
            <ArrowRight size={16} className="shrink-0 text-orange-500 transition-transform group-hover:translate-x-0.5" />
          </button>
      </section>

      {/* Primary KPI Metrics */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <RadialMetricCard
          label="Registered schools"
          value={String(schools.length)}
          strokeColor="#3b82f6"
          isLoading={!isSchoolsLoaded}
        />
        <RadialMetricCard
          label="Entries received"
          value={String(submissions.length)}
          strokeColor="#f97316"
          isLoading={!isSubmissionsLoaded}
        />
        <RadialMetricCard
          label="Entries in review"
          value={String(pending)}
          percentage={submissions.length ? Math.round((pending / submissions.length) * 100) : 0}
          strokeColor="#14b8a6"
          isLoading={!isSubmissionsLoaded}
        />
        <RadialMetricCard
          label="Verified / finalist"
          value={String(verifiedCount)}
          percentage={submissions.length ? Math.round((verifiedCount / submissions.length) * 100) : 0}
          strokeColor="#22c55e"
          isLoading={!isSubmissionsLoaded}
        />
      </section>

      <section className="min-w-0">
        <SegmentedGauge
          title="Category distribution"
          subtitle={`${openCompetitions} competitions open`}
          totalCount={submissions.length}
          countLabel="Entries"
          categories={shares}
        />
      </section>

      {/* Stacked Bar Chart for Competition Velocity */}
      <section>
        <StackedBarChart
          title="Entries over time"
          totalSubmissions={submissions.length}
          period="Current season"
          schoolCount={schools.length}
          monthlyData={monthlyData}
          categoryBreakdown={categoryBreakdown}
        />
      </section>

      {/* Recent submissions and monthly activity */}
      <section className="grid grid-cols-1 items-start gap-4 xl:grid-cols-12">
        {/* Left: Recent Submissions Feed */}
        <div className="overflow-hidden rounded-2xl border border-sky-100/80 bg-white shadow-[0_8px_28px_rgba(59,130,246,0.07)] xl:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-orange-50/60 via-white to-sky-50/60 px-4 py-4 sm:px-5">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Recent submissions</h2>
              <p className="mt-1 text-xs text-slate-500">Latest entries, organized by school and competition</p>
            </div>
            <button
              type="button"
              onClick={() => onTabChange('submissions')}
              className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-orange-200 bg-white px-3 py-2 text-xs font-semibold text-orange-900 shadow-sm transition-colors hover:bg-orange-50"
            >
              <span>{pending ? 'Review queue' : 'All submissions'}</span>
              {pending > 0 && <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] tabular-nums text-orange-900">{pending}</span>}
              <ArrowRight size={13} />
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
            <div aria-label="Latest school submissions" className="max-h-[26rem] divide-y divide-slate-100 overflow-y-auto">
              {recentSubmissionGroups.map(([schoolId, group]) => {
                const entryCount = group.competitions.reduce(
                  (total, [, competition]) => total + competition.submissions.length,
                  0
                );
                return (
                <section key={schoolId} className="px-3 py-2 sm:px-4">
                  <div className="mb-1 flex items-center justify-between gap-3 rounded-lg bg-slate-50/80 px-2.5 py-2">
                    <span className="flex min-w-0 items-center gap-2.5">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
                        <School size={14} />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-semibold text-slate-900">{group.schoolName}</span>
                        {group.schoolLocation && <span className="block truncate text-[10px] leading-3 text-slate-500">{group.schoolLocation}</span>}
                      </span>
                    </span>
                    <span className="shrink-0 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-600">
                      {entryCount} {entryCount === 1 ? 'entry' : 'entries'}
                    </span>
                  </div>
                  {group.competitions.map(([competitionId, competition]) => (
                    <div key={competitionId}>
                      {competition.submissions.map((submission) => (
                        <div key={submission.id} className="flex items-center gap-2.5 border-t border-slate-100 px-2.5 py-2 transition-colors hover:bg-orange-50/30">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold text-slate-900">{submission.entryTitle}</p>
                            <p className="mt-0.5 flex min-w-0 items-center gap-1 text-[10px] leading-4 text-slate-500">
                              <span className="shrink-0">{submission.studentName}</span>
                              <span className="shrink-0 text-slate-300">·</span>
                              <Trophy size={10} className="shrink-0 text-orange-600" />
                              <span className="truncate">{competition.title}</span>
                              <span className="shrink-0 text-slate-300">·</span>
                              <span className="shrink-0">{formatSubmissionDate(submission.submittedAt)}</span>
                            </p>
                          </div>
                          <StatusBadge status={submission.status} />
                        </div>
                      ))}
                    </div>
                  ))}
                </section>
                );
              })}
            </div>
          ) : (
            <div className="px-5 py-12 text-center">
              <CheckCircle2 size={24} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-medium text-slate-700">No submissions yet</p>
            </div>
          )}
        </div>

        {/* Right: Dot Matrix Chart */}
        <div className="xl:col-span-5">
          <DotMatrixChart
            title="Monthly entries"
            subtitle="Entries by month"
            monthlyData={monthlyData}
            totalSubmissions={submissions.length}
          />
        </div>
      </section>

    </div>
  );
}
