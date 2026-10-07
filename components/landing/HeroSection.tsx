'use client';

import React from 'react';
import Link from 'next/link';
import { useMediaStore } from '@/lib/store';
import {
  ArrowRight,
  Trophy,
  Film,
  Camera,
  Mic,
  Radio,
  FileCheck2,
  CheckCircle2,
} from 'lucide-react';

export function HeroSection() {
  const { session, competitions } = useMediaStore();
  const openCount = competitions.filter((c) => c.status === 'open').length;

  const disciplines = [
    {
      title: 'Short Film & Cinema',
      category: 'Cinematography',
      desc: 'Narrative short films and investigative documentaries judged on direction, lighting, and pacing.',
      icon: Film,
      badge: '4K / HD Video',
      color: 'text-amber-700 bg-amber-50 border-amber-200/60',
    },
    {
      title: 'News Reading & Announcing',
      category: 'Broadcasting',
      desc: 'Formal news delivery in Sinhala and English evaluated on diction, poise, and broadcast standards.',
      icon: Mic,
      badge: 'Sinhala & English',
      color: 'text-blue-700 bg-blue-50 border-blue-200/60',
    },
    {
      title: 'Press & Documentary Photography',
      category: 'Visual Arts',
      desc: 'Single-frame storytelling capturing cultural heritage, nature, sports, and street photojournalism.',
      icon: Camera,
      badge: 'Digital Stills',
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200/60',
    },
    {
      title: 'Radio Play & Sound Production',
      category: 'Audio Arts',
      desc: 'SLBC gold-standard acoustic audio plays, voice modulation, and binaural sound design.',
      icon: Radio,
      badge: 'Acoustic Audio',
      color: 'text-purple-700 bg-purple-50 border-purple-200/60',
    },
  ];

  return (
    <section className="relative bg-white pt-16 pb-24 md:pt-24 md:pb-32 overflow-hidden border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header Block */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-700 mb-6 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            <span>Saranath College · All-Island Media Assembly 2026</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12] mb-6">
            National Stage for <br className="hidden sm:inline" />
            <span className="text-amber-700">Student Broadcasters</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-500 leading-relaxed mb-10 max-w-2xl mx-auto">
            Sri Lanka&apos;s premier collegiate media festival uniting student filmmakers, announcers, photographers, and audio artists across all 25 districts.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/competitions"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-all shadow-sm hover:shadow"
            >
              <Trophy size={16} className="text-amber-400" />
              <span>Browse {openCount} Open Tracks</span>
              <ArrowRight size={15} />
            </Link>

            {session.type === 'school' && session.school ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-sm font-semibold transition-colors shadow-2xs"
              >
                <span>Open School Dashboard</span>
              </Link>
            ) : (
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-sm font-semibold transition-colors shadow-2xs"
              >
                <FileCheck2 size={16} className="text-amber-700" />
                <span>Register Outer School</span>
              </Link>
            )}
          </div>
        </div>

        {/* Disciplines Bento Grid with Clean Soft Shadows */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
          {disciplines.map((d, i) => {
            const Icon = d.icon;
            return (
              <Link
                key={i}
                href="/competitions"
                className="group rounded-2xl bg-white p-6 border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_35px_rgba(0,0,0,0.06)] hover:border-slate-200 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-amber-50 group-hover:text-amber-700 transition-colors">
                      <Icon size={18} />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                      {d.badge}
                    </span>
                  </div>

                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    {d.category}
                  </p>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-700 transition-colors mb-2 leading-snug">
                    {d.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {d.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-50 mt-5 flex items-center justify-between text-xs text-slate-400 group-hover:text-slate-700">
                  <span>View Track Rules</span>
                  <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Minimal Institutional Trust Bar */}
        <div className="rounded-2xl bg-slate-50/70 border border-slate-100 p-5 flex flex-wrap items-center justify-around gap-4 text-xs font-medium text-slate-500">
          <span className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>100% Free Entry for All Schools</span>
          </span>
          <span className="hidden sm:inline text-slate-200">|</span>
          <span className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>Sinhala & English Medium Categories</span>
          </span>
          <span className="hidden sm:inline text-slate-200">|</span>
          <span className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>Grades 6–13 (Junior & Senior Levels)</span>
          </span>
          <span className="hidden sm:inline text-slate-200">|</span>
          <span className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>National Media Standards</span>
          </span>
        </div>

      </div>
    </section>
  );
}
