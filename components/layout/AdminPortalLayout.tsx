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
  { id: 'submissions',  label: 'Submissions',   icon: FileText, description: 'Review entries' },
  { id: 'competitions', label: 'Competitions',  icon: Trophy,   description: 'Competition settings' },
  { id: 'schools',      label: 'Schools',       icon: School,   description: 'School accounts' },
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
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-orange-100 bg-orange-50 p-2 transition-colors group-hover:bg-orange-100">
            <Image src="/Agradhi.png" alt="Agradhi Media" width={26} height={26} className="object-contain" />
          </div>
          <div className="min-w-0">
            <span className="text-sm font-bold text-slate-900 tracking-tight block truncate">Agradhi Media Unit</span>
            <span className="text-[11px] text-slate-400 font-medium block">Admin</span>
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

      <nav aria-label="Admin dashboard" className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain px-3 py-4">
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
                  ? 'border-sky-100 bg-sky-50 text-sky-950 font-semibold'
                  : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-950'
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-orange-600" />
              )}

              <div className="flex items-center gap-3.5 min-w-0 pl-1">
                <Icon
                  size={19}
                  className={`shrink-0 transition-colors ${
                    active
                      ? 'text-sky-700'
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
                      ? 'bg-sky-700 text-white'
                      : 'border border-sky-100 bg-sky-50 text-sky-800'
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
    <div className="flex h-dvh min-h-0 overflow-hidden bg-[#f5f8fc] font-sans text-slate-900">
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
      <div className="hidden h-full border-r border-slate-200/80 bg-white lg:flex">{renderSidebar()}</div>

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
        <header className="flex min-h-[60px] shrink-0 items-center justify-between gap-3 border-b border-sky-100/80 bg-white px-3 shadow-[0_4px_18px_rgba(59,130,246,0.05)] sm:min-h-[64px] sm:px-6 xl:px-8">
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
              <span className="max-w-[55vw] truncate text-sm font-bold text-slate-900 sm:max-w-none">
                {NAV.find((n) => n.id === activeTab)?.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <DashboardNotifications />
          </div>
        </header>

        {/* Scrollable Content Workspace */}
        <main className="min-h-0 flex-1 overflow-y-auto bg-[#f5f8fc] p-3 sm:p-5 xl:p-7">
          <div className="mx-auto w-full max-w-[1440px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
