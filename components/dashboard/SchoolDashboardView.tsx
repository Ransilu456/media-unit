'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useMediaStore } from '@/lib/store';
import { Competition, Submission } from '@/lib/types';
import { StatusBadge } from '@/components/ui/Badge';
import { EntrySubmissionModal } from '@/components/forms/EntrySubmissionModal';
import { SchoolTab } from '@/components/layout/SchoolPortalLayout';
import {
  Trophy, FilePlus, ExternalLink, Calendar,
  ShieldCheck, Users, CheckCircle2, Sparkles,
  Clock, Star, BarChart3, TrendingUp, AlertCircle,
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

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, val, icon: Icon, gradient, badge }: {
  label: string; val: number; icon: React.ElementType;
  gradient: string; badge?: string;
}) {
  return (
    <div className={`relative rounded-2xl p-5 overflow-hidden ${gradient} border`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-3xl font-black text-white drop-shadow">{val}</p>
          <p className="text-xs font-semibold text-white/80 mt-1">{label}</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
          <Icon size={18} className="text-white" />
        </div>
      </div>
      {badge && (
        <div className="absolute bottom-3 right-3 text-[10px] font-bold text-white/60 uppercase tracking-wide">{badge}</div>
      )}
      {/* Decorative circle */}
      <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
    </div>
  );
}

export function SchoolDashboardView({ activeTab, onTabChange, initialCompetitionId }: Props) {
  const { session, competitions, submissions } = useMediaStore();
  const school = session.school;

  const [selectedComp, setSelectedComp] = useState<Competition | null>(() =>
    initialCompetitionId ? competitions.find(c => c.id === initialCompetitionId) ?? null : null
  );

  if (!school) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mb-5 shadow-lg shadow-amber-200">
          <ShieldCheck size={36} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Required</h2>
        <p className="text-slate-500 text-sm max-w-sm mb-6">Sign in with your school's registered credentials to access this portal.</p>
        <Link href="/login" className="px-6 py-3 rounded-xl bg-amber-600 text-white text-sm font-semibold hover:bg-amber-500 transition-all shadow-sm">
          Sign In
        </Link>
      </div>
    );
  }

  const mySubmissions = submissions.filter(s => s.schoolId === school.id);
  const openComps = competitions.filter(c => c.status === 'open');

  const stats = {
    total:       mySubmissions.length,
    pending:     mySubmissions.filter(s => s.status === 'submitted' || s.status === 'under_review').length,
    verified:    mySubmissions.filter(s => s.status === 'verified').length,
    shortlisted: mySubmissions.filter(s => s.status === 'shortlisted' || s.status === 'winner').length,
  };

  return (
    <>
      {/* ── OVERVIEW TAB ── */}
      {activeTab === 'overview' && (
        <div className="space-y-6 max-w-5xl">

          {/* School Hero Banner */}
          <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 overflow-hidden border border-slate-700 shadow-xl">
            {/* Decorative background */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
            </div>

            <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* School avatar */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-black text-3xl shadow-lg shadow-amber-900/40 shrink-0">
                {school.name[0]}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-xs font-mono bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-semibold">
                    {school.badgeCode}
                  </span>
                  <span className="text-xs text-slate-400">{school.district} · {school.province}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    school.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>{school.status}</span>
                </div>
                <h1 className="text-2xl font-bold text-white leading-tight">{school.name}</h1>
                <p className="text-xs text-slate-400 mt-1">
                  Teacher: <span className="text-slate-300 font-medium">{school.teacherInCharge}</span>
                  {school.mediaPresident && (
                    <> · President: <span className="text-slate-300 font-medium">{school.mediaPresident}</span></>
                  )}
                </p>
              </div>

              <button
                onClick={() => openComps[0] && setSelectedComp(openComps[0])}
                disabled={openComps.length === 0}
                className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-amber-900/30"
              >
                <Plus size={15} /> New Entry
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              label="Total Entries"
              val={stats.total}
              icon={BarChart3}
              gradient="bg-gradient-to-br from-slate-700 to-slate-900 border-slate-700"
            />
            <StatCard
              label="Under Review"
              val={stats.pending}
              icon={Clock}
              gradient="bg-gradient-to-br from-amber-500 to-orange-600 border-amber-400"
              badge="pending"
            />
            <StatCard
              label="Verified"
              val={stats.verified}
              icon={CheckCircle2}
              gradient="bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-400"
              badge="passed"
            />
            <StatCard
              label="Shortlisted"
              val={stats.shortlisted}
              icon={TrendingUp}
              gradient="bg-gradient-to-br from-blue-500 to-indigo-600 border-blue-400"
              badge="top"
            />
          </div>

          {/* Availability notice */}
          {openComps.length > 0 && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <Trophy size={18} className="text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-amber-900">
                  {openComps.length} competition{openComps.length > 1 ? 's' : ''} open for entries
                </p>
                <p className="text-xs text-amber-700 mt-0.5">Submit your students' entries before the deadlines.</p>
              </div>
              <button
                onClick={() => onTabChange('competitions')}
                className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-500 transition-all"
              >
                Browse <ArrowRight size={12} />
              </button>
            </div>
          )}

          {/* Recent entries */}
          {mySubmissions.length > 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
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
                Use "Add New Entry" to register your students for open competitions.
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
        <div className="max-w-5xl space-y-4">
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

          {mySubmissions.length === 0 ? (
            <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-14 text-center">
              <Users size={32} className="mx-auto text-slate-300 mb-3" />
              <h3 className="text-sm font-bold text-slate-600 mb-1">No entries registered yet</h3>
              <p className="text-xs text-slate-400 mb-4">Add student entries through the competitions tab.</p>
              <button onClick={() => onTabChange('competitions')} className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors">
                Browse Open Competitions
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {mySubmissions.map(sub => {
                const CatIcon = CATEGORY_ICONS[sub.category] ?? Trophy;
                return (
                  <div key={sub.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-amber-200 transition-all">
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
                        "{sub.judgeFeedback}"
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
        <div className="max-w-5xl space-y-5">
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
                const daysLeft = Math.ceil((new Date(comp.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
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
        <div className="max-w-3xl space-y-5">
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
          onSubmitted={() => { setSelectedComp(null); onTabChange('students'); }}
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
