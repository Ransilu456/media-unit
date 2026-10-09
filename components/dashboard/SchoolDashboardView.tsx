'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useMediaStore } from '@/lib/store';
import { Competition } from '@/lib/types';
import { StatusBadge } from '@/components/ui/Badge';
import { SchoolTab } from '@/components/layout/SchoolPortalLayout';
import {
  Trophy,
  ExternalLink,
  ShieldCheck,
  Users,
  Star,
  AlertCircle,
  Mic,
  Camera,
  Radio,
  Newspaper,
  ArrowRight,
  Plus,
  Search,
} from 'lucide-react';

import { ConcentricOrbitalChart } from './ConcentricOrbitalChart';
import { EntryStatusGuide } from './EntryStatusGuide';

const EntrySubmissionModal = dynamic(
  () => import('@/components/forms/EntrySubmissionModal').then((module) => module.EntrySubmissionModal),
  { loading: () => <div role="status" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 text-sm text-white">Loading entry form...</div> }
);

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

interface Props {
  activeTab: SchoolTab;
  onTabChange: (tab: SchoolTab) => void;
  initialCompetitionId?: string;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  'Photography': Camera,
  'News Reading & Announcing': Newspaper,
  'Radio Play & Audio Production': Radio,
  'Short Film & Cinematography': Star,
  'Graphic Design & Digital Art': Star,
  'Live Media Reporting': Mic,
};

function MediumChip({ medium }: { medium: string }) {
  if (medium === 'Sinhala') {
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
        Sinhala
      </span>
    );
  }
  if (medium === 'English') {
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-100">
        English
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-50 text-slate-600 border border-slate-200">
      Open
    </span>
  );
}

