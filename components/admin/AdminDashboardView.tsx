'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useMediaStore } from '@/lib/store';
import { AdminCompetitionsManager } from './AdminCompetitionsManager';
import { AdminSubmissionsReview } from './AdminSubmissionsReview';
import { AdminSchoolsManager } from './AdminSchoolsManager';
import {
  ShieldCheck,
  School,
  FileText,
  Trophy,
  RotateCcw,
} from 'lucide-react';

export function AdminDashboardView() {
  const { session, schools, competitions, submissions, resetToDefaults } = useMediaStore();
  const [activeTab, setActiveTab] = useState<'submissions' | 'competitions' | 'schools'>('submissions');

  if (session.type !== 'admin') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mb-4">
          <ShieldCheck size={32} />
        </div>
        <h2 className="font-serif text-3xl font-bold text-slate-900 mb-2">
          Executive Admin Access Restricted
        </h2>
        <p className="text-slate-600 text-sm max-w-md mb-6 font-light">
          This portal is reserved for the Executive Adjudication Board of Agradhi Media Unit, Saranath College.
        </p>
        <Link
          href="/login?tab=admin"
          className="px-6 py-2.5 rounded-lg bg-amber-600 text-white text-xs font-semibold hover:bg-amber-500 transition-colors shadow-sm"
        >
          Sign In to Admin Console
        </Link>
      </div>
    );
  }

  const stats = {
    schoolsCount: schools.length,
    submissionsCount: submissions.length,
    verifiedCount: submissions.filter((s) => s.status === 'verified' || s.status === 'shortlisted' || s.status === 'winner').length,
    openCompetitions: competitions.filter((c) => c.status === 'open').length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Admin Executive Header Card */}
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
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-mono bg-amber-50 text-amber-800 border border-amber-200 px-3 py-0.5 rounded-full flex items-center gap-1.5 font-semibold">
                  <ShieldCheck size={13} />
                  Executive Board Adjudication Panel
                </span>
                <span className="text-xs font-mono bg-slate-100 text-slate-700 px-3 py-0.5 rounded-full">
                  Saranath College
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
                Agradhi Media Board Console
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-light">
                Manage islandwide school delegations, configure dynamic entry forms, and score submissions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (confirm('Reset store back to default demo schools and sample competitions?')) {
                  resetToDefaults();
                }
              }}
              title="Reset Sample Data"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-medium transition-colors"
            >
              <RotateCcw size={13} />
              <span>Reset Demo Data</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-3xl font-serif font-bold text-slate-900">{stats.schoolsCount}</div>
            <p className="text-xs text-slate-500 mt-0.5">Enrolled Schools</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-3xl font-serif font-bold text-amber-600">{stats.submissionsCount}</div>
            <p className="text-xs text-slate-500 mt-0.5">Total Entries Lodged</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-3xl font-serif font-bold text-emerald-600">{stats.verifiedCount}</div>
            <p className="text-xs text-slate-500 mt-0.5">Verified & Finalists</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="text-3xl font-serif font-bold text-slate-700">{stats.openCompetitions}</div>
            <p className="text-xs text-slate-500 mt-0.5">Active Form Tracks</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-8 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('submissions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'submissions'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText size={15} />
          <span>Submissions Adjudication ({submissions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('competitions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'competitions'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Trophy size={15} />
          <span>Forms & Competitions ({competitions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('schools')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'schools'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <School size={15} />
          <span>Outer School Delegations ({schools.length})</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'submissions' && <AdminSubmissionsReview />}
      {activeTab === 'competitions' && <AdminCompetitionsManager />}
      {activeTab === 'schools' && <AdminSchoolsManager />}
    </div>
  );
}
