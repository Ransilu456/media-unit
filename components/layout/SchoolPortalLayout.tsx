'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMediaStore } from '@/lib/store';
import {
  LayoutDashboard, Users, Trophy, FilePlus,
  LogOut, Menu, X, ChevronRight, MapPin, ExternalLink,
} from 'lucide-react';

export type SchoolTab = 'overview' | 'students' | 'competitions' | 'apply';

interface SchoolPortalLayoutProps {
  children: React.ReactNode;
  activeTab: SchoolTab;
  onTabChange: (tab: SchoolTab) => void;
}

const NAV: {
  id: SchoolTab;
  label: string;
  icon: React.ElementType;
  desc: string;
  gradient: string;
}[] = [
  { id: 'overview',     label: 'Dashboard',       icon: LayoutDashboard, desc: 'Overview & stats',      gradient: 'from-amber-500 to-orange-600'  },
  { id: 'students',     label: 'Student Entries',  icon: Users,           desc: 'All registered entries', gradient: 'from-blue-500 to-indigo-600'   },
  { id: 'competitions', label: 'Competitions',     icon: Trophy,          desc: 'Open events',            gradient: 'from-emerald-500 to-teal-600'  },
  { id: 'apply',        label: 'Add New Entry',    icon: FilePlus,        desc: 'Submit a student entry', gradient: 'from-violet-500 to-purple-600' },
];

const BG = 'linear-gradient(180deg, #0a0f1e 0%, #0d1530 60%, #0a0f1e 100%)';

export function SchoolPortalLayout({ children, activeTab, onTabChange }: SchoolPortalLayoutProps) {
  const router = useRouter();
  const { session, logout } = useMediaStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const school = session.school;

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error: unknown) {
      window.alert(error instanceof Error ? error.message : 'Unable to sign out.');
    }
  };

  const renderSidebar = () => (
    <aside className="w-64 shrink-0 flex flex-col h-full" style={{ background: BG }}>
      {/* ── Brand ── */}
      <div className="shrink-0 px-5 pt-6 pb-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-5">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 p-1.5 flex items-center justify-center shadow-lg shadow-amber-900/50 group-hover:shadow-amber-900/70 transition-all">
              <Image src="/Agradhi.png" alt="Agradhi" width={24} height={24} className="object-contain" />
            </div>
            <div>
              <p className="text-[11px] font-black text-amber-400 uppercase tracking-widest leading-none">Agradhi Media</p>
              <p className="text-[9px] text-slate-500 uppercase tracking-[0.2em] mt-0.5">School Portal · 2026</p>
            </div>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-slate-600 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* School identity card */}
        <div className="relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/15 to-orange-500/8 border border-amber-500/20 rounded-2xl" />
          <div className="relative p-3.5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-amber-900/40 shrink-0">
                {school?.name?.[0] ?? 'S'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate leading-snug" title={school?.name}>
                  {school?.name ?? 'School Portal'}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin size={9} className="text-amber-400 shrink-0" />
                  <p className="text-[10px] text-slate-400 truncate">{school?.district ?? '—'}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2.5 border-t border-white/5">
              <span className="text-[10px] text-slate-500 font-mono">{school?.badgeCode ?? '—'}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                school?.status === 'active'
                  ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30'
                  : 'bg-red-500/20 text-red-400 ring-1 ring-red-500/30'
              }`}>
                {school?.status ?? 'pending'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 min-h-0 space-y-1">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 px-2 mb-3">School Portal</p>

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
              {/* Active bg glow */}
              {active && (
                <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-20 rounded-xl`} />
              )}
              {/* Active left indicator */}
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full bg-white/60" />
              )}

              <div className={`relative w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                active
                  ? `bg-gradient-to-br ${item.gradient} shadow-lg`
                  : 'bg-white/5 group-hover:bg-white/10'
              }`}>
                <Icon size={15} className={active ? 'text-white' : ''} />
              </div>

              <div className="relative min-w-0 flex-1">
                <p className={`text-sm font-semibold leading-tight ${active ? 'text-white' : ''}`}>
                  {item.label}
                </p>
                <p className={`text-[10px] mt-0.5 ${active ? 'text-white/50' : 'text-slate-600'}`}>
                  {item.desc}
                </p>
              </div>

              {active && <ChevronRight size={12} className="relative text-white/40 shrink-0" />}
            </button>
          );
        })}

        {/* Quick links */}
        <div className="mt-4 pt-3 border-t border-white/5 space-y-0.5">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 px-2 mb-2">Quick Links</p>
          <a
            href="/apply"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:text-amber-400 hover:bg-white/5 rounded-xl transition-all"
          >
            <ExternalLink size={11} /> Student Application Form
          </a>
          <a
            href="/competitions"
            className="flex items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:text-slate-300 hover:bg-white/5 rounded-xl transition-all"
          >
            <Trophy size={11} /> All Competitions
          </a>
        </div>
      </nav>

      {/* ── Footer ── */}
      <div className="shrink-0 border-t border-white/5 p-3">
        <div className="px-2 py-2 mb-1">
          <p className="text-[10px] text-slate-600">Teacher-in-Charge</p>
          <p className="text-xs font-semibold text-slate-300 truncate">{school?.teacherInCharge ?? '—'}</p>
        </div>
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

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className="hidden lg:flex h-full shadow-2xl shadow-slate-900/40">
        {renderSidebar()}
      </div>

      <div className={`
        fixed inset-y-0 left-0 z-40 flex h-full shadow-2xl shadow-slate-900/50
        transition-transform duration-300 ease-in-out lg:hidden
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {renderSidebar()}
      </div>

      {/* ── MAIN AREA ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="shrink-0 bg-white/95 backdrop-blur-sm border-b border-slate-200/80 px-4 sm:px-6 h-14 flex items-center gap-3 shadow-sm">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden -ml-1 p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-2 text-sm min-w-0 flex-1">
            <span className="text-slate-400 hidden sm:block text-xs truncate max-w-[140px]" title={school?.name}>
              {school?.name}
            </span>
            <ChevronRight size={13} className="text-slate-300 hidden sm:block shrink-0" />
            <span className="font-bold text-slate-800">{NAV.find(n => n.id === activeTab)?.label}</span>
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
