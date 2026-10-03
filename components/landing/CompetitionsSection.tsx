'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useMediaStore } from '@/lib/store';
import { StatusBadge } from '@/components/ui/Badge';
import {
  Trophy,
  Calendar,
  Users,
  Award,
  ArrowRight,
  Film,
  Camera,
  Mic,
  Palette,
  Radio,
  CheckCircle2,
} from 'lucide-react';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Short Film & Cinematography': <Film size={18} className="text-amber-600" />,
  'Photography': <Camera size={18} className="text-amber-600" />,
  'News Reading & Announcing': <Mic size={18} className="text-amber-600" />,
  'Graphic Design & Digital Art': <Palette size={18} className="text-amber-600" />,
  'Radio Play & Audio Production': <Radio size={18} className="text-amber-600" />,
  'Live Media Reporting': <Film size={18} className="text-amber-600" />,
};

export function CompetitionsSection() {
  const { competitions, session } = useMediaStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(competitions.map((c) => c.category)))];

  const filtered =
    selectedCategory === 'All'
      ? competitions
      : competitions.filter((c) => c.category === selectedCategory);

  return (
    <section id="competitions" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 border-t border-slate-200 relative">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-amber-600 font-bold tracking-[0.2em] text-xs uppercase block mb-3 font-mono">
              Official Competition Tracks
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-slate-900 tracking-tight">
              Annual Inter-School Competitions
            </h2>
            <p className="text-slate-600 text-sm sm:text-base max-w-xl mt-3 font-light">
              Explore open categories, review submission criteria, and submit official entries on behalf of your school delegation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={session.type === 'school' ? '/dashboard' : '/register'}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition-all shadow-md shadow-amber-900/10"
            >
              <Trophy size={15} />
              <span>{session.type === 'school' ? 'Submit from Dashboard' : 'Register to Compete'}</span>
            </Link>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white border-slate-900 font-semibold shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-amber-400 hover:text-amber-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Competition Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((comp) => {
            const icon = CATEGORY_ICONS[comp.category] || <Trophy size={18} className="text-amber-600" />;
            const isSchoolLoggedIn = session.type === 'school';

            return (
              <div
                key={comp.id}
                className="group flex flex-col justify-between p-7 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:border-amber-300 transition-all duration-300"
              >
                <div>
                  {/* Category & Status */}
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="inline-flex items-center gap-2 text-xs font-mono text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                      {icon}
                      <span className="truncate max-w-[170px]">{comp.category}</span>
                    </div>
                    <StatusBadge status={comp.status} />
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 mb-2 group-hover:text-amber-700 transition-colors">
                    {comp.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 mb-6 leading-relaxed font-light">
                    {comp.description}
                  </p>

                  {/* Metadata Matrix */}
                  <div className="space-y-2.5 py-4 border-y border-slate-100 mb-6 text-xs text-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Users size={14} className="text-slate-400" />
                        Eligibility:
                      </span>
                      <span className="font-medium text-slate-900">{comp.eligibility}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Calendar size={14} className="text-slate-400" />
                        Deadline:
                      </span>
                      <span className="font-mono text-amber-700 font-semibold">{comp.deadline}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Award size={14} className="text-slate-400" />
                        Max Entries:
                      </span>
                      <span className="font-medium text-slate-900">{comp.maxEntriesPerSchool} per school</span>
                    </div>
                  </div>

                  {/* Key Rules Snippet */}
                  <div className="space-y-1.5 mb-6">
                    <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                      Key Submission Requirements:
                    </p>
                    {comp.guidelines.slice(0, 2).map((g, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                        <CheckCircle2 size={13} className="text-amber-600 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{g}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="pt-2">
                  {isSchoolLoggedIn ? (
                    <Link
                      href={`/dashboard?entryComp=${comp.id}`}
                      className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-all shadow-sm"
                    >
                      <span>Fill Submission Form</span>
                      <ArrowRight size={14} />
                    </Link>
                  ) : (
                    <Link
                      href="/login"
                      className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-all"
                    >
                      <span>Sign In to Submit</span>
                      <ArrowRight size={14} className="text-slate-400" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
