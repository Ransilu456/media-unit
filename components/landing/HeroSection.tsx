'use client';

import React from 'react';
import Link from 'next/link';
import { useMediaStore } from '@/lib/store';
import { ArrowRight, Trophy } from 'lucide-react';

export function HeroSection() {
  const { session, schools, competitions } = useMediaStore();

  return (
    <div>
      {/* Hero Section — exactly matching sara-by-keshan.netlify.app */}
      <section className="relative h-[600px] bg-slate-900 flex items-center overflow-hidden">
        {/* Background image + overlay layers — same as reference */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop"
            alt="Saranath College Campus"
            className="w-full h-full object-cover opacity-30"
            style={{ animation: 'pulse 10s ease-in-out infinite' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="max-w-3xl border-l-4 border-amber-500 pl-8 md:pl-10 py-2">

            {/* Animated dot badge */}
            <div className="flex items-center gap-2 mb-4">
              <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-amber-400 font-medium tracking-wider uppercase text-xs md:text-sm">
                Welcome to Agradhi Media Unit
              </span>
            </div>

            {/* Main Headline */}
            <h2 className="text-5xl md:text-7xl font-serif font-semibold text-white leading-[1.1] mb-6 tracking-tight">
              A Legacy of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
                Cinematic Excellence
              </span>
            </h2>

            {/* Subtitle */}
            <p className="text-lg text-slate-300 mb-10 leading-relaxed max-w-xl font-light">
              Nurturing the next generation of young broadcasters, cinematographers, and visual artists across Sri Lanka. Enter the 8th Annual All-Island Media Assembly.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              {session.type === 'school' && session.school ? (
                <Link
                  href="/dashboard"
                  className="px-8 py-3.5 bg-amber-600 text-white text-sm font-medium rounded hover:bg-amber-500 transition-all shadow-lg shadow-amber-900/20 flex items-center justify-center gap-2"
                >
                  <span>Go to {session.school.name} Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="px-8 py-3.5 bg-amber-600 text-white text-sm font-medium rounded hover:bg-amber-500 transition-all shadow-lg shadow-amber-900/20 flex items-center justify-center gap-2"
                  >
                    <span>Register Outer School</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/competitions"
                    className="px-8 py-3.5 bg-white/5 backdrop-blur-sm border border-white/20 text-white text-sm font-medium rounded hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trophy className="w-[18px] text-amber-400" />
                    Browse Competitions
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Floating Stats Banner — matches sara-by-keshan exactly */}
      <section className="py-12 bg-white border-b border-slate-100 relative z-20 -mt-8 mx-4 md:mx-auto max-w-7xl rounded-xl shadow-xl shadow-slate-200/50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 px-6">
          <div className="text-center group cursor-default">
            <div className="text-3xl md:text-4xl font-serif font-semibold text-slate-900 mb-1 group-hover:text-amber-600 transition-colors">
              98%
            </div>
            <div className="text-[10px] md:text-xs font-semibold text-slate-400 uppercase tracking-widest">
              Audit Accuracy
            </div>
          </div>

          <div className="text-center group cursor-default border-l border-slate-100">
            <div className="text-3xl md:text-4xl font-serif font-semibold text-slate-900 mb-1 group-hover:text-amber-600 transition-colors">
              {schools.length || 18}+
            </div>
            <div className="text-[10px] md:text-xs font-semibold text-slate-400 uppercase tracking-widest">
              Outer Schools
            </div>
          </div>

          <div className="text-center group cursor-default border-l border-slate-100">
            <div className="text-3xl md:text-4xl font-serif font-semibold text-slate-900 mb-1 group-hover:text-amber-600 transition-colors">
              {competitions.length || 5}
            </div>
            <div className="text-[10px] md:text-xs font-semibold text-slate-400 uppercase tracking-widest">
              Contest Tracks
            </div>
          </div>

          <div className="text-center group cursor-default border-l border-slate-100">
            <div className="text-3xl md:text-4xl font-serif font-semibold text-slate-900 mb-1 group-hover:text-amber-600 transition-colors">
              40+
            </div>
            <div className="text-[10px] md:text-xs font-semibold text-slate-400 uppercase tracking-widest">
              Laurels & Shields
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
