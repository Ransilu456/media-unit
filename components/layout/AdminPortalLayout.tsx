'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMediaStore } from '@/lib/store';
import { DashboardNotifications } from './DashboardNotifications';
import {
  LayoutDashboard,
  School,
  Trophy,
  FileText,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Globe,
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
}[] = [
  { id: 'overview',     label: 'Overview',          icon: LayoutDashboard },
  { id: 'submissions',  label: 'Submissions Desk',  icon: FileText },
  { id: 'competitions', label: 'Manage Tracks',     icon: Trophy },
  { id: 'schools',      label: 'Registered Schools',icon: School },
];

export function AdminPortalLayout({ children, activeTab, onTabChange }: AdminPortalLayoutProps) {
  const router = useRouter();
  const { logout, submissions, schools } = useMediaStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const pendingSubmissions = submissions.filter(
    (s) => s.status === 'submitted' || s.status === 'under_review'
  ).length;
  const pendingSchools = schools.filter((school) => school.status === 'pending').length;

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error: unknown) {
      window.alert(error instanceof Error ? error.message : 'Unable to sign out.');
    }
  };

  const renderSidebar = () => (
    <aside className="w-68 shrink-0 flex flex-col h-full bg-white border-r border-slate-100 select-none">
      {/* Brand Header */}
      <div className="shrink-0 flex items-center justify-between px-6 h-20 border-b border-slate-100">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200/80 p-1.5 flex items-center justify-center transition-transform group-hover:scale-105">
            <Image src="/Agradhi.png" alt="Agradhi Media" width={26} height={26} className="object-contain" />
          </div>
          <div>
            <span className="text-sm font-bold text-slate-900 tracking-tight block">Agradhi Executive</span>
            <span className="text-[11px] text-slate-400 block">Admin Console 2026</span>
          </div>
        </Link>
        <button
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation"
          className="lg:hidden text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-50"
        >
          <X size={18} />
        </button>
      </div>

      {/* Admin Executive Tag */}
      <div className="p-4 mx-4 my-4 rounded-2xl bg-slate-50/70 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100/70 text-amber-800 flex items-center justify-center shrink-0">
            <ShieldCheck size={18} />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-slate-900">Executive Board</h3>
            <p className="text-[11px] text-slate-500 font-mono">Saranath College</p>
          </div>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Control Panel
        </p>

        {NAV.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                setMobileOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-xs font-semibold transition-all ${
                active
                  ? 'bg-slate-900 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon size={16} className={active ? 'text-white' : 'text-slate-400'} />
                <span className="truncate">{item.label}</span>
              </div>

              {item.id === 'submissions' && pendingSubmissions > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    active ? 'bg-white text-slate-900' : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  {pendingSubmissions}
                </span>
              )}
              {item.id === 'schools' && pendingSchools > 0 && (
                <span
                  aria-label={`${pendingSchools} pending school registrations`}
                  className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold"
                >
                  {pendingSchools > 99 ? '99+' : pendingSchools}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Footer Actions */}
      <div className="shrink-0 border-t border-slate-100 p-4 space-y-1">
        <Link
          href="/"
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
        >
          <Globe size={15} className="text-slate-400" />
          <span>Public Website</span>
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors font-medium"
        >
          <LogOut size={15} className="text-slate-400" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );

  return (
    <div className="h-screen overflow-hidden flex bg-slate-50/60 text-slate-900 font-sans">
      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/20 z-30 lg:hidden backdrop-blur-xs"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex h-full shadow-[2px_0_15px_rgba(0,0,0,0.02)]">{renderSidebar()}</div>

      {/* Mobile Slide-In Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 flex h-full transition-transform duration-300 ease-in-out lg:hidden shadow-xl ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {renderSidebar()}
      </div>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="shrink-0 bg-white border-b border-slate-100 px-6 sm:px-8 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-50 transition-colors"
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>

            <div className="flex items-center gap-2 text-xs sm:text-sm min-w-0">
              <span className="text-slate-400 hidden sm:inline">Admin Board</span>
              <span className="text-slate-300 hidden sm:inline">/</span>
              <span className="font-bold text-slate-900 truncate">
                {NAV.find((n) => n.id === activeTab)?.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <DashboardNotifications />
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 text-slate-700 text-xs font-semibold">
              <ShieldCheck size={14} className="text-amber-700" />
              <span>Saranath College</span>
            </span>
          </div>
        </header>

        {/* Scrollable Content Workspace */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-10 min-h-0 bg-slate-50/50">
          <div className="max-w-5xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
