'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMediaStore } from '@/lib/store';
import { DashboardNotifications } from './DashboardNotifications';
import { LayoutDashboard, Users, Trophy, FilePlus, LogOut, Menu, X, Globe, Search, ChevronDown } from 'lucide-react';

export type SchoolTab = 'overview' | 'students' | 'competitions' | 'apply';

interface SchoolPortalLayoutProps {
  children: React.ReactNode;
  activeTab: SchoolTab;
  onTabChange: (tab: SchoolTab) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
}

const NAV: { id: SchoolTab; label: string; icon: React.ElementType; description: string; }[] = [
  { id: 'overview',     label: 'Overview',         icon: LayoutDashboard, description: 'Dashboard summary' },
  { id: 'students',     label: 'Student Entries',  icon: Users,           description: 'Your submissions' },
  { id: 'competitions', label: 'All Competitions', icon: Trophy,          description: 'Browse open tracks' },
  { id: 'apply',        label: 'Submit New Entry', icon: FilePlus,        description: 'Add a new entry' },
];

export function SchoolPortalLayout({
  children,
  activeTab,
  onTabChange,
  searchQuery,
  onSearchQueryChange,
}: SchoolPortalLayoutProps) {
  const router = useRouter();
  const {
    session,
    logout,
    submissions,
    competitions,
    isLoaded,
    isSubmissionsLoaded,
    isCompetitionsLoaded,
  } = useMediaStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const school = session.school;

  const mySubmissionsCount = school ? submissions.filter((s) => s.schoolId === school.id).length : 0;
  const openCompsCount = competitions.filter((c) => c.status === 'open').length;
  const activeNavigation = NAV.find((item) => item.id === activeTab) ?? NAV[0];

  useEffect(() => {
    if (!mobileOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [mobileOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error: unknown) {
      window.alert(error instanceof Error ? error.message : 'Unable to sign out.');
    }
  };

  const renderSidebar = () => (
    <aside className="flex h-full w-[min(20rem,calc(100vw-1rem))] min-h-0 shrink-0 select-none flex-col bg-white lg:w-65 xl:w-68">
      {/* Brand Header */}
      <div className="flex h-18 shrink-0 items-center justify-between border-b border-slate-100 px-4 sm:px-5">
        <Link href="/" className="flex items-center gap-3.5 group min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-sara-navy p-1.5 flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm shrink-0">
            <Image src="/Agradhi.png" alt="Agradhi Media" width={30} height={30} className="object-contain" />
          </div>
          <div className="min-w-0">
            <span className="text-base font-bold text-slate-900 tracking-tight block truncate">Agradhi</span>
            <span className="text-[11px] text-slate-400 font-medium block">Media Unit · 2026</span>
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

      <nav aria-label="School dashboard" className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain px-3 py-4">
        <div className="px-3 pb-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Workspace</p>
          <p className="mt-1 text-xs text-slate-500">Manage your school activity</p>
        </div>

        {NAV.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          const isApply = item.id === 'apply';

          return (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                setMobileOpen(false);
              }}
              aria-current={active ? 'page' : undefined}
              title={item.description}
              className={`relative w-full flex min-h-12 items-center justify-between rounded-xl border px-3 py-2.5 text-left transition-all group ${
                active
                  ? isApply
                    ? 'border-sara-navy bg-sara-navy text-white font-semibold shadow-sm'
                      : 'border-amber-200 bg-amber-50 text-slate-950 font-semibold shadow-sm'
                  : isApply
                  ? 'border-transparent bg-sara-navy text-white shadow-[0_10px_22px_rgba(15,23,42,0.15)] hover:bg-slate-800'
                  : 'border-transparent text-slate-600 hover:border-slate-100 hover:bg-slate-50 hover:text-slate-950'
              }`}
            >
              {active && (
                <span className={`absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full ${isApply ? 'bg-amber-300' : 'bg-amber-500'}`} />
              )}

              <div className="flex min-w-0 items-center gap-3 pl-1">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
                  active ? 'bg-white text-amber-800 shadow-sm' : isApply ? 'bg-white/10 text-amber-300' : 'bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-slate-700'
                }`}>
                <Icon
                  size={17}
                  className={`shrink-0 transition-colors ${
                    active
                      ? 'text-amber-800'
                      : isApply
                      ? 'text-amber-300'
                      : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{item.label}</span>
                  <span className={`mt-0.5 hidden truncate text-[10px] 2xl:block ${active && isApply ? 'text-white/65' : 'text-slate-400'}`}>{item.description}</span>
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                {item.id === 'students' && (!isLoaded || !isSubmissionsLoaded) && (
                  <span aria-label="Loading entry count" className="h-5 w-8 animate-pulse rounded-full bg-slate-200/80" />
                )}
                {item.id === 'students' && isLoaded && isSubmissionsLoaded && mySubmissionsCount > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                    active ? 'bg-white text-amber-900' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {mySubmissionsCount}
                  </span>
                )}
                {item.id === 'competitions' && (!isLoaded || !isCompetitionsLoaded) && (
                  <span aria-label="Loading competition count" className="h-5 w-8 animate-pulse rounded-full bg-emerald-100/80" />
                )}
                {item.id === 'competitions' && isLoaded && isCompetitionsLoaded && openCompsCount > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                    active ? 'bg-white text-emerald-800' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                  }`}>
                    {openCompsCount}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-slate-100 p-3 sm:p-4">
        {school ? (
          <div className="mb-3 flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sara-navy text-xs font-bold text-amber-300">
              {school.name.charAt(0).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[11px] font-bold text-slate-800">{school.name}</span>
              <span className="mt-0.5 block truncate text-[9px] text-slate-500">{school.district} · {school.status === 'active' ? 'Active' : 'Waiting for approval'}</span>
            </span>
            <span className={`h-2 w-2 shrink-0 rounded-full ${school.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          </div>
        ) : !isLoaded ? (
          <div aria-hidden="true" className="mb-3 flex animate-pulse items-center gap-3 rounded-2xl bg-slate-50 p-3">
            <span className="h-9 w-9 shrink-0 rounded-xl bg-slate-200" />
            <span className="min-w-0 flex-1 space-y-2">
              <span className="block h-3 w-3/4 rounded bg-slate-200" />
              <span className="block h-2 w-1/2 rounded bg-slate-100" />
            </span>
          </div>
        ) : null}
        <Link
          href="/"
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
        >
          <Globe size={15} className="text-slate-400" />
          <span>Public Website</span>
        </Link>
        <button
          type="button"
          onClick={() => void handleLogout()}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-xs font-medium text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-700"
        >
          <LogOut size={15} className="text-slate-400" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-dvh min-h-0 overflow-hidden bg-[#f7f7f4] font-sans text-slate-900">
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

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 flex h-full transition-transform duration-300 ease-in-out lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {renderSidebar()}
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="z-20 flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 bg-white/95 px-3 py-3 shadow-[0_1px_8px_rgba(15,23,42,0.03)] backdrop-blur sm:px-6 sm:py-0 sm:min-h-18 xl:px-8">
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

            <h1 className="max-w-[42vw] truncate text-sm font-semibold text-slate-700">{activeNavigation.label}</h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <label className="relative hidden md:block w-52 lg:w-72 xl:w-96">
              <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => onSearchQueryChange(event.target.value)}
                onFocus={() => onTabChange('students')}
                placeholder="Search entries..."
                aria-label="Search student entries"
                className="w-full rounded-full border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-xs text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
              />
            </label>
            <DashboardNotifications />
            {school && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen((open) => !open)}
                  aria-expanded={profileOpen}
                  aria-label="Open school profile menu"
                  className="flex items-center gap-2 rounded-full p-1.5 pr-2 sm:pr-3 transition-colors hover:bg-slate-50"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-amber-200 bg-amber-100 text-sm font-bold text-amber-900">
                    {school.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="hidden max-w-32 text-left md:block">
                    <span className="block truncate text-xs font-semibold text-slate-800">{school.name}</span>
                    <span className="block text-[10px] text-slate-400">{school.status === 'active' ? 'Active school' : 'Pending approval'}</span>
                  </span>
                  <ChevronDown size={14} className="hidden text-slate-400 sm:block" />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
                    <p className="truncate text-sm font-semibold text-slate-900">{school.name}</p>
                    <p className="mt-1 truncate text-xs text-slate-500">{school.email}</p>
                    <p className="mt-3 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
                      Badge <span className="font-mono font-bold text-slate-700">{school.badgeCode}</span>
                    </p>
                    <button
                      type="button"
                      onClick={() => void handleLogout()}
                      className="mt-3 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-50"
                    >
                      <LogOut size={15} />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          <label className="relative block w-full md:hidden">
            <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => onSearchQueryChange(event.target.value)}
              onFocus={() => onTabChange('students')}
              placeholder="Search student entries"
              aria-label="Search student entries"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-xs text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
            />
          </label>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto bg-[#f7f7f4] p-3 sm:p-6 xl:p-8">
          <div className="mx-auto w-full max-w-400">{children}</div>
        </main>
      </div>
    </div>
  );
}
