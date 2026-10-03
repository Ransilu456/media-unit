'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useMediaStore } from '@/lib/store';
import { Competition, Submission } from '@/lib/types';
import { StatusBadge } from '@/components/ui/Badge';
import { EntrySubmissionModal } from '@/components/forms/EntrySubmissionModal';
import {
  School,
  FilePlus,
  Trophy,
  ExternalLink,
  Calendar,
  Layers,
  FileText,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface SchoolDashboardViewProps {
  initialCompetitionId?: string;
}

export function SchoolDashboardView({ initialCompetitionId }: SchoolDashboardViewProps) {
  const { session, competitions, submissions } = useMediaStore();
  const school = session.school;

  const [activeTab, setActiveTab] = useState<'submissions' | 'competitions' | 'badge'>('submissions');
  const [selectedCompForEntry, setSelectedCompForEntry] = useState<Competition | null>(() => {
    if (initialCompetitionId) {
      return competitions.find((c) => c.id === initialCompetitionId) || null;
    }
    return null;
  });

  if (!school) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mb-4">
          <School size={32} />
        </div>
        <h2 className="font-serif text-3xl font-bold text-slate-900 mb-2">
          School Delegation Access Required
        </h2>
        <p className="text-slate-600 text-sm max-w-md mb-6 font-light">
          Please log in with your registered school media unit credentials or complete registration to access your submissions.
        </p>
        <div className="flex gap-3">
          <Link
            href="/login"
            className="px-6 py-2.5 rounded-lg bg-amber-600 text-white text-xs font-semibold hover:bg-amber-500 transition-colors shadow-sm"
          >
            Sign In Now
          </Link>
          <Link
            href="/register"
            className="px-6 py-2.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Register School
          </Link>
        </div>
      </div>
    );
  }

  const mySubmissions = submissions.filter((s) => s.schoolId === school.id);

  const stats = {
    total: mySubmissions.length,
    underReview: mySubmissions.filter((s) => s.status === 'under_review' || s.status === 'submitted').length,
    verified: mySubmissions.filter((s) => s.status === 'verified').length,
    shortlisted: mySubmissions.filter((s) => s.status === 'shortlisted' || s.status === 'winner').length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* School Delegation Header Card */}
      <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm relative overflow-hidden mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-slate-900 border-2 border-amber-500 p-1 shrink-0">
              <Image
                src="/Agradhi.png"
                alt="Agradhi Media Unit"
                width={52}
                height={52}
                className="object-contain"
              />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-xs font-mono bg-amber-50 text-amber-800 border border-amber-200 px-3 py-0.5 rounded-full font-semibold">
                  Delegation ID: {school.badgeCode}
                </span>
                <span className="text-xs font-mono bg-slate-100 text-slate-700 px-3 py-0.5 rounded-full">
                  {school.district} • {school.province}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
                {school.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-light">
                Teacher-in-Charge: <span className="text-slate-800 font-medium">{school.teacherInCharge}</span> ({school.teacherPhone}) • President: <span className="text-slate-800 font-medium">{school.mediaPresident}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedCompForEntry(competitions[0])}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shadow-md shadow-amber-900/10 transition-colors"
            >
              <FilePlus size={16} />
              <span>Submit New Entry</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-3xl font-serif font-bold text-slate-900">{stats.total}</div>
            <p className="text-xs text-slate-500 mt-0.5">Total Entries Lodged</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-3xl font-serif font-bold text-amber-600">{stats.underReview}</div>
            <p className="text-xs text-slate-500 mt-0.5">Under Review</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-3xl font-serif font-bold text-emerald-600">{stats.verified}</div>
            <p className="text-xs text-slate-500 mt-0.5">Verified & Accepted</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-3xl font-serif font-bold text-amber-700">{stats.shortlisted}</div>
            <p className="text-xs text-slate-500 mt-0.5">Shortlisted Finalists</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-8">
        <button
          onClick={() => setActiveTab('submissions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'submissions'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText size={15} />
          <span>Our Submissions ({mySubmissions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('competitions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'competitions'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Trophy size={15} />
          <span>Available Tracks ({competitions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('badge')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'badge'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck size={15} />
          <span>Official Delegation Slip</span>
        </button>
      </div>

      {/* Tab 1: Submissions */}
      {activeTab === 'submissions' && (
        <div className="space-y-4">
          {mySubmissions.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 shadow-sm">
              <Trophy size={40} className="mx-auto text-slate-400 mb-3" />
              <h3 className="text-xl font-serif font-bold text-slate-900 mb-1">
                No Submissions Lodged Yet
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
                Your school delegation has not submitted any entries yet. Select an active competition below to submit your work.
              </p>
              <button
                onClick={() => setSelectedCompForEntry(competitions[0])}
                className="px-6 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-sm"
              >
                Submit First Entry
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mySubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-amber-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] font-mono text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                        {sub.category}
                      </span>
                      <StatusBadge status={sub.status} />
                    </div>

                    <h4 className="text-xl font-serif font-bold text-slate-900 mb-1">
                      {sub.entryTitle}
                    </h4>

                    <p className="text-xs text-slate-600 mb-3 line-clamp-2 font-light">
                      {sub.synopsis}
                    </p>

                    <div className="text-xs text-slate-600 space-y-1 py-3 border-y border-slate-100 mb-3 font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Student Lead:</span>
                        <span className="text-slate-800 font-medium">{sub.studentName} ({sub.studentGrade})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Submitted On:</span>
                        <span className="text-slate-700">{sub.submittedAt}</span>
                      </div>
                      {sub.score !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-amber-700 font-semibold">Jury Score:</span>
                          <span className="font-bold text-slate-900">{sub.score} / 100</span>
                        </div>
                      )}
                    </div>

                    {sub.judgeFeedback && (
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 mb-3 italic">
                        "{sub.judgeFeedback}"
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <a
                      href={sub.submissionLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-amber-700 transition-colors font-medium"
                    >
                      <ExternalLink size={13} />
                      <span>View Cloud Submission</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Available Competitions */}
      {activeTab === 'competitions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {competitions.map((comp) => {
            const currentSubmissionsForComp = mySubmissions.filter((s) => s.competitionId === comp.id).length;
            const reachedMax = currentSubmissionsForComp >= comp.maxEntriesPerSchool;

            return (
              <div
                key={comp.id}
                className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                      {comp.category}
                    </span>
                    <StatusBadge status={comp.status} />
                  </div>

                  <h4 className="text-xl font-serif font-bold text-slate-900 mb-2">
                    {comp.title}
                  </h4>
                  <p className="text-xs text-slate-600 line-clamp-3 mb-4 font-light">
                    {comp.description}
                  </p>

                  <div className="space-y-1.5 py-3 border-y border-slate-100 text-xs text-slate-600 mb-4">
                    <div className="flex justify-between">
                      <span>Deadline:</span>
                      <span className="font-mono text-amber-700 font-semibold">{comp.deadline}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Entries Lodged:</span>
                      <span className="text-slate-900 font-medium">
                        {currentSubmissionsForComp} / {comp.maxEntriesPerSchool}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <button
                    disabled={reachedMax || comp.status === 'closed'}
                    onClick={() => setSelectedCompForEntry(comp)}
                    className={`w-full py-2.5 rounded-lg text-xs font-semibold transition-all ${
                      reachedMax || comp.status === 'closed'
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-amber-600 hover:bg-amber-500 text-white shadow-sm'
                    }`}
                  >
                    {reachedMax
                      ? 'Quota Limit Reached'
                      : comp.status === 'closed'
                      ? 'Submissions Closed'
                      : 'Fill Submission Form'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 3: Official Delegation Credential Slip */}
      {activeTab === 'badge' && (
        <div className="max-w-xl mx-auto p-8 rounded-3xl bg-white border-2 border-amber-500 text-center shadow-xl">
          <div className="relative w-16 h-16 mx-auto mb-4 bg-slate-900 rounded-full border-2 border-amber-500 p-1 flex items-center justify-center">
            <Image
              src="/Agradhi.png"
              alt="Agradhi Media Unit Crest"
              width={50}
              height={50}
              className="object-contain"
            />
          </div>
          <span className="text-xs font-mono uppercase tracking-widest text-amber-600 block mb-1 font-semibold">
            Official Participating Delegation Pass
          </span>
          <h3 className="text-3xl font-serif font-bold text-slate-900 mb-2">
            {school.name}
          </h3>
          <p className="text-xs text-slate-500 mb-6 font-light">
            Agradhi Media Assembly 2026 • Saranath College
          </p>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2.5 mb-6">
            <div className="flex justify-between">
              <span className="text-slate-500">Official Badge Code:</span>
              <span className="font-mono text-amber-700 font-bold">{school.badgeCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Province & District:</span>
              <span className="text-slate-800">{school.province} ({school.district})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Teacher-in-Charge:</span>
              <span className="text-slate-800">{school.teacherInCharge}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Media President:</span>
              <span className="text-slate-800">{school.mediaPresident}</span>
            </div>
          </div>

          <div className="inline-block px-4 py-2 rounded-full bg-amber-50 border border-amber-300 text-xs font-mono text-amber-800 font-medium">
            Adjudication Secretariat Verified
          </div>
        </div>
      )}

      {/* Dynamic Entry Submission Modal */}
      {selectedCompForEntry && (
        <EntrySubmissionModal
          isOpen={true}
          onClose={() => setSelectedCompForEntry(null)}
          competition={selectedCompForEntry}
          school={school}
          onSubmitted={() => setActiveTab('submissions')}
        />
      )}
    </div>
  );
}
