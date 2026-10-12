'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useMediaStore } from '@/lib/store';
import { ArrowRight, ChevronRight, LogOut, Menu, ShieldCheck, X } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { session, logout, isLoaded } = useMediaStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isGuest = !isLoaded || session.type === 'guest';
  const isSchool = isLoaded && session.type === 'school';
  const isAdmin = isLoaded && session.type === 'admin';

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
      setMobileOpen(false);
      router.push('/');
    } catch (error: unknown) {
      window.alert(error instanceof Error ? error.message : 'Unable to sign out.');
    }
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/competitions', label: 'Competitions' },
    { href: '/#about', label: 'About' },
    { href: '/rules', label: 'Rules' },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full px-3 pt-3 sm:px-6 bg-transparent">
        <div className="mx-auto w-full max-w-7xl rounded-[1.35rem] border border-slate-200/80 bg-white/95 shadow-[0_8px_28px_rgba(15,23,42,0.07)] backdrop-blur-xl">
          <div className="flex min-h-[68px] items-center justify-between gap-3 px-4 sm:px-6 xl:grid xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
            <Link href="/" className="group flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sara-navy p-1.5">
                <Image src="/Agradhi.png" alt="Agradhi Media Unit" width={27} height={27} className="object-contain" priority />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold tracking-tight text-slate-900">Agradhi Media</span>
                <span className="block text-[10px] font-medium text-slate-500">Saranath College</span>
              </span>
            </Link>

            <nav aria-label="Main navigation" className="hidden items-center gap-1 rounded-full border border-slate-100 bg-slate-50/80 p-1 xl:flex">
              {navLinks.map(({ href, label }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active ? 'page' : undefined}
                    className={`rounded-full px-3.5 py-2 text-xs font-semibold transition sm:px-4 sm:text-sm ${
                      active ? 'bg-white text-slate-950 shadow-sm ring-1 ring-slate-200/70' : 'text-slate-500 hover:bg-white/70 hover:text-slate-900'
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>

            <div className="hidden min-w-0 items-center justify-end gap-2 xl:flex">
              {isGuest && (
                <>
                  <Link href="/login" className="rounded-full px-3 py-2 text-xs font-semibold text-slate-600 transition hover:text-slate-950 sm:text-sm">
                    Teacher sign in
                  </Link>
                  <Link href="/register" className="group inline-flex min-h-10 items-center gap-2 rounded-full bg-sara-navy px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 sm:px-5 sm:text-sm">
                    Register school <ArrowRight size={14} className="text-amber-300 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </>
              )}
              {isSchool && session.school && (
                <>
                  <Link href="/dashboard" className="inline-flex max-w-52 items-center gap-2 rounded-full bg-sara-navy px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800 sm:text-sm">
                    <span className="truncate">School dashboard</span><ChevronRight size={14} className="shrink-0 text-amber-300" />
                  </Link>
                  <button type="button" onClick={() => void handleLogout()} aria-label="Sign out" title="Sign out" className="rounded-full p-2.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-700">
                    <LogOut size={16} />
                  </button>
                </>
              )}
              {isAdmin && (
                <>
                  <Link href="/admin" className="inline-flex items-center gap-2 rounded-full bg-sara-navy px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800 sm:text-sm">
                    <ShieldCheck size={15} className="text-amber-300" /> Admin dashboard
                  </Link>
                  <button type="button" onClick={() => void handleLogout()} aria-label="Sign out" title="Sign out" className="rounded-full p-2.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-700">
                    <LogOut size={16} />
                  </button>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-main-navigation"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:bg-slate-50 xl:hidden"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>

          {mobileOpen && (
            <div id="mobile-main-navigation" className="border-t border-slate-100 px-4 pb-4 pt-3 xl:hidden">
              <nav aria-label="Mobile navigation" className="grid gap-1">
                {navLinks.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    aria-current={pathname === href ? 'page' : undefined}
                    className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                      pathname === href ? 'bg-amber-50 text-amber-900' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {label}
                  </Link>
                ))}
              </nav>
              {isGuest && (
                <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="rounded-xl border border-slate-200 px-3 py-3 text-center text-xs font-semibold text-slate-700 hover:bg-slate-50">
                    Teacher sign in
                  </Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)} className="rounded-xl bg-sara-navy px-3 py-3 text-center text-xs font-semibold text-white hover:bg-slate-800">
                    Register school
                  </Link>
                </div>
              )}
              {isSchool && session.school && (
                <div className="mt-3 grid gap-2 border-t border-slate-100 pt-3">
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="rounded-xl bg-sara-navy px-4 py-3 text-center text-xs font-semibold text-white">
                    Open {session.school.name} dashboard
                  </Link>
                  <button type="button" onClick={() => void handleLogout()} className="rounded-xl px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50">
                    Sign out
                  </button>
                </div>
              )}
              {isAdmin && (
                <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                  <Link href="/admin" onClick={() => setMobileOpen(false)} className="rounded-xl bg-sara-navy px-3 py-3 text-center text-xs font-semibold text-white">
                    Admin dashboard
                  </Link>
                  <button type="button" onClick={() => void handleLogout()} className="rounded-xl border border-slate-200 px-3 py-3 text-xs font-semibold text-slate-700">
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>
    </>
  );
}
