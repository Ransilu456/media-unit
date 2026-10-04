'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useMediaStore } from '@/lib/store';
import { Bell, LogOut, Menu, X, ShieldCheck } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { session, logout, isLoaded } = useMediaStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isHome = pathname === '/';
  const isGuest = !isLoaded || session.type === 'guest';
  const isSchool = isLoaded && session.type === 'school';
  const isAdmin  = isLoaded && session.type === 'admin';

  const notices = [
    'Inter-School Media Competitions 2026 submissions are now open',
    'Registration deadline: November 15, 2026',
    'Categories: News Presenting, Radio, Photography, Announcing & more',
    'Grand Assembly & Awards Ceremony at Saranath College Auditorium',
    'Inter-School Media Competitions 2026 submissions are now open',
    'Registration deadline: November 15, 2026',
    'Categories: News Presenting, Radio, Photography, Announcing & more',
    'Grand Assembly & Awards Ceremony at Saranath College Auditorium',
  ];

  return (
    <>
      {/* Thin top info bar */}
      <div className="bg-slate-900 text-slate-400 text-xs py-1.5 border-b border-slate-800 hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <span>agradhimedia@saranath.edu.lk</span>
          <span>Saranath College · Kuliyapitiya</span>
        </div>
      </div>

      {/* Main header — compact */}
      <header className="bg-white sticky top-0 z-50 border-t-4 border-amber-600 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Brand */}
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <div className="w-9 h-9 rounded-full bg-slate-900 border-2 border-amber-500 p-0.5 shrink-0 transition-transform group-hover:scale-105">
                <Image src="/Agradhi.png" alt="Agradhi" width={32} height={32} className="object-contain w-full h-full" priority />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-base md:text-lg font-serif font-semibold text-slate-900 group-hover:text-amber-700 transition-colors">
                  Agradhi Media Unit
                </span>
                <span className="text-[9px] font-medium text-amber-600 uppercase tracking-widest hidden sm:block">
                  Saranath College
                </span>
              </div>
            </Link>

            {/* Desktop nav — dynamic per role */}
            <nav className="hidden lg:flex items-center gap-1">

              {/* Common links always visible */}
              <NavLink href="/" label="Home" active={pathname === '/'} />
              <NavLink href="/competitions" label="Competitions" active={pathname === '/competitions'} />

              {/* Guest: show Apply & auth buttons */}
              {isGuest && (
                <>
                  <NavLink href="/apply" label="Apply for Competition" active={pathname === '/apply'} highlight />
                  <div className="ml-3 flex items-center gap-2 pl-3 border-l border-slate-200">
                    <Link href="/login" className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-amber-700 transition-colors">
                      Teacher Login
                    </Link>
                    <Link href="/register" className="px-4 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded hover:bg-slate-800 transition-colors border-b-2 border-amber-600">
                      Register School
                    </Link>
                  </div>
                </>
              )}

              {/* School teacher logged in */}
              {isSchool && session.school && (
                <>
                  <NavLink href="/apply" label="Apply for Competition" active={pathname === '/apply'} highlight />
                  <div className="ml-3 flex items-center gap-2 pl-3 border-l border-slate-200">
                    <span className="text-xs text-slate-500 font-medium truncate max-w-[120px]" title={session.school.name}>
                      {session.school.name}
                    </span>
                    <Link href="/dashboard" className="px-4 py-1.5 bg-amber-600 text-white text-xs font-semibold rounded hover:bg-amber-500 transition-colors">
                      My Dashboard
                    </Link>
                    <button onClick={logout} title="Sign Out" className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
                      <LogOut size={14} />
                    </button>
                  </div>
                </>
              )}

              {/* Admin logged in */}
              {isAdmin && (
                <div className="ml-3 flex items-center gap-2 pl-3 border-l border-slate-200">
                  <span className="text-xs bg-slate-900 text-amber-400 px-2.5 py-1 rounded font-medium flex items-center gap-1">
                    <ShieldCheck size={12} /> Admin
                  </span>
                  <Link href="/admin" className="px-4 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded hover:bg-slate-800 transition-colors border-b-2 border-amber-600">
                    Console
                  </Link>
                  <button onClick={logout} title="Sign Out" className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
                    <LogOut size={14} />
                  </button>
                </div>
              )}
            </nav>

            {/* Mobile hamburger */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-slate-600 hover:text-slate-900">
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Scrolling notice ticker — homepage only */}
      {isHome && (
        <div className="bg-amber-50 border-b border-amber-100 py-2 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-3">
            <span className="flex items-center gap-1 text-[10px] font-semibold bg-amber-600 text-white px-2 py-0.5 rounded shrink-0 uppercase tracking-wide">
              <Bell className="w-2.5 h-2.5" /> Latest
            </span>
            <div className="marquee-container w-full">
              <div className="marquee-content text-xs font-medium text-slate-700 flex gap-8">
                {notices.map((n, i) => (
                  <span key={i} className="shrink-0">
                    {n}
                    {i < notices.length - 1 && <span className="text-amber-400 mx-3">•</span>}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-5 space-y-2 shadow-xl z-40 relative">
          <MobileLink href="/" label="Home" active={pathname === '/'} onClick={() => setMobileOpen(false)} />
          <MobileLink href="/competitions" label="Competitions" active={pathname === '/competitions'} onClick={() => setMobileOpen(false)} />
          <MobileLink href="/apply" label="Apply for Competition" active={pathname === '/apply'} onClick={() => setMobileOpen(false)} highlight />

          {isSchool && session.school && (
            <MobileLink href="/dashboard" label={`${session.school.name} — Dashboard`} active={pathname === '/dashboard'} onClick={() => setMobileOpen(false)} />
          )}
          {isAdmin && (
            <MobileLink href="/admin" label="Admin Console" active={pathname === '/admin'} onClick={() => setMobileOpen(false)} />
          )}

          <div className="pt-3 border-t border-slate-100 flex gap-2">
            {isGuest ? (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2 rounded border border-slate-200 text-xs font-semibold text-slate-700">
                  Teacher Login
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2 rounded bg-amber-600 text-white text-xs font-semibold">
                  Register School
                </Link>
              </>
            ) : (
              <button onClick={() => { logout(); setMobileOpen(false); }} className="flex-1 py-2 rounded border border-slate-200 text-xs font-semibold text-red-600">
                Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function NavLink({ href, label, active, highlight }: { href: string; label: string; active: boolean; highlight?: boolean }) {
  return (
    <Link
      href={href}
      className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
        active
          ? 'bg-amber-50 text-amber-700 font-semibold'
          : highlight
          ? 'text-amber-700 hover:bg-amber-50 font-semibold'
          : 'text-slate-600 hover:text-amber-700 hover:bg-slate-50'
      }`}
    >
      {label}
    </Link>
  );
}

function MobileLink({ href, label, active, onClick, highlight }: { href: string; label: string; active: boolean; onClick: () => void; highlight?: boolean }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        active ? 'bg-amber-50 text-amber-800 font-semibold' :
        highlight ? 'text-amber-700 bg-amber-50/50' :
        'text-slate-700 hover:bg-slate-50'
      }`}
    >
      {label}
    </Link>
  );
}
