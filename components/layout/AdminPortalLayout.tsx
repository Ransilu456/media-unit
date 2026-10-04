'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMediaStore } from '@/lib/store';
import {
  LayoutDashboard, School, Trophy, FileText,
  LogOut, Menu, X, ChevronRight, Bell, ShieldCheck,
  ArrowLeft, Sparkles,
} from 'lucide-react';

export type AdminTab = 'overview' | 'submissions' | 'competitions' | 'schools';

interface AdminPortalLayoutProps {
  children: React.ReactNode;
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
}

const NAV: {
  id: AdminTab;
  label: string;
  icon: React.ElementType;
  desc: string;
  accent: string;
  dotColor: string;
}[] = [
  { id: 'overview',     label: 'Overview',           icon: LayoutDashboard, desc: 'Stats & summary',      accent: 'from-amber-500 to-orange-600',   dotColor: 'bg-amber-400'  },
  { id: 'submissions',  label: 'All Submissions',    icon: FileText,        desc: 'Review & adjudicate',  accent: 'from-blue-500 to-indigo-600',    dotColor: 'bg-blue-400'   },
  { id: 'competitions', label: 'Competitions',       icon: Trophy,          desc: 'Manage events & forms', accent: 'from-emerald-500 to-teal-600',   dotColor: 'bg-emerald-400'},
  { id: 'schools',      label: 'School Delegations', icon: School,          desc: 'School management',    accent: 'from-violet-500 to-purple-600',  dotColor: 'bg-violet-400' },
];

export function AdminPortalLayout({ children, activeTab, onTabChange }: AdminPortalLayoutProps) {
  const router = useRouter();
  const { logout, schools, submissions, competitions } = useMediaStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); router.push('/'); };
  const pending = submissions.filter(s => s.status === 'submitted' || s.status === 'under_review').length;

  const Sidebar = () => (
    <aside
      className="w-64 shrink-0 flex flex-col h-full"
      style={{ background: 'linear-gradient(180deg, #0a0f1e 0%, #0d1530 50%, #0a0f1e 100%)' }}
    >
      {/* ── Brand ── */}
      <div className="shrink-0 px-5 pt-6 pb-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-5">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 p-1.5 flex items-center justify-center shadow-lg shadow-amber-900/50 group-hover:shadow-amber-900/70 transition-shadow">
              <Image src="/Agradhi.png" alt="Agradhi" width={24} height={24} className="object-contain" />
            </div>
            <div>
              <p className="text-[11px] font-black text-amber-400 uppercase tracking-widest leading-none">Agradhi Media</p>
              <p className="text-[9px] text-slate-500 uppercase tracking-[0.2em] mt-0.5">Admin Console</p>
            </div>
          </Link>
          <button onClick={() => setMobileOpen(false)} className="lg:hidden text-slate-600 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-all">
            <X size={16} />
          </button>
        </div>

        {/* Admin identity card */}
        <div className="relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/20 rounded-2xl" />
          <div className="relative flex items-center gap-3 px-3.5 py-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0 shadow-lg shadow-amber-900/40">
              <ShieldCheck size={16} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-amber-400/80 font-mono truncate">Saranath College · Admin</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Live counter strip ── */}
      <div className="shrink-0 grid grid-cols-4 gap-1 px-3 py-3 border-b border-white/5">
        {[
          { label: 'Schools',  val: schools.length,       color: 'text-blue-400',    glow: 'shadow-blue-500/20'    },
          { label: 'Entries',  val: submissions.length,   color: 'text-emerald-400', glow: 'shadow-emerald-500/20' },
          { label: 'Open',     val: competitions.filter(c => c.status === 'open').length, color: 'text-amber-400', glow: 'shadow-amber-500/20' },
          { label: 'Pending',  val: pending,              color: 'text-red-400',     glow: 'shadow-red-500/20'     },
        ].map(s => (
          <div key={s.label} className={`bg-white/5 rounded-xl px-1.5 py-2 text-center border border-white/5 shadow-lg ${s.glow}`}>
            <p className={`text-lg font-black leading-none ${s.color}`}>{s.val}</p>
            <p className="text-[8px] text-slate-600 mt-0.5 font-semibold uppercase tracking-wide">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 min-h-0 space-y-1">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 px-2 mb-3">Management</p>
        {NAV.map(item => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { onTabChange(item.id); setMobileOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group relative overflow-hidden ${
                active ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {/* Active gradient background */}
              {active && (
                <div className={`absolute inset-0 bg-gradient-to-r ${item.accent} opacity-20 rounded-xl`} />
              )}
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full bg-gradient-to-b from-transparent via-white to-transparent" />
              )}

              <div className={`relative w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                active
                  ? `bg-gradient-to-br ${item.accent} shadow-lg`
                  : 'bg-white/5 group-hover:bg-white/10'
              }`}>
                <Icon size={15} className={active ? 'text-white' : ''} />
              </div>

              <div className="relative min-w-0 flex-1">
                <p className={`text-sm font-semibold leading-tight ${active ? 'text-white' : ''}`}>{item.label}</p>
                <p className={`text-[10px] mt-0.5 ${active ? 'text-white/50' : 'text-slate-600'}`}>{item.desc}</p>
              </div>

              {active && <ChevronRight size={12} className="relative text-white/40 shrink-0" />}
              {!active && item.id === 'submissions' && pending > 0 && (
                <span className="relative w-5 h-5 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center shrink-0 shadow-lg shadow-red-900/40">
                  {pending > 9 ? '9+' : pending}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Footer ── */}
      <div className="shrink-0 border-t border-white/5 p-3 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:text-slate-200 hover:bg-white/5 rounded-xl transition-all"
        >
          <ArrowLeft size={12} /> Back to Main Site
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all font-medium"
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="h-screen overflow-hidden flex" style={{ background: '#f0f4f8' }}>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Desktop Sidebar (always visible) ── */}
      <div className="hidden lg:flex h-full shadow-2xl shadow-slate-900/40">
        <Sidebar />
      </div>

      {/* ── Mobile Sidebar (slide-in drawer) ── */}
      <div className={`
        fixed inset-y-0 left-0 z-40 flex h-full shadow-2xl shadow-slate-900/50
        transition-transform duration-300 ease-in-out lg:hidden
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar />
      </div>

      {/* ── MAIN AREA ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="shrink-0 bg-white/95 backdrop-blur-sm border-b border-slate-200/80 px-4 sm:px-6 h-14 flex items-center gap-3 shadow-sm">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden -ml-1 p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <Menu size={20} />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm min-w-0 flex-1">
            <span className="text-slate-400 hidden sm:block text-xs">Admin</span>
            <ChevronRight size={13} className="text-slate-300 hidden sm:block shrink-0" />
            <span className="font-bold text-slate-800">{NAV.find(n => n.id === activeTab)?.label}</span>
          </div>

          {/* Top-right actions */}
          <div className="flex items-center gap-2.5">
            <button className="relative p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors">
              <Bell size={17} />
              {pending > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
              )}
            </button>

            {/* Admin avatar */}
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md">
              <ShieldCheck size={14} className="text-white" />
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 min-h-0">
          {children}
        </main>
      </div>
    </div>
  );
}
