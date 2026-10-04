'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMediaStore } from '@/lib/store';
import { AdminPortalLayout, AdminTab } from '@/components/layout/AdminPortalLayout';
import { AdminSubmissionsReview } from '@/components/admin/AdminSubmissionsReview';
import { AdminCompetitionsManager } from '@/components/admin/AdminCompetitionsManager';
import { AdminSchoolsManager } from '@/components/admin/AdminSchoolsManager';
import { StatusBadge } from '@/components/ui/Badge';
import {
  ShieldCheck, FileText, Trophy, School, Users,
  TrendingUp, CheckCircle2, Clock, Star, ArrowRight,
  BarChart3, Zap, Activity,
} from 'lucide-react';

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, gradient, subLabel }: {
  label: string; value: number; icon: React.ElementType;
  gradient: string; subLabel?: string;
}) {
  return (
    <div className={`relative rounded-2xl p-5 overflow-hidden ${gradient} border shadow-lg`}>
      {/* Decorative bg shape */}
      <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/10" />
      <div className="absolute -right-1 -bottom-3 w-12 h-12 rounded-full bg-white/5" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-4xl font-black text-white drop-shadow-sm">{value}</p>
          <p className="text-xs font-semibold text-white/80 mt-1.5 leading-tight">{label}</p>
          {subLabel && <p className="text-[10px] text-white/50 mt-0.5">{subLabel}</p>}
        </div>
        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
          <Icon size={18} className="text-white" />
        </div>
      </div>
    </div>
  );
}

