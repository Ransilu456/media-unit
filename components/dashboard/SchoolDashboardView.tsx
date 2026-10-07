'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useMediaStore } from '@/lib/store';
import { Competition } from '@/lib/types';
import { StatusBadge } from '@/components/ui/Badge';
import { EntrySubmissionModal } from '@/components/forms/EntrySubmissionModal';
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
  const { session, competitions, submissions } = useMediaStore();
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
      {/* ── OVERVIEW TAB ── */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          
          {/* School Banner Card */}
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

          {/* 4 Metric Cards with Soft Clean Shadows */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Total Entries</span>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-slate-900">{stats.total}</span>
                <span className="text-xs text-slate-400 font-medium">Delegation</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 block mb-2">Awaiting Review</span>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-slate-900">{stats.submitted}</span>
                <span className="text-xs text-amber-700 font-medium">In Queue</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 block mb-2">Under Evaluation</span>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-slate-900">{stats.underReview}</span>
                <span className="text-xs text-blue-700 font-medium">Jury Review</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block mb-2">Advanced</span>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-slate-900">{stats.advanced}</span>
                <span className="text-xs text-emerald-700 font-medium">Verified / Finalist</span>
              </div>
            </div>

          </div>

          {/* Recent Entries & Quick Launch Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Recent Entries Box */}
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

              {mySubmissions.length === 0 ? (
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

            {/* Open Tracks Quick Launcher */}
            <div className="lg:col-span-4 rounded-3xl border border-slate-100 bg-white p-7 shadow-[0_4px_25px_rgba(0,0,0,0.03)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-50 mb-4">
                  <h3 className="text-base font-bold text-slate-900">Open Tracks</h3>
                  <span className="text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
                    {openComps.length} Tracks
                  </span>
                </div>

                <div className="space-y-3">
                  {openComps.slice(0, 4).map((comp) => {
                    const count = mySubmissions.filter((s) => s.competitionId === comp.id).length;
                    const full = count >= comp.maxEntriesPerSchool;

                    return (
                      <div
                        key={comp.id}
                        className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{comp.title}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Due {comp.deadline} · {count}/{comp.maxEntriesPerSchool} used
                          </p>
                        </div>

                        <button
                          onClick={() => setSelectedComp(comp)}
                          disabled={full}
                          className="shrink-0 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold transition-colors disabled:opacity-30"
                        >
                          {full ? 'Full' : 'Enter'}
                        </button>
                      </div>
                    );
                  })}
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

        </div>
      )}

      {/* ── STUDENT ENTRIES TAB ── */}
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

          {/* Search and Status Filters */}
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

          {/* Entries Cards List with Soft Shadows */}
          {filteredEntries.length === 0 ? (
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
                        <span className="font-semibold text-slate-800">{sub.submittedAt}</span>
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

                    {/* Judge Feedback & Score if provided */}
                    {sub.score !== undefined && (
                      <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 text-xs font-medium">
                        <Star size={15} className="text-amber-600" />
                        <span>Official Evaluation Score: <strong className="font-bold">{sub.score} / 100</strong></span>
                      </div>
                    )}

                    {sub.judgeFeedback && (
                      <div className="mt-2 p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 text-xs italic">
                        <strong>Judge Feedback:</strong> &quot;{sub.judgeFeedback}&quot;
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {competitions.map((comp) => {
              const mine = mySubmissions.filter((s) => s.competitionId === comp.id).length;
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
                          {mine} / {comp.maxEntriesPerSchool} used
                        </span>
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
              const mine = mySubmissions.filter((s) => s.competitionId === comp.id).length;
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
                      <p>Quota: <strong className="text-slate-700">{mine}/{comp.maxEntriesPerSchool} used</strong></p>
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
                    {full ? 'Quota Reached' : <><Plus size={14} /> Open Entry Form</>}
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
