'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Camera,
  Clapperboard,
  FilePlus2,
  Mail,
  MapPin,
  Mic2,
  Radio,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react';
import type { Competition, RegisteredSchool, Submission } from '@/lib/types';
import { StatusBadge } from '@/components/ui/Badge';
import type { SchoolTab } from '@/components/layout/SchoolPortalLayout';

interface Props {
  school: RegisteredSchool;
  competitions: Competition[];
  submissions: Submission[];
  isCompetitionsLoaded: boolean;
  isSubmissionsLoaded: boolean;
  onTabChange: (tab: SchoolTab) => void;
  onSelectCompetition: (competition: Competition) => void;
}

const categoryStyles: Record<string, { icon: typeof Camera; color: string; art: string }> = {
  'Photography': { icon: Camera, color: 'bg-amber-100 text-amber-800', art: 'from-amber-100 to-amber-50' },
  'News Reading & Announcing': { icon: Mic2, color: 'bg-rose-100 text-rose-800', art: 'from-rose-100 to-orange-50' },
  'Radio Play & Audio Production': { icon: Radio, color: 'bg-orange-100 text-orange-800', art: 'from-orange-100 to-rose-50' },
  'Short Film & Cinematography': { icon: Clapperboard, color: 'bg-amber-100 text-amber-900', art: 'from-amber-100 to-yellow-50' },
  'Graphic Design & Digital Art': { icon: Sparkles, color: 'bg-emerald-100 text-emerald-800', art: 'from-emerald-100 to-amber-50' },
  'Live Media Reporting': { icon: Mic2, color: 'bg-orange-100 text-orange-800', art: 'from-orange-100 to-amber-50' },
};

