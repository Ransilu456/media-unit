'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useMediaStore } from '@/lib/store';
import {
  LogOut,
  Menu,
  X,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { session, logout, isLoaded } = useMediaStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isGuest = !isLoaded || session.type === 'guest';
  const isSchool = isLoaded && session.type === 'school';
  const isAdmin = isLoaded && session.type === 'admin';

  const handleLogout = async () => {
    try {
      await logout();
      setMobileOpen(false);
      router.push('/');
    } catch (error: unknown) {
      window.alert(error instanceof Error ? error.message : 'Unable to sign out.');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-slate-100 transition-all">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            
            {/* Logo and Brand */}
            <Link href="/" className="flex items-center gap-3.5 group">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-50 border border-slate-200/80 p-1.5 flex items-center justify-center transition-transform group-hover:scale-105">
                <Image
                  src="/Agradhi.png"
                  alt="Agradhi Media Unit"
                  width={30}
                  height={30}
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-semibold text-slate-900 tracking-tight">
                  Agradhi Media Unit
                </span>
                <span className="text-xs text-slate-400">
                  Saranath College
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav aria-label="Main navigation" className="hidden items-center gap-8 md:flex">
              <Link
                href="/"
                className={`text-sm font-medium transition-colors ${
                  pathname === '/'
                    ? 'text-slate-900 font-semibold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Home
              </Link>

              <Link
                href="/competitions"
                className={`text-sm font-medium transition-colors ${
                  pathname === '/competitions'
                    ? 'text-slate-900 font-semibold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Competitions
              </Link>

              <Link
                href="/rules"
                className={`text-sm font-medium transition-colors ${
                  pathname === '/rules'
                    ? 'text-slate-900 font-semibold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Rules
              </Link>

              {/* Guest Actions */}
              {isGuest && (
                <div className="flex items-center gap-4 pl-4 border-l border-slate-100">
                  <Link
                    href="/login"
                    className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    Teacher Login
                  </Link>

                  <Link
                    href="/register"
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium transition-colors shadow-sm"
                  >
                    Register School
                  </Link>
                </div>
              )}

              {/* School Session */}
              {isSchool && session.school && (
                <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs font-semibold text-slate-800 transition-colors"
                  >
                    <span className="truncate max-w-[120px]">{session.school.name}</span>
                    <ChevronRight size={13} className="text-slate-400" />
                  </Link>

                  <button
                    onClick={() => void handleLogout()}
                    title="Sign out"
                    className="p-2 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <LogOut size={15} />
                  </button>
                </div>
              )}

              {/* Admin Session */}
              {isAdmin && (
                <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
                  >
                    <ShieldCheck size={14} />
                    <span>Admin Board</span>
                  </Link>

                  <button
                    onClick={() => void handleLogout()}
                    title="Sign out"
                    className="p-2 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <LogOut size={15} />
                  </button>
                </div>
              )}
            </nav>

            {/* Mobile menu trigger */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                type="button"
                onClick={() => setMobileOpen((open) => !open)}
                aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden bg-slate-900/20 backdrop-blur-xs flex flex-col justify-start">
          <div className="bg-white border-b border-slate-200 p-6 space-y-4 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-400">Navigation</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1 rounded-md text-slate-500 hover:bg-slate-50"
              >
                <X size={18} />
              </button>
            </div>

            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className={`block py-2 text-sm font-medium ${pathname === '/' ? 'text-slate-900 font-bold' : 'text-slate-600'}`}
            >
              Home
            </Link>

            <Link
              href="/competitions"
              onClick={() => setMobileOpen(false)}
              className={`block py-2 text-sm font-medium ${pathname === '/competitions' ? 'text-slate-900 font-bold' : 'text-slate-600'}`}
            >
              Competitions
            </Link>

            <Link
              href="/rules"
              onClick={() => setMobileOpen(false)}
              className={`block py-2 text-sm font-medium ${pathname === '/rules' ? 'text-slate-900 font-bold' : 'text-slate-600'}`}
            >
              Rules &amp; Regulations
            </Link>

            {isSchool && session.school && (
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full py-2.5 text-center rounded-xl bg-slate-900 text-white text-xs font-semibold"
                >
                  Go to {session.school.name} Dashboard
                </Link>
                <button
                  onClick={() => void handleLogout()}
                  className="w-full py-2 text-center text-xs text-red-600"
                >
                  Sign Out
                </button>
              </div>
            )}

            {isGuest && (
              <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-3">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold text-center hover:bg-slate-50"
                >
                  Teacher Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold text-center hover:bg-slate-800"
                >
                  Register School
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
