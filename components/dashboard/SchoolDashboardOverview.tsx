'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Camera,
  Clapperboard,
  FilePlus2,
  Mic2,
  Radio,
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
  onTabChange: (tab: SchoolTab) => void;
  onSelectCompetition: (competition: Competition) => void;
}

const categoryStyles: Record<string, { icon: typeof Camera; color: string; art: string }> = {
  'Photography': { icon: Camera, color: 'bg-sky-100 text-sky-800', art: 'from-sky-100 to-cyan-50' },
  'News Reading & Announcing': { icon: Mic2, color: 'bg-rose-100 text-rose-800', art: 'from-rose-100 to-orange-50' },
  'Radio Play & Audio Production': { icon: Radio, color: 'bg-violet-100 text-violet-800', art: 'from-violet-100 to-fuchsia-50' },
  'Short Film & Cinematography': { icon: Clapperboard, color: 'bg-amber-100 text-amber-900', art: 'from-amber-100 to-yellow-50' },
  'Graphic Design & Digital Art': { icon: Sparkles, color: 'bg-emerald-100 text-emerald-800', art: 'from-emerald-100 to-teal-50' },
  'Live Media Reporting': { icon: Mic2, color: 'bg-orange-100 text-orange-800', art: 'from-orange-100 to-amber-50' },
};

export function SchoolDashboardOverview({
  school,
  competitions,
  submissions,
  onTabChange,
  onSelectCompetition,
}: Props) {
  const openCompetitions = competitions.filter((competition) => competition.status === 'open');
  const reviewCount = submissions.filter((submission) => submission.status === 'submitted').length;
  const activeCount = submissions.filter((submission) => submission.status !== 'disqualified').length;
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
              {school.status === 'active' ? 'School portal' : 'Waiting for approval'}
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
              <h3 className="text-sm font-bold text-slate-900">Your school</h3>
              <p className="mt-1 text-[11px] text-slate-400">Registered contacts</p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-800">
              <Users size={18} />
            </span>
          </div>
          <div className="mt-4 space-y-4">
            {[
              { role: 'Teacher in charge', name: school.teacherInCharge, phone: school.teacherPhone },
              { role: 'Media president', name: school.mediaPresident, phone: school.presidentPhone },
            ].map((person) => (
              <div key={person.role} className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">
                  {person.name.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-slate-800">{person.name}</p>
                  <p className="mt-0.5 text-[10px] text-slate-400">{person.role}</p>
                </div>
                <a href={`tel:${person.phone}`} className="text-[10px] font-semibold text-amber-800 hover:underline">
                  Call
                </a>
              </div>
            ))}
          </div>
          <a href={`mailto:${school.email}`} className="mt-4 block truncate rounded-xl bg-slate-50 px-3 py-2.5 text-[11px] text-slate-600 hover:bg-amber-50">
            {school.email}
          </a>
        </section>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          { label: 'Student entries', value: submissions.length, detail: 'All time', color: 'border-slate-200 bg-white', icon: Users },
          { label: 'Waiting for review', value: reviewCount, detail: 'Sent to the team', color: 'border-amber-200 bg-amber-50/70', icon: FilePlus2 },
          { label: 'Open competitions', value: openCompetitions.length, detail: 'You can enter', color: 'border-emerald-200 bg-emerald-50/70', icon: Trophy },
          { label: 'Active entries', value: activeCount, detail: 'Not rejected', color: 'border-sky-200 bg-sky-50/70', icon: Sparkles },
        ].map(({ label, value, detail, color, icon: Icon }) => (
          <div key={label} className={`rounded-2xl border p-4 sm:p-5 ${color}`}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
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
              <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-amber-700">Pick a competition</p>
              <h3 className="mt-1 text-lg font-bold text-slate-900">Open competitions</h3>
            </div>
            <button type="button" onClick={() => onTabChange('competitions')} className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-amber-800">
              See all <ArrowRight size={13} />
            </button>
          </div>

          {openCompetitions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
              <Trophy size={25} className="mx-auto text-slate-300" />
              <p className="mt-3 text-sm font-semibold text-slate-700">No competitions are open right now</p>
              <p className="mt-1 text-xs text-slate-500">Check back later for new competitions.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {openCompetitions.slice(0, 3).map((competition) => {
                const style = categoryStyles[competition.category] ?? categoryStyles['Short Film & Cinematography'];
                const Icon = style.icon;
                const used = submissions.filter((submission) =>
                  submission.competitionId === competition.id && submission.status !== 'disqualified'
                ).length;
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
                        {competition.medium === 'None' ? 'Any language' : competition.medium}
                      </span>
                    </div>
                    <div className="p-4">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{competition.category}</p>
                      <h4 className="mt-1 line-clamp-2 min-h-10 text-sm font-bold leading-5 text-slate-900">{competition.title}</h4>
                      <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500">
                        <span>Entries</span>
                        <span className="font-semibold text-slate-700">{used} / {limit}</span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-amber-500" style={{ width: `${Math.min(100, (used / limit) * 100)}%` }} />
                      </div>
                      <button
                        type="button"
                        disabled={full}
                        onClick={() => onSelectCompetition(competition)}
                        className="mt-4 w-full rounded-xl bg-sara-navy px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                      >
                        {full ? 'Entry limit reached' : 'Add a student'}
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
          {recentSubmissions.length > 0 ? (
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
