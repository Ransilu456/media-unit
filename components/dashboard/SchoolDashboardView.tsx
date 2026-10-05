'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useMediaStore } from '@/lib/store';
import { Competition } from '@/lib/types';
import { StatusBadge } from '@/components/ui/Badge';
import { RadialMetricCard } from '@/components/dashboard/RadialMetricCard';
import { EntryStatusGuide } from '@/components/dashboard/EntryStatusGuide';
import { EntrySubmissionModal } from '@/components/forms/EntrySubmissionModal';
import { SchoolTab } from '@/components/layout/SchoolPortalLayout';
import {
  Trophy, ExternalLink, Calendar,
  ShieldCheck, Users, Sparkles,
  Star, AlertCircle,
  Mic, Camera, Radio, Newspaper, ArrowRight, Plus,
} from 'lucide-react';

interface Props {
  activeTab: SchoolTab;
  onTabChange: (tab: SchoolTab) => void;
  initialCompetitionId?: string;
}

// ── Category icon map ─────────────────────────────────────────────────────────
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  'Photography': Camera,
  'News Reading & Announcing': Newspaper,
  'Radio Play & Audio Production': Radio,
  'Short Film & Cinematography': Star,
  'Graphic Design & Digital Art': Sparkles,
  'Live Media Reporting': Mic,
};

// ── Medium badge helper ───────────────────────────────────────────────────────
function MediumChip({ medium }: { medium: string }) {
  if (medium === 'Sinhala') return (
    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200">S</span>
  );
  if (medium === 'English') return (
    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 text-violet-700 border border-violet-200">E</span>
  );
  return null;
}

