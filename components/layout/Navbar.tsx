'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useMediaStore } from '@/lib/store';
import { Phone, Mail, LogOut, Menu, X, ShieldCheck, Bell } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { session, logout, isLoaded } = useMediaStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Competitions', href: '/competitions' },
    { label: 'School Portal', href: '/dashboard' },
    { label: 'Admin Panel', href: '/admin' },
  ];

  const notices = [
    'Inter-School Media Competitions 2026 submissions are officially open',
    'Delegation registration deadline: November 15th, 2026',
    'Short Film, Photography, Announcing, Radio Play & Graphic Design tracks open',
    'Grand Assembly & Awards Ceremony at Saranath College Auditorium',
    'Inter-School Media Competitions 2026 submissions are officially open',
    'Delegation registration deadline: November 15th, 2026',
    'Short Film, Photography, Announcing, Radio Play & Graphic Design tracks open',
    'Grand Assembly & Awards Ceremony at Saranath College Auditorium',
  ];

  return (
    <>
      <div className="bg-slate-900 text-slate-300 text-xs py-2 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" aria-hidden="true" /> +94 11 234 5678
            </span>
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3" aria-hidden="true" /> agradhimedia@saranath.edu.lk
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">Saranath College</span>
          </div>
        </div>
      </div>

      <header className="bg-white sticky top-0 z-50 border-t-4 border-amber-600 transition-all duration-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 md:h-24">

            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-4 group">
              <div className="relative">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden bg-slate-900 border-2 border-amber-500 shadow-md transition-transform group-hover:scale-105 p-1 shrink-0">
                  <Image
                    src="/Agradhi.png"
                    alt="Agradhi Media Unit Crest"
                    width={56}
                    height={56}
                    className="object-contain w-full h-full"
                    priority
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl md:text-3xl font-semibold text-slate-900 font-serif leading-none tracking-tight group-hover:text-amber-700 transition-colors">
                  Agradhi Media Unit
                </span>
                <span className="text-[10px] md:text-xs font-medium text-amber-600 uppercase tracking-widest mt-1">
                  Saranath College • Est. 1883
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              <div className="flex items-center gap-1 mr-4">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'text-amber-700 font-semibold bg-amber-50'
                          : 'text-slate-700 hover:text-amber-700 rounded-md transition-colors'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>

              {/* Auth Section */}
              {isLoaded && session.type === 'school' && session.school ? (
                <div className="flex items-center gap-2 pl-2">
                  <span className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 rounded font-medium">
                    {session.school.name}
                  </span>
                  <Link
                    href="/dashboard"
                    className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded hover:bg-slate-800 transition-colors border-b-2 border-amber-600"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={logout}
                    title="Sign Out"
                    className="text-slate-400 hover:text-red-600 p-2 rounded"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              ) : isLoaded && session.type === 'admin' ? (
                <div className="flex items-center gap-2 pl-2">
                  <span className="text-xs bg-slate-900 text-amber-400 px-3 py-1.5 rounded font-medium flex items-center gap-1">
                    <ShieldCheck size={14} /> Admin Board
                  </span>
                  <Link
                    href="/admin"
                    className="px-4 py-2 bg-amber-600 text-white text-xs font-semibold rounded hover:bg-amber-500 transition-colors"
                  >
                    Console
                  </Link>
                  <button
                    onClick={logout}
                    title="Sign Out"
                    className="text-slate-400 hover:text-red-600 p-2 rounded"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-amber-700"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="ml-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded hover:bg-slate-800 transition-colors border-b-2 border-amber-600 shadow-sm"
                  >
                    Register School
                  </Link>
                </div>
              )}
            </nav>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900"
            >
              {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </header>

      <div className="bg-amber-50 border-b border-amber-100 py-2.5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-[10px] font-semibold bg-amber-600 text-white px-2 py-0.5 rounded border border-amber-700/20 shrink-0 uppercase tracking-wide shadow-sm">
            <Bell className="w-2.5 h-2.5" aria-hidden="true" /> Latest
          </span>
          <div className="marquee-container w-full">
            <div className="marquee-content text-xs md:text-sm font-medium text-slate-800 flex gap-8">
              {notices.map((notice, i) => (
                <span key={i} className="shrink-0">
                  {notice}
                  {i < notices.length - 1 && (
                    <span className="text-amber-400 ml-4 mr-2">•</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-6 space-y-3 shadow-xl">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2.5 rounded-lg text-sm font-medium ${
                pathname === link.href
                  ? 'bg-amber-50 text-amber-800 font-semibold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-4 border-t border-slate-100 flex gap-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 text-center py-2.5 rounded border border-slate-300 text-xs font-semibold text-slate-700"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 text-center py-2.5 rounded bg-amber-600 text-white text-xs font-semibold shadow-sm"
            >
              Register School
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
