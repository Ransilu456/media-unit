'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMediaStore } from '@/lib/store';
import {
  LayoutDashboard, Users, Trophy, FilePlus,
  LogOut, Menu, X,
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
}[] = [
  { id: 'overview',     label: 'Overview',         icon: LayoutDashboard },
  { id: 'students',     label: 'Student entries',  icon: Users },
  { id: 'competitions', label: 'Competitions',     icon: Trophy },
  { id: 'apply',        label: 'Add new entry',    icon: FilePlus },
];

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
    <aside className="w-64 shrink-0 flex flex-col h-full bg-white border-r border-slate-200">
      <div className="shrink-0 flex items-center justify-between px-5 h-16 border-b border-slate-200">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/Agradhi.png" alt="Agradhi Media" width={34} height={34} className="object-contain" />
          <span className="text-sm font-semibold tracking-tight text-slate-900">Agradhi Media</span>
        </Link>
        <button
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation"
          className="lg:hidden text-slate-500 hover:text-slate-900 p-1.5 rounded-md hover:bg-slate-100"
        >
          <X size={18} />
        </button>
      </div>
      <nav className="flex-1 p-3 space-y-1">

        {NAV.map(item => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { onTabChange(item.id); setMobileOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-colors ${
                active ? 'bg-slate-100 text-slate-950 font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
              }`}
            >
              <Icon size={17} className={active ? 'text-slate-900' : 'text-slate-400'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-slate-200 p-3">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-500 hover:text-red-700 hover:bg-red-50 transition-colors"
        >
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="dashboard-font h-screen overflow-hidden flex bg-white text-slate-800">

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/25 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className="hidden lg:flex h-full">
        {renderSidebar()}
      </div>

      <div className={`
        fixed inset-y-0 left-0 z-40 flex h-full
        transition-transform duration-300 ease-in-out lg:hidden
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {renderSidebar()}
      </div>

      {/* ── MAIN AREA ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="shrink-0 bg-white border-b border-slate-200 px-4 sm:px-6 h-14 flex items-center gap-3">
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
            <span className="font-semibold text-slate-800">{NAV.find(n => n.id === activeTab)?.label}</span>
          </div>

        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto bg-slate-50/70 p-4 sm:p-6 lg:p-8 min-h-0">
          {children}
        </main>
      </div>
    </div>
  );
}
