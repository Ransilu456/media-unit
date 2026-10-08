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
    <section id="competitions" className="py-16 md:py-24 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="max-w-xl">
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2">
              Agradhi 2026 Assembly
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {title}
            </h1>
            <p className="mt-2 text-slate-500 text-sm sm:text-base leading-relaxed">
              {subtitle}
            </p>
          </div>

          <div>
            {isSchool ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-sm"
              >
                <span>School Dashboard</span>
                <ArrowRight size={14} />
              </Link>
            ) : (
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-sm"
              >
                <span>Register Your School</span>
                <ArrowRight size={14} />
              </Link>
            )}
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mb-10 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search tracks by keyword, category, or medium..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Medium Selector */}
            <div className="flex rounded-xl border border-slate-200 bg-slate-50/50 p-1 text-xs font-medium text-slate-600">
              {['All', 'Sinhala', 'English'].map((m) => (
                <button
                  key={m}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              const isExpanded = expandedCompId === comp.id;

              return (
                <div
                  key={comp.id}
                  className="rounded-3xl border border-slate-100 bg-white p-7 shadow-[0_4px_25px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_35px_rgba(0,0,0,0.06)] hover:border-slate-200 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                          {icon}
                        </div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          {comp.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {comp.medium && comp.medium !== 'None' && (
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                              comp.medium === 'Sinhala'
                                ? 'bg-blue-50 text-blue-700 border-blue-100'
                                : 'bg-purple-50 text-purple-700 border-purple-100'
                            }`}
                          >
                            {comp.medium}
                          </span>
                        )}
                        <StatusBadge status={comp.status} />
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-slate-900 leading-snug mb-2.5">
                      {comp.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-slate-500 leading-relaxed mb-5 line-clamp-3">
                      {comp.description}
                    </p>

                    {/* Metadata Box */}
                    <div className="grid grid-cols-2 gap-2 p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 text-xs mb-5">
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Deadline</span>
                        <span className="font-semibold text-slate-800">{comp.deadline}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Quota</span>
                        <span className="font-semibold text-slate-800">Max {comp.maxEntriesPerSchool} entries</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Eligibility</span>
                        <span className="font-semibold text-slate-800">{comp.eligibility}</span>
                      </div>
                    </div>

                    {/* Collapsible Rules */}
                    {comp.guidelines && comp.guidelines.length > 0 && (
                      <div className="mb-5">
                        <button
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

                  {/* Actions */}
                  <div className="pt-4 border-t border-slate-50">
                    {isSchool ? (
                      <button
                        onClick={() => setActiveModalComp(comp)}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-xs"
                      >
                        <span>Submit Student Entry</span>
                        <ArrowRight size={14} />
                      </button>
                    ) : (
                      <Link
                        href={`/register?track=${comp.id}`}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-xs"
                      >
                        <span>Register School to Enter</span>
                        <ArrowRight size={14} />
                      </Link>
                    )}
                  </div>
                </div>
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