export function SchoolDashboardView({ activeTab, onTabChange, initialCompetitionId }: Props) {
  const { session, competitions, submissions, isSubmissionsLoaded, isCompetitionsLoaded } = useMediaStore();
  const school = session.school;

  const [selectedComp, setSelectedComp] = useState<Competition | null>(() => {
    return initialCompetitionId ? competitions.find((c) => c.id === initialCompetitionId) ?? null : null;
  });

  const [searchEntryQuery, setSearchEntryQuery] = useState('');
  const [filterEntryStatus, setFilterEntryStatus] = useState<string>('all');

  // Hooks must be declared before any early return
  const mySubmissions = useMemo(() => {
    if (!school) return [];
    return submissions.filter((s) => s.schoolId === school.id);
  }, [submissions, school]);

  const openComps = useMemo(() => {
    return competitions.filter((c) => c.status === 'open');
  }, [competitions]);

  const stats = useMemo(() => {
    return {
      total: mySubmissions.length,
      submitted: mySubmissions.filter((s) => s.status === 'submitted').length,
      underReview: mySubmissions.filter((s) => s.status === 'under_review').length,
      advanced: mySubmissions.filter((s) => ['verified', 'shortlisted', 'winner'].includes(s.status)).length,
    };
  }, [mySubmissions]);

  const schoolRadarEntries = useMemo(() => {
    return mySubmissions.map((s) => ({
      id: s.id,
      title: s.entryTitle,
      studentName: s.studentName,
      category: s.category,
      status: s.status,
    }));
  }, [mySubmissions]);

  const schoolCategoryBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    mySubmissions.forEach((s) => {
      map.set(s.category, (map.get(s.category) ?? 0) + 1);
    });
    const colors: Record<string, string> = {
      'Short Film & Cinematography': '#4f46e5',
      'Photography': '#06b6d4',
      'News Reading & Announcing': '#f59e0b',
      'Radio Play & Audio Production': '#8b5cf6',
      'Graphic Design & Digital Art': '#3b82f6',
      'Live Media Reporting': '#10b981',
    };
    return Array.from(map.entries()).map(([name, count]) => ({
      name,
      count,
      color: colors[name] || '#6366f1',
    }));
  }, [mySubmissions]);

  const clearancePct = useMemo(() => {
    if (mySubmissions.length === 0) return 0;
    return Math.round((stats.advanced / mySubmissions.length) * 100);
  }, [mySubmissions.length, stats.advanced]);

  const filteredEntries = useMemo(() => {
    return mySubmissions.filter((sub) => {
      const matchSearch =
        sub.studentName.toLowerCase().includes(searchEntryQuery.toLowerCase()) ||
        sub.entryTitle.toLowerCase().includes(searchEntryQuery.toLowerCase()) ||
        sub.category.toLowerCase().includes(searchEntryQuery.toLowerCase());

      const matchStatus =
        filterEntryStatus === 'all' || sub.status === filterEntryStatus;

      return matchSearch && matchStatus;
    });
  }, [mySubmissions, searchEntryQuery, filterEntryStatus]);

  if (!school) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4 text-slate-600">
          <ShieldCheck size={28} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">School Authorization Required</h2>
        <p className="text-slate-500 text-xs max-w-sm mb-6 leading-relaxed">
          Please sign in with your school credentials to access your delegation dashboard.
        </p>
        <Link
          href="/login"
          className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <>
      {activeTab === 'overview' && (
        <div className="space-y-8">
          
          <div className="rounded-3xl bg-white p-7 sm:p-9 border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-800 border border-amber-200/80 font-bold text-xl flex items-center justify-center shrink-0">
                  {school.name.charAt(0)}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-700">
                      {school.badgeCode}
                    </span>
                    <span className="text-xs text-slate-500">
                      {school.district} · {school.province}
                    </span>
                  </div>

                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight truncate">
                    {school.name}
                  </h1>

                  <p className="text-xs text-slate-500 mt-1">
                    Teacher-in-Charge: <strong className="text-slate-700 font-semibold">{school.teacherInCharge}</strong>
                    {school.mediaPresident && (
                      <span className="hidden md:inline"> · Media President: <strong className="text-slate-700 font-semibold">{school.mediaPresident}</strong></span>
                    )}
                  </p>
                </div>
              </div>

              <div className="shrink-0">
                <button
                  onClick={() => openComps[0] && setSelectedComp(openComps[0])}
                  disabled={openComps.length === 0}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all shadow-sm disabled:opacity-50"
                >
                  <Plus size={15} />
                  <span>Submit Student Entry</span>
                </button>
              </div>

            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Total Entries</span>
              <div className="flex items-baseline justify-between">
                {!isSubmissionsLoaded ? (
                  <div className="h-8 w-14 rounded-lg bg-slate-100 animate-pulse my-0.5" />
                ) : (
                  <span className="text-3xl font-extrabold text-slate-900">{stats.total}</span>
                )}
                <span className="text-xs text-slate-400 font-medium">Delegation</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 block mb-2">Awaiting Review</span>
              <div className="flex items-baseline justify-between">
                {!isSubmissionsLoaded ? (
                  <div className="h-8 w-14 rounded-lg bg-amber-100/70 animate-pulse my-0.5" />
                ) : (
                  <span className="text-3xl font-extrabold text-slate-900">{stats.submitted}</span>
                )}
                <span className="text-xs text-amber-700 font-medium">In Queue</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 block mb-2">Under Evaluation</span>
              <div className="flex items-baseline justify-between">
                {!isSubmissionsLoaded ? (
                  <div className="h-8 w-14 rounded-lg bg-blue-100/70 animate-pulse my-0.5" />
                ) : (
                  <span className="text-3xl font-extrabold text-slate-900">{stats.underReview}</span>
                )}
                <span className="text-xs text-blue-700 font-medium">Jury Review</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block mb-2">Advanced</span>
              <div className="flex items-baseline justify-between">
                {!isSubmissionsLoaded ? (
                  <div className="h-8 w-14 rounded-lg bg-emerald-100/70 animate-pulse my-0.5" />
                ) : (
                  <span className="text-3xl font-extrabold text-slate-900">{stats.advanced}</span>
                )}
                <span className="text-xs text-emerald-700 font-medium">Verified / Finalist</span>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            <div className="lg:col-span-8 rounded-3xl border border-slate-100 bg-white p-7 shadow-[0_4px_25px_rgba(0,0,0,0.03)]">
              <div className="flex items-center justify-between pb-4 border-b border-slate-50 mb-5">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Recent Student Submissions</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Live status and judge evaluation</p>
                </div>
                <button
                  onClick={() => onTabChange('students')}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-950 flex items-center gap-1 transition-colors"
                >
                  View all ({mySubmissions.length}) <ArrowRight size={13} />
                </button>
              </div>

              {!isSubmissionsLoaded ? (
                <div className="divide-y divide-slate-50">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="py-3.5 flex items-center justify-between gap-4 animate-pulse">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0" />
                        <div className="space-y-1.5 min-w-0">
                          <div className="h-3.5 w-36 rounded bg-slate-200/80" />
                          <div className="h-2.5 w-48 rounded bg-slate-100" />
                        </div>
                      </div>
                      <div className="h-6 w-20 rounded-full bg-slate-100 shrink-0" />
                    </div>
                  ))}
                </div>
              ) : mySubmissions.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 flex items-center justify-center">
                    <Trophy size={20} />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-800 mb-1">No Entries Submitted Yet</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5 leading-relaxed">
                    Select an open competition track on the right to register your student&apos;s project.
                  </p>
                  <button
                    onClick={() => onTabChange('competitions')}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs"
                  >
                    Browse Competition Tracks
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {mySubmissions.slice(0, 5).map((sub) => {
                    const CatIcon = CATEGORY_ICONS[sub.category] ?? Trophy;
                    return (
                      <div key={sub.id} className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/50 rounded-xl px-2 transition-colors">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                            <CatIcon size={17} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">{sub.entryTitle}</p>
                            <p className="text-xs text-slate-400 truncate mt-0.5">
                              {sub.studentName} · {sub.studentGrade}
                              {sub.studentAge ? ` · Age ${sub.studentAge}` : ''} · {sub.category}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                          {sub.competitionMedium && (
                            <span className="hidden sm:inline">
                              <MediumChip medium={sub.competitionMedium} />
                            </span>
                          )}
                          <StatusBadge status={sub.status} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="lg:col-span-4 rounded-3xl border border-slate-100 bg-white p-7 shadow-[0_4px_25px_rgba(0,0,0,0.03)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-50 mb-4">
                  <h3 className="text-base font-bold text-slate-900">Open Tracks</h3>
                  <span className="text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
                    {openComps.length} Tracks
                  </span>
                </div>

                <div className="space-y-3">
                  {!isCompetitionsLoaded ? (
                    [1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3 animate-pulse"
                      >
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <div className="h-3 w-32 rounded bg-slate-200/80" />
                          <div className="h-2.5 w-24 rounded bg-slate-100" />
                        </div>
                        <div className="h-7 w-12 rounded-lg bg-slate-200/80 shrink-0" />
                      </div>
                    ))
                  ) : (
                    openComps.slice(0, 4).map((comp) => {
                      const activeCount = mySubmissions.filter((s) => s.competitionId === comp.id && s.status !== 'disqualified').length;
                      const hasDisqualified = mySubmissions.some((s) => s.competitionId === comp.id && s.status === 'disqualified');
                      const full = activeCount >= comp.maxEntriesPerSchool;

                      return (
                        <div
                          key={comp.id}
                          className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold text-slate-900 truncate">{comp.title}</p>
                              {hasDisqualified && !full && (
                                <span className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                                  Slot Reopened
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Due {comp.deadline} · {activeCount}/{comp.maxEntriesPerSchool} active
                            </p>
                          </div>

                          <button
                            onClick={() => setSelectedComp(comp)}
                            disabled={full}
                            className="shrink-0 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold transition-colors disabled:opacity-30"
                          >
                            {full ? 'Full' : hasDisqualified ? 'Reapply' : 'Enter'}
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="pt-5 border-t border-slate-50 mt-5">
                <button
                  onClick={() => onTabChange('competitions')}
                  className="w-full text-center text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center justify-center gap-1 transition-colors"
                >
                  <span>View all competitions</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>

          {/* Adjudication Radar & Delegation Quota Balance */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left 6 cols: Concentric Orbital Radar with Real School Data */}
            <div className="lg:col-span-6 flex flex-col">
              <ConcentricOrbitalChart
                percentage={clearancePct}
                label="Delegation Clearance Radar"
                sublabel={
                  mySubmissions.length > 0
                    ? `${stats.advanced} of ${mySubmissions.length} delegation entries advanced or verified`
                    : 'Awaiting student submissions for live radar telemetry'
                }
                entries={schoolRadarEntries}
                categories={schoolCategoryBreakdown}
                totalSubmissions={mySubmissions.length}
              />
            </div>

            {/* Right 6 cols: Delegation Track Participation & Quotas Card */}
            <div className="lg:col-span-6 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-950">Competition Quota Allocation</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Delegation entry allowance per competition track</p>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                    {competitions.length} Tracks Open
                  </span>
                </div>

                <div className="space-y-3">
                  {!isCompetitionsLoaded ? (
                    [1, 2, 3].map((i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 flex flex-col gap-2 animate-pulse">
                        <div className="flex items-center justify-between">
                          <div className="h-3 w-36 rounded bg-slate-200/80" />
                          <div className="h-3 w-16 rounded bg-slate-200/80" />
                        </div>
                        <div className="h-1.5 w-full bg-slate-200/60 rounded-full" />
                      </div>
                    ))
                  ) : (
                    competitions.slice(0, 4).map((comp) => {
                      const used = mySubmissions.filter((s) => s.competitionId === comp.id && s.status !== 'disqualified').length;
                      const disqualifiedCount = mySubmissions.filter((s) => s.competitionId === comp.id && s.status === 'disqualified').length;
                      const max = comp.maxEntriesPerSchool || 2;
                      const pct = Math.min(100, Math.round((used / max) * 100));
                      const isFull = used >= max;

                      return (
                        <div key={comp.id} className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 flex flex-col gap-2">
                          <div className="flex items-center justify-between text-xs">
                            <div className="min-w-0 pr-2">
                              <span className="font-semibold text-slate-900 truncate block">{comp.title}</span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] text-slate-500">{comp.category}</span>
                                {disqualifiedCount > 0 && (
                                  <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                                    {disqualifiedCount} slot reopened
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className={`text-[11px] font-bold shrink-0 ${isFull ? 'text-amber-700' : 'text-slate-700'}`}>
                              {used} / {max} {used === 1 ? 'Slot' : 'Slots'}
                            </span>
                          </div>
                          {/* Quota bar */}
                          <div className="h-1.5 w-full bg-slate-200/80 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                isFull ? 'bg-amber-500' : used > 0 ? 'bg-emerald-600' : 'bg-transparent'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500">
                  Total delegation entries: <strong className="text-slate-900 font-bold">{mySubmissions.length}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => onTabChange('competitions')}
                  className="text-xs font-semibold text-slate-700 hover:text-slate-950 flex items-center gap-1 transition-colors"
                >
                  <span>Browse all tracks</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>

          {/* Full-width Entry Status Guide */}
          <div className="w-full">
            <EntryStatusGuide />
          </div>

        </div>
      )}

      {activeTab === 'students' && (
        <div className="space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Student Entries</h2>
              <p className="text-xs text-slate-500 mt-1">
                Track status, feedback, and evaluation scores for all registered student entries.
              </p>
            </div>

            <button
              onClick={() => openComps[0] && setSelectedComp(openComps[0])}
              disabled={openComps.length === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all shadow-xs"
            >
              <Plus size={15} />
              <span>Submit New Entry</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search entries by student name or title..."
                value={searchEntryQuery}
                onChange={(e) => setSearchEntryQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {['all', 'submitted', 'under_review', 'verified', 'shortlisted'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterEntryStatus(st)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-medium capitalize whitespace-nowrap transition-colors ${
                    filterEntryStatus === st
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {!isSubmissionsLoaded ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-slate-100 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] animate-pulse"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0" />
                      <div className="space-y-2">
                        <div className="h-4 w-44 rounded bg-slate-200" />
                        <div className="h-3 w-28 rounded bg-slate-100" />
                      </div>
                    </div>
                    <div className="h-6 w-24 rounded-full bg-slate-100 shrink-0" />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 mb-3">
                    <div className="h-8 rounded bg-slate-100" />
                    <div className="h-8 rounded bg-slate-100" />
                    <div className="h-8 rounded bg-slate-100" />
                    <div className="h-8 rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-14 text-center shadow-[0_4px_25px_rgba(0,0,0,0.02)]">
              <Users size={32} className="mx-auto text-slate-300 mb-3" />
              <h3 className="text-sm font-bold text-slate-800 mb-1">No matching entries found</h3>
              <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                {mySubmissions.length === 0
                  ? 'Your school has not submitted any entries yet. Click "Submit New Entry" to get started.'
                  : 'Try searching with different keywords or clearing your status filter.'}
              </p>
              {mySubmissions.length === 0 && (
                <button
                  onClick={() => onTabChange('competitions')}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
                >
                  Browse Competitions
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEntries.map((sub) => {
                const CatIcon = CATEGORY_ICONS[sub.category] ?? Trophy;

                return (
                  <div
                    key={sub.id}
                    className="bg-white rounded-2xl border border-slate-100 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:border-slate-200 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                          <CatIcon size={18} />
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <span className="text-[11px] font-mono font-semibold bg-slate-50 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">
                              {sub.category}
                            </span>
                            {sub.competitionMedium && <MediumChip medium={sub.competitionMedium} />}
                            <StatusBadge status={sub.status} />
                          </div>

                          <h3 className="text-base font-bold text-slate-900 leading-snug">{sub.entryTitle}</h3>
                          <p className="text-xs text-slate-500 mt-0.5">{sub.competitionTitle}</p>
                        </div>
                      </div>

                      {sub.submissionLink && (
                        <a
                          href={sub.submissionLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors shrink-0"
                        >
                          <ExternalLink size={13} />
                          <span>View Cloud File</span>
                        </a>
                      )}
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 text-xs mb-3">
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Student Name</span>
                        <span className="font-semibold text-slate-800">{sub.studentName}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Grade & Age</span>
                        <span className="font-semibold text-slate-800">
                          {sub.studentGrade} {sub.studentAge ? `(${sub.studentAge} yrs)` : ''}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Submitted Date</span>
                        <span className="font-semibold text-slate-800">{formatDate(sub.submittedAt)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Contact Phone</span>
                        <span className="font-semibold text-slate-800">{sub.studentContact || '—'}</span>
                      </div>
                    </div>

                    {/* Synopsis */}
                    {sub.synopsis && (
                      <div className="text-xs text-slate-600 bg-white p-3.5 rounded-xl border border-slate-100">
                        <span className="font-semibold text-slate-700 block mb-1">Concept Synopsis:</span>
                        <p className="leading-relaxed">{sub.synopsis}</p>
                      </div>
                    )}

                    {sub.score !== undefined && (
                      <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 text-xs font-medium">
                        <Star size={15} className="text-amber-600" />
                        <span>Official Evaluation Score: <strong className="font-bold">{sub.score} / 100</strong></span>
                      </div>
                    )}

                    {sub.judgeFeedback && (
                      <div className={`mt-2 p-3 rounded-xl border text-xs ${
                        sub.status === 'disqualified'
                          ? 'bg-rose-50/70 border-rose-200 text-rose-800'
                          : 'bg-slate-50 border-slate-100 text-slate-700 italic'
                      }`}>
                        <strong>{sub.status === 'disqualified' ? 'Disqualification Grounds:' : 'Judge Feedback:'}</strong> &quot;{sub.judgeFeedback}&quot;
                      </div>
                    )}

                    {sub.status === 'disqualified' && (
                      <div className="mt-3.5 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 shadow-2xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-bold text-rose-900">
                                Quota Slot Reopened · Reapply with Another Student
                              </p>
                              <p className="text-[11px] text-rose-700 mt-0.5 leading-relaxed">
                                Because this entry was rejected, your school delegation&apos;s quota slot for this competition track is restored. You are eligible to submit a fresh entry for another student.
                              </p>
                            </div>
                          </div>
                          {openComps.some((c) => c.id === sub.competitionId) && (
                            <button
                              type="button"
                              onClick={() => {
                                const comp = competitions.find((c) => c.id === sub.competitionId);
                                if (comp) setSelectedComp(comp);
                              }}
                              className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold shadow-xs transition-colors"
                            >
                              <Plus size={13} />
                              <span>Submit Replacement</span>
                            </button>
                          )}
                        </div>
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
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Available Competitions</h2>
            <p className="text-xs text-slate-500 mt-1">
              Review eligibility criteria, grade limits, and submit entries on behalf of your school.
            </p>
          </div>

          {!isCompetitionsLoaded ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] animate-pulse flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-slate-100" />
                        <div className="h-3 w-28 rounded bg-slate-100" />
                      </div>
                      <div className="h-5 w-16 rounded-full bg-slate-100" />
                    </div>
                    <div className="h-5 w-3/4 rounded bg-slate-200 mb-2" />
                    <div className="space-y-1.5 mb-5">
                      <div className="h-3 w-full rounded bg-slate-100" />
                      <div className="h-3 w-5/6 rounded bg-slate-100" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 mb-5">
                      <div className="h-7 bg-slate-100 rounded" />
                      <div className="h-7 bg-slate-100 rounded" />
                    </div>
                  </div>
                  <div className="h-10 w-full rounded-xl bg-slate-100" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {competitions.map((comp) => {
                const activeSubs = mySubmissions.filter((s) => s.competitionId === comp.id && s.status !== 'disqualified');
                const disqualifiedSubs = mySubmissions.filter((s) => s.competitionId === comp.id && s.status === 'disqualified');
                const mine = activeSubs.length;
                const full = mine >= comp.maxEntriesPerSchool;
                const CatIcon = CATEGORY_ICONS[comp.category] ?? Trophy;

                return (
                  <div
                    key={comp.id}
                    className="rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:border-slate-200 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 flex items-center justify-center">
                            <CatIcon size={16} />
                          </div>
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            {comp.category}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {comp.medium && <MediumChip medium={comp.medium} />}
                          <StatusBadge status={comp.status} />
                        </div>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 leading-snug mb-2">
                        {comp.title}
                      </h3>

                      <p className="text-xs text-slate-500 leading-relaxed mb-5 line-clamp-3">
                        {comp.description}
                      </p>

                      <div className="grid grid-cols-2 gap-2 p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 text-xs mb-5">
                        <div>
                          <span className="text-[10px] text-slate-400 font-semibold block uppercase">Deadline</span>
                          <span className="font-semibold text-slate-800">{comp.deadline}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-semibold block uppercase">School Quota</span>
                          <span className={`font-semibold ${full ? 'text-red-600' : 'text-slate-800'}`}>
                            {mine} / {comp.maxEntriesPerSchool} active
                          </span>
                          {disqualifiedSubs.length > 0 && (
                            <span className="block text-[10px] text-rose-600 font-bold">
                              ({disqualifiedSubs.length} slot reopened)
                            </span>
                          )}
                        </div>
                        <div className="col-span-2">
                          <span className="text-[10px] text-slate-400 font-semibold block uppercase">Age & Grade Criteria</span>
                          <span className="font-semibold text-slate-800">{comp.eligibility}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedComp(comp)}
                      disabled={full || comp.status !== 'open'}
                      className={`w-full py-3 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                        full
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : comp.status !== 'open'
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                      }`}
                    >
                      {full ? (
                        <>
                          <AlertCircle size={14} /> Quota Full
                        </>
                      ) : comp.status !== 'open' ? (
                        'Closed'
                      ) : disqualifiedSubs.length > 0 ? (
                        <>
                          <Plus size={14} /> Submit Replacement Entry
                        </>
                      ) : (
                        <>
                          <Plus size={14} /> Submit Student Entry
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    )}

      {/* ── ADD NEW ENTRY TAB ── */}
      {activeTab === 'apply' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Select a Track to Submit</h2>
            <p className="text-xs text-slate-500 mt-1">
              Select any open track below to launch the student registration form.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {openComps.map((comp) => {
              const activeSubs = mySubmissions.filter((s) => s.competitionId === comp.id && s.status !== 'disqualified');
              const hasDisqualified = mySubmissions.some((s) => s.competitionId === comp.id && s.status === 'disqualified');
              const mine = activeSubs.length;
              const full = mine >= comp.maxEntriesPerSchool;
              const CatIcon = CATEGORY_ICONS[comp.category] ?? Trophy;

              return (
                <div
                  key={comp.id}
                  className="rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:border-slate-200 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 flex items-center justify-center">
                        <CatIcon size={18} />
                      </div>
                      {comp.medium && <MediumChip medium={comp.medium} />}
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 mb-1">{comp.title}</h4>
                    <p className="text-xs text-slate-400 mb-4">{comp.category}</p>

                    <div className="text-xs text-slate-500 space-y-1 mb-5">
                      <p>Due: <strong className="text-slate-700">{comp.deadline}</strong></p>
                      <p>
                        Quota: <strong className="text-slate-700">{mine}/{comp.maxEntriesPerSchool} active</strong>
                        {hasDisqualified && !full && (
                          <span className="ml-1 text-[10px] text-rose-600 font-bold">(slot reopened)</span>
                        )}
                      </p>
                      <p>Eligibility: <strong className="text-slate-700">{comp.eligibility}</strong></p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedComp(comp)}
                    disabled={full}
                    className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                      full
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                    }`}
                  >
                    {full ? (
                      'Quota Reached'
                    ) : hasDisqualified ? (
                      <>
                        <Plus size={14} /> Submit Replacement Entry
                      </>
                    ) : (
                      <>
                        <Plus size={14} /> Open Entry Form
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Submission Modal */}
      {selectedComp && (
        <EntrySubmissionModal
          isOpen={true}
          onClose={() => setSelectedComp(null)}
          competition={selectedComp}
          school={school}
          onSubmitted={() => {
            onTabChange('students');
          }}
        />
      )}
    </>
  );
}