export function SchoolDashboardOverview({
  school,
  competitions,
  submissions,
  isCompetitionsLoaded,
  isSubmissionsLoaded,
  onTabChange,
  onSelectCompetition,
}: Props) {
  const enteredCompetitions = competitions.filter((competition) =>
    submissions.some((submission) => submission.competitionId === competition.id)
  );
  const reviewCount = submissions.filter((submission) => submission.status === 'submitted').length;
  const activeCount = submissions.filter((submission) => submission.status !== 'disqualified').length;
  const accountStatus: Record<RegisteredSchool['status'], { label: string; description: string; style: string }> = {
    active: {
      label: 'Active',
      description: 'Your school can submit competition entries.',
      style: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    },
    pending: {
      label: 'Waiting for approval',
      description: 'Your registration is waiting for review.',
      style: 'border-amber-200 bg-amber-50 text-amber-900',
    },
    suspended: {
      label: 'Access paused',
      description: 'School access is paused. Contact the competition team for help.',
      style: 'border-orange-200 bg-orange-50 text-orange-900',
    },
    banned: {
      label: 'Account blocked',
      description: 'This school account cannot submit entries.',
      style: 'border-rose-200 bg-rose-50 text-rose-800',
    },
  };
  const status = accountStatus[school.status];
  const recentSubmissions = [...submissions]
    .sort((a, b) => Date.parse(b.submittedAt) - Date.parse(a.submittedAt))
    .slice(0, 4);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-12">
        <section className="relative isolate flex min-h-[250px] flex-col justify-between overflow-hidden rounded-[28px] bg-sara-navy p-6 text-white shadow-[0_20px_45px_rgba(15,23,42,0.16)] sm:p-8 xl:col-span-8">
          <div className="pointer-events-none absolute -right-14 -top-28 -z-10 h-80 w-80 rounded-full border border-amber-300/15" />
          <div className="pointer-events-none absolute -right-2 -top-16 -z-10 h-56 w-56 rounded-full border border-amber-300/15" />
          <div className="absolute bottom-0 right-0 h-40 w-2/3 bg-gradient-to-t from-amber-900/30 to-transparent" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {school.status === 'active' ? 'School portal' : status.label}
            </div>
            <h2 className="mt-5 max-w-xl text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
              Welcome back,
              <span className="mt-1 block text-amber-300">{school.name}</span>
            </h2>
            <p className="mt-3 max-w-lg text-xs leading-6 text-slate-300 sm:text-sm">
              Add your students’ work to a competition and follow each entry here.
            </p>
          </div>
          <div className="relative z-10 mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onTabChange('apply')}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-xs font-bold text-slate-950 transition hover:bg-amber-400"
            >
              <FilePlus2 size={15} />
              Add a student entry
            </button>
            <span className="rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 font-mono text-[10px] text-white/70">
              School code · {school.badgeCode}
            </span>
          </div>
          <div className="pointer-events-none absolute bottom-8 right-9 hidden h-24 w-28 items-center justify-center rounded-[28px] border border-white/10 bg-white/[0.06] text-amber-300/90 lg:flex">
            <Trophy size={43} strokeWidth={1.2} />
            <Sparkles size={17} className="absolute -right-2 -top-2 text-amber-200" />
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-6 xl:col-span-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">School account</h3>
              <p className="mt-1 text-[11px] text-slate-400">Status and details</p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-800">
              <ShieldCheck size={18} />
            </span>
          </div>
          <div className={`mt-4 rounded-2xl border p-3.5 ${status.style}`}>
            <p className="text-xs font-bold">{status.label}</p>
            <p className="mt-1 text-[11px] leading-5 opacity-80">{status.description}</p>
          </div>
          <dl className="mt-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-[11px] text-slate-500">School code</dt>
              <dd className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-[11px] font-semibold text-slate-800">{school.badgeCode}</dd>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-600">
              <MapPin size={14} className="shrink-0 text-amber-700" />
              <span className="truncate">{school.district}, {school.province}</span>
            </div>
          </dl>
          <a href={`mailto:${school.email}`} className="mt-4 flex min-w-0 items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-[11px] text-slate-600 transition hover:bg-amber-50">
            <Mail size={14} className="shrink-0 text-amber-700" />
            <span className="truncate">{school.email}</span>
          </a>
        </section>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          { label: 'Student entries', value: submissions.length, detail: 'All time', color: 'border-slate-200 bg-white', icon: Users, loading: !isSubmissionsLoaded },
          { label: 'Waiting for review', value: reviewCount, detail: 'Sent to the team', color: 'border-amber-200 bg-amber-50/70', icon: FilePlus2, loading: !isSubmissionsLoaded },
          { label: 'Competitions entered', value: enteredCompetitions.length, detail: 'Your school', color: 'border-emerald-200 bg-emerald-50/70', icon: Trophy, loading: !isCompetitionsLoaded || !isSubmissionsLoaded },
          { label: 'Active entries', value: activeCount, detail: 'Not rejected', color: 'border-amber-200 bg-amber-50/70', icon: Sparkles, loading: !isSubmissionsLoaded },
        ].map(({ label, value, detail, color, icon: Icon, loading }) => (
          <div key={label} className={`rounded-2xl border p-4 sm:p-5 ${color}`}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
                {loading ? (
                  <div aria-label={`Loading ${label.toLowerCase()}`} className="mt-2 h-9 w-12 animate-pulse rounded bg-slate-200" />
                ) : (
                  <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
                )}
                <p className="mt-1 text-[10px] text-slate-400">{detail}</p>
              </div>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/80 text-amber-800">
                <Icon size={17} />
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-12">
        <section className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-6 xl:col-span-8">
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-amber-700">Your entries</p>
              <h3 className="mt-1 text-lg font-bold text-slate-900">Competitions you entered</h3>
            </div>
            <button type="button" onClick={() => onTabChange('students')} className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-amber-800">
              View entries <ArrowRight size={13} />
            </button>
          </div>

          {!isCompetitionsLoaded || !isSubmissionsLoaded ? (
            <div aria-label="Loading competitions" className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {[0, 1, 2].map((index) => (
                <div key={index} className="h-64 animate-pulse rounded-2xl border border-slate-100 bg-slate-50" />
              ))}
            </div>
          ) : enteredCompetitions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
              <Trophy size={25} className="mx-auto text-slate-300" />
              <p className="mt-3 text-sm font-semibold text-slate-700">You have not entered a competition yet</p>
              <p className="mt-1 text-xs text-slate-500">Choose a competition to submit your first student entry.</p>
              <button
                type="button"
                onClick={() => onTabChange('competitions')}
                className="mt-4 rounded-xl bg-sara-navy px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800"
              >
                Browse competitions
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {enteredCompetitions.map((competition) => {
                const style = categoryStyles[competition.category] ?? categoryStyles['Short Film & Cinematography'];
                const Icon = style.icon;
                const competitionEntries = submissions.filter((submission) => submission.competitionId === competition.id);
                const used = competitionEntries.filter((submission) => submission.status !== 'disqualified').length;
                const limit = competition.maxEntriesPerSchool || 1;
                const full = used >= limit;
                return (
                  <article key={competition.id} className="overflow-hidden rounded-2xl border border-slate-100 bg-white transition hover:-translate-y-0.5 hover:shadow-lg">
                    <div className={`relative flex h-28 items-center justify-center overflow-hidden bg-gradient-to-br ${style.art}`}>
                      <span className="absolute -right-5 -top-10 h-32 w-32 rounded-full border-[18px] border-white/40" />
                      <span className={`relative flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm ${style.color}`}>
                        <Icon size={27} />
                      </span>
                      <span className="absolute bottom-2 left-3 rounded-full bg-white/80 px-2 py-1 text-[9px] font-semibold text-slate-600">
                        {competition.status === 'open' ? 'Entries open' : 'Entries closed'}
                      </span>
                    </div>
                    <div className="p-4">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{competition.category}</p>
                      <h4 className="mt-1 line-clamp-2 min-h-10 text-sm font-bold leading-5 text-slate-900">{competition.title}</h4>
                      <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500">
                        <span>Your student entries</span>
                        <span className="font-semibold text-slate-700">{used} / {limit}</span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-amber-500" style={{ width: `${Math.min(100, (used / limit) * 100)}%` }} />
                      </div>
                      <button
                        type="button"
                        disabled={full || competition.status !== 'open'}
                        onClick={() => onSelectCompetition(competition)}
                        className="mt-4 w-full rounded-xl bg-sara-navy px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                      >
                        {competition.status !== 'open' ? 'Entries are closed' : full ? 'Entry limit reached' : 'Add a student'}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-6 xl:col-span-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-amber-700">Updates</p>
              <h3 className="mt-1 text-base font-bold text-slate-900">Recent entries</h3>
            </div>
            <button type="button" onClick={() => onTabChange('students')} className="text-[11px] font-semibold text-slate-500 hover:text-amber-800">View all</button>
          </div>
          {!isSubmissionsLoaded ? (
            <div aria-label="Loading recent entries" className="divide-y divide-slate-100">
              {[0, 1, 2].map((index) => (
                <div key={index} className="flex animate-pulse items-center gap-3 py-4">
                  <span className="h-9 w-9 shrink-0 rounded-xl bg-slate-100" />
                  <span className="flex-1 space-y-2">
                    <span className="block h-3 w-3/4 rounded bg-slate-200" />
                    <span className="block h-2.5 w-1/2 rounded bg-slate-100" />
                  </span>
                </div>
              ))}
            </div>
          ) : recentSubmissions.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {recentSubmissions.map((submission) => (
                <div key={submission.id} className="flex items-start gap-3 py-4">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-800">
                    <Trophy size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-slate-800">{submission.entryTitle}</p>
                    <p className="mt-0.5 truncate text-[10px] text-slate-400">{submission.studentName} · {submission.studentGrade}</p>
                    <div className="mt-2"><StatusBadge status={submission.status} /></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center">
              <Users size={24} className="mx-auto text-slate-300" />
              <p className="mt-3 text-xs font-semibold text-slate-700">No entries yet</p>
              <p className="mt-1 text-[10px] text-slate-400">Choose an open competition to add your first student.</p>
            </div>
          )}
          <Link href="/rules" className="mt-2 flex items-center justify-center gap-1 rounded-xl border border-slate-200 px-3 py-2.5 text-[11px] font-semibold text-slate-600 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-900">
            Read the entry rules <ArrowRight size={13} />
          </Link>
        </section>
      </div>
    </div>
  );
}
