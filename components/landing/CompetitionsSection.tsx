'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useMediaStore } from '@/lib/store';
import { StatusBadge } from '@/components/ui/Badge';
import { FirestoreNetworkError } from '@/components/ui/FirestoreNetworkError';
import { Competition } from '@/lib/types';
import {
  Trophy,
  ArrowRight,
  Film,
  Camera,
  Mic,
  Palette,
  Radio,
  CheckCircle2,
  Search,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const EntrySubmissionModal = dynamic(
  () => import('@/components/forms/EntrySubmissionModal').then((module) => module.EntrySubmissionModal),
  { loading: () => <div role="status" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 text-sm text-white">Loading entry form...</div> }
);

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Short Film & Cinematography': <Film size={18} className="text-amber-700" />,
  'Photography': <Camera size={18} className="text-amber-700" />,
  'News Reading & Announcing': <Mic size={18} className="text-amber-700" />,
  'Graphic Design & Digital Art': <Palette size={18} className="text-amber-700" />,
  'Radio Play & Audio Production': <Radio size={18} className="text-amber-700" />,
  'Live Media Reporting': <Film size={18} className="text-amber-700" />,
};

const CATEGORY_ART: Record<string, { background: string; iconBackground: string; iconColor: string }> = {
  'Short Film & Cinematography': { background: 'from-amber-100 via-orange-50 to-rose-50', iconBackground: 'bg-white', iconColor: 'text-amber-900' },
  'Photography': { background: 'from-sky-100 via-cyan-50 to-indigo-50', iconBackground: 'bg-white', iconColor: 'text-sky-900' },
  'News Reading & Announcing': { background: 'from-emerald-100 via-teal-50 to-sky-50', iconBackground: 'bg-white', iconColor: 'text-emerald-900' },
  'Graphic Design & Digital Art': { background: 'from-fuchsia-100 via-violet-50 to-indigo-50', iconBackground: 'bg-white', iconColor: 'text-violet-900' },
  'Radio Play & Audio Production': { background: 'from-violet-100 via-fuchsia-50 to-rose-50', iconBackground: 'bg-white', iconColor: 'text-violet-900' },
  'Live Media Reporting': { background: 'from-orange-100 via-amber-50 to-yellow-50', iconBackground: 'bg-white', iconColor: 'text-orange-900' },
};

interface CompetitionsSectionProps {
  title?: string;
  subtitle?: string;
}

export function CompetitionsSection({
  title = 'Competition Tracks',
  subtitle = 'Review rules, grade levels, and deadlines to submit student entries through your school delegation.',
}: CompetitionsSectionProps) {
  const {
    competitions,
    session,
    isCompetitionsLoaded,
    competitionsError,
    retryCompetitions,
  } = useMediaStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedMedium, setSelectedMedium] = useState<string>('All');
  const [expandedCompId, setExpandedCompId] = useState<string | null>(null);
  const [activeModalComp, setActiveModalComp] = useState<Competition | null>(null);

  const categories = useMemo(() => {
    return ['All', ...Array.from(new Set(competitions.map((c) => c.category)))];
  }, [competitions]);

  const filteredCompetitions = useMemo(() => {
    return competitions.filter((comp) => {
      const matchesSearch =
        comp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'All' || comp.category === selectedCategory;

      const matchesMedium =
        selectedMedium === 'All' ||
        comp.medium === selectedMedium ||
        (selectedMedium === 'Open' && (comp.medium === 'None' || !comp.medium));

      return matchesSearch && matchesCategory && matchesMedium;
    });
  }, [competitions, searchQuery, selectedCategory, selectedMedium]);

  const toggleExpand = (id: string) => {
    setExpandedCompId((prev) => (prev === id ? null : id));
  };

  const isSchool = session.type === 'school' && session.school;

  return (
    <section id="competitions" className="bg-[#fbfaf7] py-12 sm:py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-9 flex flex-col gap-5 md:mb-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700">
              Agradhi 2026 Assembly
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              {title}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
              {subtitle}
            </p>
          </div>

          <div>
            {isSchool ? (
              <Link
                href="/dashboard"
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-sara-navy px-5 py-3 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800"
              >
                <span>School Dashboard</span>
                <ArrowRight size={14} />
              </Link>
            ) : (
              <Link
                href="/register"
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-sara-navy px-5 py-3 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800"
              >
                <span>Register Your School</span>
                <ArrowRight size={14} />
              </Link>
            )}
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mb-8 space-y-4 rounded-[24px] border border-slate-200/80 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-5">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                aria-label="Search competitions"
                placeholder="Search competitions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-xs text-slate-800 shadow-xs placeholder:text-slate-400 focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-amber-100"
              />
              {searchQuery && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Medium Selector */}
            <div className="flex min-h-11 shrink-0 items-center rounded-xl border border-slate-200 bg-slate-50 p-1 text-xs font-medium text-slate-600">
              {['All', 'Sinhala', 'English'].map((m) => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={selectedMedium === m}
                  onClick={() => setSelectedMedium(m)}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    selectedMedium === m
                      ? 'bg-white text-slate-900 font-bold shadow-xs'
                      : 'hover:text-slate-900'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                aria-pressed={selectedCategory === cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap rounded-xl px-3.5 py-1.5 text-xs transition-colors ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-slate-50 border border-slate-200/80 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Competitions Cards Grid with Clean White Shadows */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {competitionsError ? (
            <div className="col-span-full">
              <FirestoreNetworkError
                title="Competition tracks are temporarily unavailable"
                message={competitionsError}
                onRetry={retryCompetitions}
              />
            </div>
          ) : !isCompetitionsLoaded ? (
            Array.from({ length: 4 }, (_, index) => (
              <div
                key={index}
                aria-hidden="true"
                className="space-y-5 rounded-3xl border border-slate-100 bg-white p-7 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="h-4 w-36 animate-pulse rounded bg-slate-200" />
                  <div className="h-5 w-20 animate-pulse rounded-full bg-slate-100" />
                </div>
                <div className="h-6 w-3/4 animate-pulse rounded bg-slate-200" />
                <div className="space-y-2">
                  <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
                  <div className="h-3 w-5/6 animate-pulse rounded bg-slate-100" />
                </div>
                <div className="h-20 animate-pulse rounded-2xl bg-slate-100" />
                <div className="h-10 animate-pulse rounded-xl bg-slate-200" />
              </div>
            ))
          ) : filteredCompetitions.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-slate-50/50 rounded-3xl border border-slate-100 p-8">
              <Trophy size={32} className="mx-auto text-slate-300 mb-3" />
              <h3 className="text-base font-bold text-slate-800 mb-1">No competition tracks match your search</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4 leading-relaxed">
                Try resetting your category or medium filter to explore all available categories.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSelectedMedium('All');
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredCompetitions.map((comp) => {
              const icon = CATEGORY_ICONS[comp.category] ?? <Trophy size={18} className="text-amber-700" />;
              const art = CATEGORY_ART[comp.category] ?? CATEGORY_ART['Short Film & Cinematography'];
              const isExpanded = expandedCompId === comp.id;
              const isOpen = comp.status === 'open';

              return (
                <article
                  key={comp.id}
                  className="group flex flex-col overflow-hidden rounded-[28px] border border-slate-100 bg-white p-2.5 shadow-[0_8px_28px_rgba(15,23,42,0.04)] transition duration-300 hover:-translate-y-1 hover:border-amber-200 hover:shadow-[0_18px_40px_rgba(15,23,42,0.10)] sm:p-3"
                >
                  <div>
                    <div className={`relative flex h-36 items-center justify-center overflow-hidden rounded-[22px] bg-gradient-to-br ${art.background}`}>
                      <span className="absolute -right-8 -top-12 h-40 w-40 rounded-full border-[22px] border-white/45 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110" />
                      <span className="absolute -bottom-8 -left-6 h-28 w-28 rounded-full bg-white/45 blur-xl" />
                      <span className={`relative flex h-[68px] w-[68px] items-center justify-center rounded-[24px] ${art.iconBackground} shadow-[0_12px_28px_rgba(15,23,42,0.10)] transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110 [&>svg]:text-current [&>svg]:h-8 [&>svg]:w-8 ${art.iconColor}`}>
                        {icon}
                      </span>
                      <span className="absolute left-3 top-3 rounded-full border border-white/80 bg-white/85 px-2.5 py-1 text-[9px] font-bold text-slate-600">
                        {comp.medium === 'None' ? 'Any language' : comp.medium}
                      </span>
                      <span className="absolute bottom-3 right-3"><StatusBadge status={comp.status} /></span>
                    </div>

                    <div className="px-3 pb-2 pt-4 sm:px-4">
                    <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-500">{comp.category}</p>
                    <h3 className="mt-1.5 min-h-12 text-base font-bold leading-6 text-slate-900">
                      {comp.title}
                    </h3>

                    <p className="mt-2 min-h-10 text-xs leading-5 text-slate-500 line-clamp-2">
                      {comp.description}
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-slate-50 p-3 text-xs">
                      <div className="min-w-0">
                        <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Deadline</span>
                        <span className="mt-1 block truncate text-[11px] font-semibold text-slate-800">{comp.deadline}</span>
                      </div>
                      <div className="min-w-0">
                        <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">School entry limit</span>
                        <span className="mt-1 block truncate text-[11px] font-semibold text-slate-800">Up to {comp.maxEntriesPerSchool}</span>
                      </div>
                      <div className="col-span-2 border-t border-slate-200/80 pt-2">
                        <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Who can enter</span>
                        <span className="mt-1 block text-[11px] font-medium leading-5 text-slate-700">{comp.eligibility}</span>
                      </div>
                    </div>

                    {/* Collapsible Rules */}
                    {comp.guidelines && comp.guidelines.length > 0 && (
                      <div className="mb-5">
                        <button
                          type="button"
                          aria-expanded={isExpanded}
                          onClick={() => toggleExpand(comp.id)}
                          className="flex items-center justify-between w-full text-xs font-semibold text-slate-600 hover:text-slate-900 py-1 transition-colors"
                        >
                          <span>{isExpanded ? 'Hide track requirements' : 'View requirements & rules'}</span>
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>

                        {isExpanded && (
                          <div className="mt-2.5 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 text-xs space-y-2">
                            {comp.guidelines.map((g, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-slate-600">
                                <CheckCircle2 size={13} className="text-amber-700 mt-0.5 shrink-0" />
                                <span className="leading-relaxed">{g}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-auto px-3 pb-3 pt-2 sm:px-4">
                    {isSchool ? (
                      <button
                        type="button"
                        disabled={!isOpen}
                        onClick={() => setActiveModalComp(comp)}
                        className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-sara-navy py-3 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                      >
                        <span>{isOpen ? 'Add a student' : 'Entries are closed'}</span>
                        {isOpen && <ArrowRight size={14} />}
                      </button>
                    ) : (
                      <Link
                        href={isOpen ? `/register?track=${comp.id}` : '/competitions'}
                        aria-disabled={!isOpen}
                        className={`flex min-h-11 w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-semibold shadow-xs transition-colors ${
                          isOpen ? 'bg-sara-navy text-white hover:bg-slate-800' : 'cursor-default bg-slate-100 text-slate-400'
                        }`}
                      >
                        <span>{isOpen ? 'Register school to enter' : 'Entries are closed'}</span>
                        {isOpen && <ArrowRight size={14} />}
                      </Link>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </div>

        {/* Submission Modal for 1-Click Submission */}
        {activeModalComp && isSchool && session.school && (
          <EntrySubmissionModal
            isOpen={true}
            onClose={() => setActiveModalComp(null)}
            competition={activeModalComp}
            school={session.school}
            onSubmitted={() => {
              setActiveModalComp(null);
            }}
          />
        )}

      </div>
    </section>
  );
}
