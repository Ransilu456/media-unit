'use client';

import { ArrowRight, CheckCircle2, ClipboardCheck, FileText, School, Trophy } from 'lucide-react';
import { useMemo } from 'react';
import { useMediaStore } from '@/lib/store';
import type { AdminTab } from '@/components/layout/AdminPortalLayout';
import { StatusBadge } from '@/components/ui/Badge';
import { RadialMetricCard } from '@/components/dashboard/RadialMetricCard';
import { SegmentedGauge } from '@/components/dashboard/SegmentedGauge';

const categoryColors = ['#0f766e', '#2563eb', '#d97706', '#7c3aed', '#0891b2', '#64748b'];

export function AdminOverview({ onTabChange }: { onTabChange: (tab: AdminTab) => void }) {
  const { schools, competitions, submissions } = useMediaStore();
  const { pending, verifiedCount, shares } = useMemo(() => {
    let pendingCount = 0;
    let verified = 0;
    const countsByCategory = new Map<string, number>();
    submissions.forEach((submission) => {
      if (submission.status === 'submitted' || submission.status === 'under_review') pendingCount += 1;
      if (['verified', 'shortlisted', 'winner'].includes(submission.status)) verified += 1;
      countsByCategory.set(
        submission.category,
        (countsByCategory.get(submission.category) ?? 0) + 1
      );
    });

    return {
      pending: pendingCount,
      verifiedCount: verified,
      shares: [...countsByCategory].map(([name, count], index) => ({
        name,
        percentage: Math.round((count / Math.max(submissions.length, 1)) * 100),
        color: categoryColors[index % categoryColors.length],
      })),
    };
  }, [submissions]);
  const pendingSchools = schools.filter((school) => school.status === 'pending').length;
  const openCompetitions = competitions.filter((competition) => competition.status === 'open').length;

  return (
    <div className="max-w-7xl space-y-6">
      <section className="flex flex-col gap-1">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">Agradhi Media Unit · 2026</p>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-950">Admin overview</h1>
        <p className="text-sm text-slate-500">Your starting point for reviewing entries and keeping the competition on track.</p>
      </section>

      <section aria-labelledby="admin-next-steps" className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="mb-4">
          <h2 id="admin-next-steps" className="text-sm font-semibold text-slate-900">What needs attention</h2>
          <p className="mt-1 text-xs text-slate-500">Choose a task to see details and make changes.</p>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <button
            type="button"
            onClick={() => onTabChange('submissions')}
            className="group rounded-lg border border-slate-200 p-4 text-left transition-colors hover:border-amber-300 hover:bg-amber-50/40"
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
                : 'No entries are awaiting review. You can still browse all past decisions.'}
            </span>
          </button>
          <button
            type="button"
            onClick={() => onTabChange('schools')}
            className="group rounded-lg border border-slate-200 p-4 text-left transition-colors hover:border-blue-300 hover:bg-blue-50/40"
          >
            <span className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <School size={16} className="text-blue-700" /> School accounts
              </span>
              <ArrowRight size={15} className="text-slate-400 group-hover:text-blue-700" />
            </span>
            <span className="mt-2 block text-xs leading-5 text-slate-600">
              {pendingSchools
                ? `${pendingSchools} ${pendingSchools === 1 ? 'school is' : 'schools are'} pending approval. Activate a school to let it sign in and submit entries.`
                : 'Review registered schools and check that the approved accounts are active.'}
            </span>
          </button>
          <button
            type="button"
            onClick={() => onTabChange('competitions')}
            className="group rounded-lg border border-slate-200 p-4 text-left transition-colors hover:border-teal-300 hover:bg-teal-50/40"
          >
            <span className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Trophy size={16} className="text-teal-700" /> Competition setup
              </span>
              <ArrowRight size={15} className="text-slate-400 group-hover:text-teal-700" />
            </span>
            <span className="mt-2 block text-xs leading-5 text-slate-600">
              {openCompetitions
                ? `${openCompetitions} competitions are open. Check their deadlines, entry limits, and application questions.`
                : 'No competitions are open. Open a competition when its entry details and deadline are ready.'}
            </span>
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <RadialMetricCard
          label="Registered schools"
          value={String(schools.length)}
          description="All school accounts"
          strokeColor="#2563eb"
        />
        <RadialMetricCard
          label="Entries received"
          value={String(submissions.length)}
          description="Entries received from schools"
          strokeColor="#0f766e"
        />
        <RadialMetricCard
          label="Entries in review"
          value={String(pending)}
          percentage={submissions.length ? Math.round((pending / submissions.length) * 100) : 0}
          description="Awaiting or actively being reviewed"
          strokeColor="#d97706"
        />
        <RadialMetricCard
          label="Verified / finalist"
          value={String(verifiedCount)}
          percentage={submissions.length ? Math.round((verifiedCount / submissions.length) * 100) : 0}
          description="Accepted or advanced"
          strokeColor="#7c3aed"
        />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <div className="xl:col-span-2">
          <SegmentedGauge
            title="Entry categories"
            subtitle={`${openCompetitions} competitions open`}
            totalCount={submissions.length}
            countLabel="Entries"
            categories={shares}
          />
        </div>

        <div className="xl:col-span-3 rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Recent submissions</h2>
              <p className="text-xs text-slate-500 mt-0.5">Latest entries and their current review status</p>
            </div>
            <button
              type="button"
              onClick={() => onTabChange('submissions')}
              className="text-xs font-medium text-slate-700 hover:text-slate-950 underline underline-offset-4"
            >
              {pending ? `Review ${pending}` : 'View all'}
            </button>
          </div>
          {submissions.length ? (
            <div className="divide-y divide-slate-100">
              {submissions.slice(0, 6).map((submission) => (
                <div key={submission.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="h-9 w-9 shrink-0 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                    <FileText size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{submission.entryTitle}</p>
                    <p className="truncate text-xs text-slate-500">{submission.studentName} · {submission.schoolName}</p>
                  </div>
                  <StatusBadge status={submission.status} />
                </div>
              ))}
            </div>
          ) : (
            <div className="px-5 py-12 text-center">
              <CheckCircle2 size={22} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-medium text-slate-700">No submissions yet</p>
              <p className="text-xs text-slate-500 mt-1">Entries will appear here after an active school submits an application.</p>
            </div>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'Open competitions', value: openCompetitions, icon: Trophy },
          { label: 'Total competitions', value: competitions.length, icon: FileText },
          { label: 'Registered schools', value: schools.length, icon: School },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <Icon size={16} />
            </span>
            <span className="min-w-0">
              <span className="block text-lg font-semibold leading-tight text-slate-900">{value}</span>
              <span className="block text-xs text-slate-500">{label}</span>
            </span>
          </div>
        ))}
      </section>
    </div>
  );
}