// ── Admin Overview Page ───────────────────────────────────────────────────────
function AdminOverview() {
  const { schools, competitions, submissions } = useMediaStore();

  const stats = {
    schools:     schools.length,
    entries:     submissions.length,
    open:        competitions.filter(c => c.status === 'open').length,
    pending:     submissions.filter(s => s.status === 'submitted' || s.status === 'under_review').length,
    verified:    submissions.filter(s => s.status === 'verified').length,
    shortlisted: submissions.filter(s => s.status === 'shortlisted' || s.status === 'winner').length,
  };

  const recentSubs = submissions.slice(0, 6);

  return (
    <div className="space-y-6 max-w-6xl">

      {/* ── Hero Banner ── */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-7 sm:p-8 overflow-hidden border border-slate-700 shadow-2xl">
        {/* Decorative glows */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-indigo-500/10 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />
        </div>

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shrink-0 shadow-xl shadow-amber-900/50">
              <ShieldCheck size={26} className="text-white" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400/80 font-mono">
                  Agradhi Media Unit 2026
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-600" />
                <span className="text-[10px] text-slate-500 font-mono">Saranath College</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                Admin Control Centre
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Manage school delegations, competitions & adjudicate entries.
              </p>
            </div>
          </div>

          {/* Live activity pill */}
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 shrink-0">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <Activity size={13} className="text-emerald-400" />
            <span className="text-xs font-bold text-emerald-400">System Live</span>
          </div>
        </div>

        {/* Quick stats row */}
        <div className="relative grid grid-cols-3 sm:grid-cols-6 gap-2 mt-6 pt-5 border-t border-white/5">
          {[
            { label: 'Schools',    val: stats.schools,     color: 'text-blue-400'    },
            { label: 'Entries',    val: stats.entries,     color: 'text-emerald-400' },
            { label: 'Open',       val: stats.open,        color: 'text-amber-400'   },
            { label: 'Pending',    val: stats.pending,     color: 'text-orange-400'  },
            { label: 'Verified',   val: stats.verified,    color: 'text-teal-400'    },
            { label: 'Shortlisted',val: stats.shortlisted, color: 'text-violet-400'  },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
              <p className="text-[10px] text-slate-600 font-semibold uppercase tracking-wide mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Registered Schools"
          value={stats.schools}
          icon={School}
          gradient="bg-gradient-to-br from-blue-600 to-indigo-700 border-blue-500/30"
          subLabel="All-island delegations"
        />
        <StatCard
          label="Total Entries"
          value={stats.entries}
          icon={FileText}
          gradient="bg-gradient-to-br from-amber-500 to-orange-600 border-amber-400/30"
          subLabel="Across all competitions"
        />
        <StatCard
          label="Open Competitions"
          value={stats.open}
          icon={Trophy}
          gradient="bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-400/30"
          subLabel={`${competitions.length} total tracks`}
        />
        <StatCard
          label="Pending Review"
          value={stats.pending}
          icon={Users}
          gradient="bg-gradient-to-br from-rose-500 to-pink-600 border-rose-400/30"
          subLabel="Awaiting adjudication"
        />
      </div>

      {/* ── Quick actions + recent submissions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center">
              <Zap size={14} className="text-amber-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Quick Actions</h3>
          </div>

          {[
            { label: 'Review Submissions',  desc: `${stats.pending} pending`,  tab: 'submissions' as AdminTab, icon: FileText,    color: 'text-blue-600',   bg: 'bg-blue-50',    border: 'border-blue-100'    },
            { label: 'View Competitions',   desc: `${stats.open} open now`,    tab: 'competitions' as AdminTab, icon: Trophy,     color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
            { label: 'Manage Schools',      desc: `${stats.schools} enrolled`, tab: 'schools' as AdminTab,     icon: School,      color: 'text-violet-600', bg: 'bg-violet-50',  border: 'border-violet-100'  },
          ].map(item => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className={`flex items-center gap-3 p-3 rounded-xl border ${item.border} ${item.bg} hover:opacity-80 transition-opacity cursor-pointer`}
              >
                <div className="w-9 h-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm">
                  <Icon size={15} className={item.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800">{item.label}</p>
                  <p className="text-[10px] text-slate-500">{item.desc}</p>
                </div>
                <ArrowRight size={13} className="text-slate-400 shrink-0" />
              </div>
            );
          })}

          {/* Progress bars */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pipeline</p>
            {[
              { label: 'Verified',    val: stats.verified,    total: stats.entries, color: 'bg-emerald-500' },
              { label: 'Shortlisted', val: stats.shortlisted, total: stats.entries, color: 'bg-violet-500'  },
            ].map(b => {
              const pct = stats.entries > 0 ? Math.round((b.val / stats.entries) * 100) : 0;
              return (
                <div key={b.label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-[11px] text-slate-600 font-medium">{b.label}</span>
                    <span className="text-[11px] text-slate-500">{b.val}/{stats.entries} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100">
                    <div className={`h-full rounded-full transition-all ${b.color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent submissions */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                <BarChart3 size={13} className="text-slate-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Latest Submissions</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">{submissions.length} total</span>
          </div>

          {recentSubs.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <Star size={28} className="mx-auto text-slate-200 mb-3" />
              <p className="text-sm text-slate-400">No submissions yet</p>
              <p className="text-xs text-slate-300 mt-1">Entries will appear here once schools submit.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {recentSubs.map(sub => (
                <div key={sub.id} className="px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800 truncate">{sub.entryTitle}</p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {sub.schoolName} · {sub.studentName}
                      {sub.studentAge ? ` · Age ${sub.studentAge}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {sub.competitionMedium && sub.competitionMedium !== 'None' && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        sub.competitionMedium === 'Sinhala'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-violet-50 text-violet-700 border-violet-200'
                      }`}>
                        {sub.competitionMedium[0]}
                      </span>
                    )}
                    <StatusBadge status={sub.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const { session, isLoaded } = useMediaStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  React.useEffect(() => {
    if (isLoaded && session.type !== 'admin') {
      router.push('/login?tab=admin');
    }
  }, [isLoaded, session.type, router]);

  if (!isLoaded || session.type !== 'admin') return null;

  return (
    <AdminPortalLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'overview'     && <AdminOverview />}
      {activeTab === 'submissions'  && <AdminSubmissionsReview />}
      {activeTab === 'competitions' && <AdminCompetitionsManager />}
      {activeTab === 'schools'      && <AdminSchoolsManager />}
    </AdminPortalLayout>
  );
}
