'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useMediaStore } from '@/lib/store';
import { firebaseGetCompetitions, firebaseGetSchools, firebaseGetSubmissions } from '@/lib/firebaseOperations';
import { AdminCompetitionsManager } from './AdminCompetitionsManager';
import { AdminSubmissionsReview } from './AdminSubmissionsReview';
import { AdminSchoolsManager } from './AdminSchoolsManager';
import {
  ShieldCheck,
  School,
  FileText,
  Trophy,
  RotateCcw,
  Cloud,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export function AdminDashboardView() {
  const { session, schools, competitions, submissions, resetToDefaults } = useMediaStore();
  const [activeTab, setActiveTab] = useState<'submissions' | 'competitions' | 'schools'>('submissions');
  const [syncingFirebase, setSyncingFirebase] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSyncFirebase = async () => {
    setSyncingFirebase(true);
    setSyncStatus(null);
    try {
      // Directly refresh from Firebase Firestore — no API route needed
      const [comps, schs, subs] = await Promise.all([
        firebaseGetCompetitions(),
        firebaseGetSchools(),
        firebaseGetSubmissions(),
      ]);
      const total = comps.length + schs.length + subs.length;
      setSyncStatus({
        type: 'success',
        message: `Firebase sync complete! Loaded ${comps.length} competitions, ${schs.length} schools, ${subs.length} submissions.`,
      });
    } catch (err) {
      setSyncStatus({
        type: 'error',
        message: 'Could not reach Firestore. Please verify Cloud Firestore is created in Firebase Console.',
      });
    } finally {
      setSyncingFirebase(false);
    }
  };

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

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => void handleSyncFirebase()}
              disabled={syncingFirebase}
              title="Sync current records to Cloud Firestore"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-semibold transition-all shadow-xs"
            >
              <Cloud size={13} className={syncingFirebase ? 'animate-pulse' : ''} />
              <span>{syncingFirebase ? 'Syncing...' : 'Sync to Firebase'}</span>
            </button>

            <button
              onClick={() => {
                if (confirm('Reset store back to default demo schools and sample competitions?')) {
                  void resetToDefaults().catch((error: unknown) => {
                    window.alert(error instanceof Error ? error.message : 'Unable to reset the demo data.');
                  });
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

        {syncStatus && (
          <div
            className={`mt-4 p-3 rounded-xl flex items-center gap-2 text-xs font-medium ${
              syncStatus.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-amber-50 text-amber-900 border border-amber-200'
            }`}
          >
            {syncStatus.type === 'success' ? (
              <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle size={15} className="shrink-0 text-amber-600" />
            )}
            <span>{syncStatus.message}</span>
          </div>
        )}

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
