'use client';

import React, { useEffect, useState } from 'react';
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
  description: string;
}[] = [
  { id: 'overview',     label: 'Overview',           icon: LayoutDashboard, description: 'Dashboard summary' },
  { id: 'submissions',  label: 'Submissions Desk',   icon: FileText,        description: 'Review entries' },
  { id: 'competitions', label: 'Manage Tracks',      icon: Trophy,          description: 'Competition settings' },
  { id: 'schools',      label: 'Registered Schools', icon: School,          description: 'School accounts' },
];

export function AdminPortalLayout({ children, activeTab, onTabChange }: AdminPortalLayoutProps) {
  const router = useRouter();
  const { logout, submissions, schools } = useMediaStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [mobileOpen]);

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
    <aside className="flex h-full w-[min(20rem,calc(100vw-1rem))] min-h-0 shrink-0 select-none flex-col bg-white lg:w-[260px] xl:w-[272px]">

      {/* Brand Header */}
      <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-slate-100 px-4 sm:px-5">
        <Link href="/" className="flex items-center gap-3 group min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sara-navy p-2 shadow-sm transition-transform group-hover:scale-105">
            <Image src="/Agradhi.png" alt="Agradhi Media" width={26} height={26} className="object-contain" />
          </div>
          <div className="min-w-0">
            <span className="text-sm font-bold text-slate-900 tracking-tight block truncate">Agradhi Executive</span>
            <span className="text-[11px] text-slate-400 font-medium block">Admin Console 2026</span>
          </div>
        </Link>
        <button
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation"
          className="lg:hidden text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-50 shrink-0 ml-2"
        >
          <X size={18} />
        </button>
      </div>

      {/* Admin Identity Pill Card */}
      <div className="px-4 pb-1 pt-4">
        <div className="rounded-2xl bg-sara-navy p-3.5 text-white shadow-sm sm:p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-300/25 bg-amber-300/10">
              <ShieldCheck size={19} className="text-amber-300" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">Executive Board</p>
              <p className="text-[11px] text-white/50 truncate">Saranath College</p>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center gap-2 text-[11px]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="text-white/60 font-medium">Administrator session active</span>
          </div>
        </div>
      </div>

      {/* Nav List - Matching Screenshot 2026-10-11 061042.png */}
      <nav aria-label="Admin dashboard" className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain px-3 py-4">
        <p className="px-3 pb-3 pt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
          Menu
        </p>

        {NAV.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          const hasBadge =
            (item.id === 'submissions' && pendingSubmissions > 0) ||
            (item.id === 'schools' && pendingSchools > 0);
          const badgeCount = item.id === 'submissions' ? pendingSubmissions : pendingSchools;

          return (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                setMobileOpen(false);
              }}
              title={item.description}
              aria-current={active ? 'page' : undefined}
              className={`relative flex min-h-12 w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left transition-all group ${
                active
                  ? 'border-amber-200 bg-amber-50 text-slate-950 font-semibold shadow-sm'
                  : 'border-transparent text-slate-600 hover:border-slate-100 hover:bg-slate-50 hover:text-slate-950'
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-amber-500" />
              )}

              <div className="flex items-center gap-3.5 min-w-0 pl-1">
                <Icon
                  size={19}
                  className={`shrink-0 transition-colors ${
                    active
                      ? 'text-amber-800'
                      : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span className="text-sm truncate">
                  {item.label}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                {hasBadge && (
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                    active
                      ? 'bg-amber-600 text-white'
                      : 'bg-amber-50 text-amber-800 border border-amber-100'
                  }`}>
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Bottom Footer Actions */}
      <div className="shrink-0 space-y-1 border-t border-slate-100 p-3 sm:p-4">
        <Link
          href="/"
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
        >
          <Globe size={15} className="text-slate-400" />
          <span>Public Website</span>
        </Link>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-medium text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-700"
        >
          <LogOut size={15} className="text-slate-400" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-dvh min-h-0 overflow-hidden bg-[#f7f7f4] font-sans text-slate-900">
      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-slate-950/35 backdrop-blur-[2px] lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <div className="hidden h-full border-r border-slate-200/80 lg:flex">{renderSidebar()}</div>

      {/* Mobile Slide-In Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 flex h-full transition-transform duration-300 ease-in-out lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {renderSidebar()}
      </div>

      {/* Main Content Viewport */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="flex min-h-[64px] shrink-0 items-center justify-between gap-3 border-b border-slate-200/80 bg-white px-3 shadow-[0_1px_8px_rgba(15,23,42,0.03)] sm:min-h-[72px] sm:px-6 xl:px-8">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-expanded={mobileOpen}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-50 transition-colors"
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>

            <div className="flex items-center gap-2 text-sm min-w-0">
              <span className="hidden text-xs text-slate-400 sm:inline">Admin Board</span>
              <span className="text-slate-200 hidden sm:inline">/</span>
              <span className="max-w-[55vw] truncate text-sm font-bold text-slate-900 sm:max-w-none">
                {NAV.find((n) => n.id === activeTab)?.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <DashboardNotifications />
            <span className="hidden items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900 sm:inline-flex">
              <ShieldCheck size={14} className="text-amber-700" />
              Admin
            </span>
          </div>
        </header>

        {/* Scrollable Content Workspace */}
        <main className="min-h-0 flex-1 overflow-y-auto bg-[#f7f7f4] p-3 sm:p-6 xl:p-8">
          <div className="mx-auto w-full max-w-[1600px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
