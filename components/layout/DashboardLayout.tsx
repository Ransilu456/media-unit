'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMediaStore } from '@/lib/store';
import {
  LayoutDashboard, Trophy, Users, FileText,
  LogOut, Menu, X, ChevronRight, Bell, ShieldCheck,
  School,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const { session, logout, isLoaded } = useMediaStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAdmin = isLoaded && session.type === 'admin';
  const isSchool = isLoaded && session.type === 'school';

  // Redirect if not authenticated
  React.useEffect(() => {
    if (isLoaded && session.type === 'guest') {
      router.push('/login');
    }
  }, [isLoaded, session.type, router]);

  const adminLinks = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Review Submissions', href: '/admin', icon: FileText },
    { label: 'Manage Competitions', href: '/admin', icon: Trophy },
    { label: 'Registered Schools', href: '/admin', icon: School },
  ];

  const schoolLinks = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Student Entries', href: '/dashboard', icon: Users },
    { label: 'Competitions', href: '/dashboard', icon: Trophy },
    { label: 'Reports', href: '/dashboard', icon: FileText },
  ];

  const links = isAdmin ? adminLinks : schoolLinks;
  const portalName = isAdmin
    ? 'Admin Console'
    : session.school?.name || 'School Portal';
  const portalSub = isAdmin
    ? 'Agradhi Executive Board'
    : `Badge: ${session.school?.badgeCode || '—'}`;

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-slate-500 text-sm">Loading...</div>
      </div>
    );
  }

  if (session.type === 'guest') return null;

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-60 bg-slate-900 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Sidebar brand */}
        <div className="p-4 border-b border-slate-800">
          <Link href="/" className="flex items-center gap-2.5 group mb-3">
            <div className="w-8 h-8 rounded-full bg-slate-950 border border-amber-500 p-0.5 shrink-0">
              <Image src="/Agradhi.png" alt="Agradhi" width={28} height={28} className="object-contain w-full h-full" />
            </div>
            <span className="text-xs text-slate-400 group-hover:text-white transition-colors">← Main Site</span>
          </Link>
          <div className="flex items-center gap-2">
            {isAdmin ? (
              <div className="w-8 h-8 rounded-lg bg-amber-600/20 border border-amber-600/30 flex items-center justify-center shrink-0">
                <ShieldCheck size={14} className="text-amber-400" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {portalName[0]}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white leading-tight truncate" title={portalName}>
                {portalName}
              </p>
              <p className="text-[10px] text-amber-500 font-mono mt-0.5 truncate">{portalSub}</p>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 px-3 py-2">
            {isAdmin ? 'Management' : 'My School'}
          </p>
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors group"
              >
                <Icon size={15} className="shrink-0" />
                <span>{link.label}</span>
                <ChevronRight size={12} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="p-3 border-t border-slate-800 space-y-1">
          <Link
            href="/competitions"
            className="flex items-center gap-2 px-3 py-2 text-xs text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Trophy size={13} /> View competitions
          </Link>
          <button
            onClick={async () => {
              try {
                await logout();
                router.push('/');
              } catch (error: unknown) {
                window.alert(error instanceof Error ? error.message : 'Unable to sign out.');
              }
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut size={13} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center gap-4 sticky top-0 z-20 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden -ml-1 p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          >
            <Menu size={20} />
          </button>

          <div className="min-w-0">
            <h2 className="text-sm font-serif font-bold text-slate-900 leading-tight truncate">
              {isAdmin ? 'Agradhi Executive Console' : `${session.school?.name || 'School'} — Portal`}
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">
              {isAdmin
                ? 'Saranath College · Adjudication Board'
                : `District: ${session.school?.district || '—'} · ${session.school?.province || '—'}`}
            </p>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button className="relative p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-500" />
            </button>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
              isAdmin ? 'bg-slate-900 text-amber-400 border-amber-600' : 'bg-amber-600 text-white border-amber-500'
            }`}>
              {isAdmin ? 'A' : (session.school?.name?.[0] || 'S')}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