export function SchoolDashboardView({ activeTab, onTabChange, initialCompetitionId }: Props) {
  const { session, competitions, submissions, refreshSubmissions } = useMediaStore();
  const school = session.school;

  const [selectedComp, setSelectedComp] = useState<Competition | null>(() =>
    initialCompetitionId ? competitions.find(c => c.id === initialCompetitionId) ?? null : null
  );
  const [today] = useState(() => new Date());

  if (!school) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mb-5 shadow-lg shadow-amber-200">
          <ShieldCheck size={36} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Required</h2>
        <p className="text-slate-500 text-sm max-w-sm mb-6">Sign in with your school&apos;s registered credentials to access this portal.</p>
        <Link href="/login" className="px-6 py-3 rounded-xl bg-amber-600 text-white text-sm font-semibold hover:bg-amber-500 transition-all shadow-sm">
          Sign In
        </Link>
      </div>
    );
  }

  const mySubmissions = submissions.filter(s => s.schoolId === school.id);
  const openComps = competitions.filter(c => c.status === 'open');
  const nearestDeadlines = [...openComps]
    .sort((first, second) => first.deadline.localeCompare(second.deadline))
    .slice(0, 3);

  const stats = {
    total: mySubmissions.length,
    awaitingReview: mySubmissions.filter((submission) => submission.status === 'submitted').length,
    underReview: mySubmissions.filter((submission) => submission.status === 'under_review').length,
    advanced: mySubmissions.filter((submission) =>
      ['verified', 'shortlisted', 'winner'].includes(submission.status)
    ).length,
  };
  const feedbackCount = mySubmissions.filter((submission) => submission.judgeFeedback?.trim()).length;

  return (
    <>
      {/* ── OVERVIEW TAB ── */}
      {activeTab === 'overview' && (
        <div className="w-full space-y-6">

          {/* School Hero Banner */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="h-1 bg-gradient-to-r from-amber-500 via-amber-300 to-slate-100" />
            <div className="p-5 sm:p-7">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-800">
                School workspace · 2026
              </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* School avatar */}
              <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-semibold text-2xl shrink-0">
                {school.name[0]}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-semibold tracking-wide">
                    {school.badgeCode}
                  </span>
                  <span className="text-xs text-slate-500">{school.district} · {school.province}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    school.status === 'active' ? 'bg-emerald-50 text-emerald-700' :
                    'bg-rose-50 text-rose-700'
                  }`}>{school.status}</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-950 leading-tight">{school.name}</h1>
                <p className="text-xs text-slate-500 mt-1">
                  Teacher: <span className="text-slate-700 font-medium">{school.teacherInCharge}</span>
                  {school.mediaPresident && (
                    <> · President: <span className="text-slate-700 font-medium">{school.mediaPresident}</span></>
                  )}
                </p>
              </div>

              <button
                onClick={() => openComps[0] && setSelectedComp(openComps[0])}
                disabled={openComps.length === 0}
                className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-700 text-white text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus size={15} /> Add student entry
              </button>
            </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            <RadialMetricCard label="Total entries" value={String(stats.total)} description="Submitted by your school" strokeColor="#2563eb" />
            <RadialMetricCard label="Awaiting review" value={String(stats.awaitingReview)} percentage={stats.total ? Math.round((stats.awaitingReview / stats.total) * 100) : 0} description="Received; no decision yet" strokeColor="#d97706" />
            <RadialMetricCard label="Under review" value={String(stats.underReview)} percentage={stats.total ? Math.round((stats.underReview / stats.total) * 100) : 0} description="Being checked by the team" strokeColor="#0f766e" />
            <RadialMetricCard label="Accepted / advanced" value={String(stats.advanced)} percentage={stats.total ? Math.round((stats.advanced / stats.total) * 100) : 0} description="Accepted, finalist, or winner" strokeColor="#7c3aed" />
          </div>

          <section className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.13em] text-amber-800">
                Your next step
              </p>
              <h2 className="text-sm font-semibold text-slate-900">
                {feedbackCount
                  ? 'Administrator feedback is available'
                  : mySubmissions.length === 0 && openComps.length > 0
                    ? 'Ready to submit your first entry?'
                    : stats.awaitingReview || stats.underReview
                      ? 'Your entries are being processed'
                      : openComps.length > 0
                        ? 'More competitions are open'
                        : 'You are up to date'}
              </h2>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                {feedbackCount
                  ? `${feedbackCount} ${feedbackCount === 1 ? 'entry has' : 'entries have'} school-visible feedback. Open Student entries to read it.`
                  : mySubmissions.length === 0 && openComps.length > 0
                    ? 'Choose an open competition, check its eligibility and deadline, then add a student entry.'
                    : stats.awaitingReview || stats.underReview
                      ? 'You do not need to resubmit. Check Student entries for status updates and feedback.'
                      : openComps.length > 0
                        ? `${openComps.length} competitions are accepting entries. Check how many entries your school can still submit.`
                        : 'There are no open competitions or new review updates to act on right now.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onTabChange(feedbackCount ? 'students' : mySubmissions.length === 0 ? 'competitions' : 'students')}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800"
            >
              {feedbackCount ? 'Read feedback' : mySubmissions.length === 0 ? 'Browse competitions' : 'Track entries'} <ArrowRight size={13} />
            </button>
          </section>

          {nearestDeadlines.length > 0 && (
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="flex flex-col gap-1 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-5">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-amber-800">Plan ahead</p>
                  <h2 className="mt-1 text-sm font-semibold text-slate-900">Upcoming submission deadlines</h2>
                </div>
                <button
                  type="button"
                  onClick={() => onTabChange('competitions')}
                  className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-950 sm:mt-0"
                >
                  All competitions <ArrowRight size={13} />
                </button>
              </div>
              <div className="divide-y divide-slate-100">
                {nearestDeadlines.map((competition) => {
                  const used = mySubmissions.filter((entry) => entry.competitionId === competition.id).length;
                  const full = used >= competition.maxEntriesPerSchool;
                  const deadline = new Date(`${competition.deadline}T00:00:00`);
                  return (
                    <div key={competition.id} className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:px-5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-800">
                        <Calendar size={16} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900">{competition.title}</p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          Due {deadline.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          <span className="mx-1.5 text-slate-300">·</span>
                          {used} of {competition.maxEntriesPerSchool} school entries used
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedComp(competition)}
                        disabled={full}
                        className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-amber-300 hover:bg-amber-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                      >
                        {full ? 'Limit reached' : 'Add entry'} {!full && <Plus size={13} />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Recent entries */}
          {mySubmissions.length > 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                    <Users size={14} className="text-slate-600" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">Recent Entries</h3>
                </div>
                <button onClick={() => onTabChange('students')} className="text-xs text-amber-600 hover:underline font-semibold flex items-center gap-1">
                  View all <ArrowRight size={11} />
                </button>
              </div>
              <div className="divide-y divide-slate-50">
                {mySubmissions.slice(0, 5).map(sub => {
                  const CatIcon = CATEGORY_ICONS[sub.category] ?? Trophy;
                  return (
                    <div key={sub.id} className="px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                          <CatIcon size={14} className="text-amber-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{sub.entryTitle}</p>
                          <p className="text-xs text-slate-400 truncate">
                            {sub.studentName} · {sub.studentGrade}
                            {sub.studentAge ? ` · Age ${sub.studentAge}` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {sub.competitionMedium && sub.competitionMedium !== 'None' && (
                          <MediumChip medium={sub.competitionMedium} />
                        )}
                        <StatusBadge status={sub.status} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                <Trophy size={28} className="text-amber-600" />
              </div>
              <h3 className="text-base font-bold text-slate-700 mb-1">No Entries Yet</h3>
              <p className="text-xs text-slate-400 mb-5 max-w-xs mx-auto">
                Use &quot;Add New Entry&quot; to register your students for open competitions.
              </p>
              <button
                onClick={() => onTabChange('competitions')}
                className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold transition-all shadow-sm"
              >
                Browse Competitions
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── STUDENT ENTRIES TAB ── */}
      {activeTab === 'students' && (
        <div className="w-full space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Student Entries</h2>
              <p className="text-xs text-slate-500 mt-0.5">{mySubmissions.length} total submission{mySubmissions.length !== 1 ? 's' : ''}</p>
            </div>
            <button
              onClick={() => openComps[0] && setSelectedComp(openComps[0])}
              disabled={openComps.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all disabled:opacity-40 shadow-sm"
            >
              <Plus size={13} /> Add Entry
            </button>
          </div>

          <EntryStatusGuide />

          {mySubmissions.length === 0 ? (
            <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-14 text-center">
              <Users size={32} className="mx-auto text-slate-300 mb-3" />
              <h3 className="text-sm font-bold text-slate-600 mb-1">No entries registered yet</h3>
              <p className="text-xs text-slate-400 mb-4">Choose an open competition, check the student eligibility and entry limit, then submit the application.</p>
              <button onClick={() => onTabChange('competitions')} className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors">
                Browse Open Competitions
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {mySubmissions.map(sub => {
                const CatIcon = CATEGORY_ICONS[sub.category] ?? Trophy;
                return (
                  <div key={sub.id} className="bg-white rounded-2xl border border-slate-200 p-5 transition-colors hover:border-slate-300">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                          <CatIcon size={18} className="text-amber-600" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            <span className="text-[11px] font-mono bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full">
                              {sub.category}
                            </span>
                            {sub.competitionMedium && sub.competitionMedium !== 'None' && (
                              <MediumChip medium={sub.competitionMedium} />
                            )}
                            <StatusBadge status={sub.status} />
                          </div>
                          <h4 className="text-base font-bold text-slate-900">{sub.entryTitle}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">{sub.competitionTitle}</p>
                        </div>
                      </div>
                      {sub.submissionLink && (
                        <a href={sub.submissionLink} target="_blank" rel="noreferrer"
                          className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-amber-50 text-slate-500 hover:text-amber-700 text-xs font-semibold transition-all border border-slate-200 hover:border-amber-200">
                          <ExternalLink size={12} /> View
                        </a>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <div>
                        <p className="text-slate-400 mb-0.5">Student</p>
                        <p className="font-semibold text-slate-800">{sub.studentName}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 mb-0.5">Grade</p>
                        <p className="font-semibold text-slate-800">{sub.studentGrade}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 mb-0.5">Age</p>
                        <p className="font-semibold text-slate-800">{sub.studentAge ?? '—'} yrs</p>
                      </div>
                      <div>
                        <p className="text-slate-400 mb-0.5">Submitted</p>
                        <p className="font-semibold text-slate-800">{sub.submittedAt}</p>
                      </div>
                    </div>

                    {sub.score !== undefined && (
                      <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100">
                        <Star size={14} className="text-amber-600" />
                        <span className="text-xs text-amber-900">Score: <strong>{sub.score}/100</strong></span>
                      </div>
                    )}

                    {sub.judgeFeedback && (
                      <div className="mt-2 p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-800 italic">
                        &quot;{sub.judgeFeedback}&quot;
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── COMPETITIONS TAB ── */}
      {activeTab === 'competitions' && (
        <div className="w-full space-y-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Available Competitions</h2>
            <p className="text-xs text-slate-500 mt-0.5">{competitions.length} competitions · {openComps.length} open</p>
          </div>

          {competitions.length === 0 ? (
            <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-14 text-center">
              <Trophy size={32} className="mx-auto text-slate-300 mb-3" />
              <h3 className="text-sm font-bold text-slate-600 mb-1">No competitions published yet</h3>
              <p className="text-xs text-slate-400">Agradhi admin will publish competitions soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {competitions.map(comp => {
                const mine = mySubmissions.filter(s => s.competitionId === comp.id).length;
                const full = mine >= comp.maxEntriesPerSchool;
                const CatIcon = CATEGORY_ICONS[comp.category] ?? Trophy;
                const daysLeft = Math.ceil((new Date(comp.deadline).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={comp.id} className={`bg-white rounded-2xl border shadow-sm flex flex-col overflow-hidden transition-all hover:shadow-md ${
                    comp.status === 'open' && !full ? 'border-slate-200 hover:border-amber-200' : 'border-slate-200 opacity-70'
                  }`}>
                    {/* Card top accent */}
                    <div className={`h-1 w-full ${
                      comp.status === 'open' ? 'bg-gradient-to-r from-amber-400 to-amber-600' : 'bg-slate-200'
                    }`} />

                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                          <CatIcon size={18} className="text-amber-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            {comp.medium !== 'None' && <MediumChip medium={comp.medium} />}
                            <StatusBadge status={comp.status} />
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 leading-tight">{comp.title}</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">{comp.category}</p>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 line-clamp-2 mb-4 flex-1">{comp.description}</p>

                      {/* Meta info */}
                      <div className="grid grid-cols-2 gap-2 mb-4 text-[11px]">
                        <div className="flex items-center gap-1.5 bg-slate-50 rounded-lg px-2.5 py-2 border border-slate-100">
                          <Calendar size={11} className="text-slate-400" />
                          <span className={`font-semibold ${daysLeft <= 7 ? 'text-red-600' : 'text-slate-700'}`}>
                            {daysLeft > 0 ? `${daysLeft}d left` : 'Closed'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-slate-50 rounded-lg px-2.5 py-2 border border-slate-100">
                          <Users size={11} className="text-slate-400" />
                          <span className={`font-semibold ${full ? 'text-red-600' : 'text-slate-700'}`}>
                            {mine}/{comp.maxEntriesPerSchool} entries
                          </span>
                        </div>
                        <div className="col-span-2 flex items-center gap-1.5 bg-slate-50 rounded-lg px-2.5 py-2 border border-slate-100">
                          <AlertCircle size={11} className="text-slate-400" />
                          <span className="text-slate-600">{comp.eligibility}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedComp(comp)}
                        disabled={full || comp.status !== 'open'}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          full ? 'bg-slate-100 text-slate-400 cursor-not-allowed' :
                          comp.status !== 'open' ? 'bg-slate-100 text-slate-400 cursor-not-allowed' :
                          'bg-amber-600 hover:bg-amber-500 text-white shadow-sm hover:shadow-md'
                        }`}
                      >
                        {full ? (
                          <><AlertCircle size={12} /> Entry Limit Reached</>
                        ) : comp.status !== 'open' ? (
                          'Submissions Closed'
                        ) : (
                          <><Plus size={12} /> Submit Entry</>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── ADD ENTRY TAB ── */}
      {activeTab === 'apply' && (
        <div className="w-full space-y-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Submit a New Student Entry</h2>
            <p className="text-xs text-slate-500 mt-0.5">Select a competition to submit an entry for.</p>
          </div>

          {openComps.length === 0 ? (
            <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-14 text-center">
              <Calendar size={32} className="mx-auto text-slate-300 mb-3" />
              <h3 className="text-sm font-bold text-slate-600 mb-1">No open competitions right now</h3>
              <p className="text-xs text-slate-400">Agradhi admin has not published any open competitions yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {openComps.map(comp => {
                const mine = mySubmissions.filter(s => s.competitionId === comp.id).length;
                const full = mine >= comp.maxEntriesPerSchool;
                const CatIcon = CATEGORY_ICONS[comp.category] ?? Trophy;
                return (
                  <div key={comp.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center gap-4 hover:border-amber-200 hover:shadow-md transition-all">
                    <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                      <CatIcon size={18} className="text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        {comp.medium !== 'None' && <MediumChip medium={comp.medium} />}
                        <p className="text-sm font-semibold text-slate-800 truncate">{comp.title}</p>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Deadline: <span className="font-semibold text-slate-600">{comp.deadline}</span>
                        {' · '}{mine}/{comp.maxEntriesPerSchool} entries used
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedComp(comp)}
                      disabled={full}
                      className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        full ? 'bg-slate-100 text-slate-400 cursor-not-allowed' :
                        'bg-amber-600 hover:bg-amber-500 text-white shadow-sm'
                      }`}
                    >
                      {full ? 'Full' : <><Plus size={11} /> Enter</>}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Delegation badge tab */}
      {activeTab === ('badge' as SchoolTab) && (
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-3xl border-2 border-amber-500 p-8 text-center shadow-2xl shadow-amber-100">
            <div className="w-18 h-18 mx-auto mb-4 bg-slate-900 rounded-full border-2 border-amber-500 p-1 flex items-center justify-center w-16 h-16">
              <Image src="/Agradhi.png" alt="Agradhi" width={50} height={50} className="object-contain" />
            </div>
            <span className="text-xs font-mono uppercase tracking-widest text-amber-600 font-semibold">Official Delegation Pass</span>
            <h3 className="text-2xl font-bold text-slate-900 mt-2 mb-1">{school.name}</h3>
            <p className="text-xs text-slate-400 mb-5">Agradhi Media Assembly 2026 · Saranath College</p>
            <div className="p-4 rounded-xl bg-slate-50 border text-left text-xs space-y-2.5">
              <Row label="Badge Code" val={school.badgeCode} />
              <Row label="Province" val={`${school.province} (${school.district})`} />
              <Row label="Teacher" val={school.teacherInCharge} />
              {school.mediaPresident && <Row label="President" val={school.mediaPresident} />}
            </div>
          </div>
        </div>
      )}

      {/* Entry Modal */}
      {selectedComp && (
        <EntrySubmissionModal
          isOpen
          onClose={() => setSelectedComp(null)}
          competition={selectedComp}
          school={school}
          onSubmitted={async () => {
            await refreshSubmissions();
            onTabChange('students');
          }}
        />
      )}
    </>
  );
}

function Row({ label, val }: { label: string; val: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-400">{label}:</span>
      <span className="text-slate-800 font-semibold">{val}</span>
    </div>
  );
}
