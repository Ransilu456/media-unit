'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMediaStore } from '@/lib/store';
import { FirestoreNetworkError } from '@/components/ui/FirestoreNetworkError';
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2,
  FileCheck2,
  Film,
  Mic2,
  Radio,
  UploadCloud,
  Users,
} from 'lucide-react';

const cardStyles = [
  { icon: Film, color: 'bg-sky-100', ink: 'text-sky-800', background: 'bg-sky-50', art: 'from-sky-100 via-cyan-50 to-white' },
  { icon: Camera, color: 'bg-emerald-100', ink: 'text-emerald-800', background: 'bg-emerald-50', art: 'from-emerald-100 via-teal-50 to-white' },
  { icon: Mic2, color: 'bg-orange-100', ink: 'text-orange-900', background: 'bg-orange-50', art: 'from-orange-100 via-amber-50 to-white' },
  { icon: Radio, color: 'bg-violet-100', ink: 'text-violet-900', background: 'bg-violet-50', art: 'from-violet-100 via-fuchsia-50 to-white' },
];

const steps = [
  {
    title: 'Register your school',
    description: 'A teacher signs up with the school contact details.',
    icon: FileCheck2,
    color: 'bg-amber-100 text-amber-900',
  },
  {
    title: 'Send student work',
    description: 'Choose a competition and add the student and work details.',
    icon: UploadCloud,
    color: 'bg-sky-100 text-sky-900',
  },
  {
    title: 'Follow the result',
    description: 'Check your school portal for updates from the review team.',
    icon: Users,
    color: 'bg-emerald-100 text-emerald-900',
  },
];

export function HomePreview() {
  const {
    competitions,
    isCompetitionsLoaded,
    competitionsError,
    retryCompetitions,
  } = useMediaStore();
  const [firstCard, setFirstCard] = useState(0);
  const visibleCompetitions = Array.from({ length: Math.min(3, competitions.length) }, (_, index) =>
    competitions[(firstCard + index) % competitions.length]
  ).filter((competition) => competition !== undefined);

  const moveCards = (direction: -1 | 1) => {
    if (!competitions.length) return;
    setFirstCard((index) => (index + direction + competitions.length) % competitions.length);
  };

  return (
    <div className="bg-[#fbfaf7]">
      <section id="competition-tracks" className="scroll-mt-28 border-t border-slate-100 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-700">Pick your way to tell a story</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Find a competition for every kind of creator</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
              Film, photography, news, audio, design, and more. Choose a competition and give your students a place to share their work.
            </p>
          </div>

          {competitionsError ? (
            <FirestoreNetworkError
              compact
              title="Competitions are not available right now"
              message={competitionsError}
              onRetry={retryCompetitions}
            />
          ) : !isCompetitionsLoaded ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {[0, 1, 2].map((item) => (
                <div key={item} aria-hidden="true" className="h-72 animate-pulse rounded-[28px] border border-slate-100 bg-white p-5">
                  <div className="h-32 rounded-2xl bg-slate-100" />
                  <div className="mt-5 h-3 w-24 rounded bg-slate-100" />
                  <div className="mt-3 h-5 w-3/4 rounded bg-slate-100" />
                  <div className="mt-4 h-3 w-full rounded bg-slate-100" />
                </div>
              ))}
            </div>
          ) : competitions.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
              New competitions will appear here soon.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                {visibleCompetitions.map((competition, index) => {
                  const style = cardStyles[(firstCard + index) % cardStyles.length];
                  const Icon = style.icon;
                  return (
                    <Link
                      key={competition.id}
                      href="/competitions"
                      className={`group overflow-hidden rounded-[28px] border border-slate-100 bg-white p-2.5 shadow-[0_8px_28px_rgba(15,23,42,0.04)] transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.10)] sm:p-3`}
                    >
                      <div className={`relative flex h-40 items-center justify-center overflow-hidden rounded-[22px] bg-gradient-to-br ${style.art} sm:h-44`}>
                        <span className="absolute -right-6 -top-12 h-40 w-40 rounded-full border-[20px] border-white/45 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110" />
                        <span className="absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-white/50 blur-xl" />
                        <span className={`relative flex h-20 w-20 items-center justify-center rounded-[26px] ${style.color} shadow-[0_14px_34px_rgba(15,23,42,0.10)] transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110`}>
                          <Icon size={38} strokeWidth={1.5} className={style.ink} />
                        </span>
                        <span className="absolute left-3 top-3 rounded-full border border-white/80 bg-white/85 px-2.5 py-1 text-[9px] font-bold text-slate-600">
                          {competition.medium === 'None' ? 'Any language' : competition.medium}
                        </span>
                        <span className="absolute bottom-3 right-3 rounded-full bg-white/80 px-2.5 py-1 text-[9px] font-semibold text-slate-600">
                          {competition.status === 'open' ? 'Entries open' : competition.status}
                        </span>
                      </div>
                      <div className={`rounded-b-[18px] px-3 pb-3 pt-4 ${style.background} sm:px-4`}>
                        <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-500">{competition.category}</p>
                        <h3 className="mt-1.5 line-clamp-2 min-h-12 text-base font-bold leading-6 text-slate-900 group-hover:text-amber-800">{competition.title}</h3>
                        <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-slate-600">{competition.description}</p>
                        <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-900/10 pt-3 text-[10px] text-slate-600">
                          <span className="min-w-0 truncate">Deadline · {competition.deadline}</span>
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-sara-navy px-2.5 py-2 font-bold text-white transition group-hover:bg-slate-800">
                            View <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {competitions.length > 3 && (
                <div className="mt-6 flex items-center justify-center gap-3">
                  <button type="button" onClick={() => moveCards(-1)} aria-label="Previous competitions" className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-amber-300 hover:text-amber-800">
                    <ArrowLeft size={16} />
                  </button>
                  <span className="text-[10px] font-medium text-slate-500">{firstCard + 1} / {competitions.length}</span>
                  <button type="button" onClick={() => moveCards(1)} aria-label="Next competitions" className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-amber-300 hover:text-amber-800">
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <section id="how-it-works" className="border-y border-slate-100 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-700">Easy to get started</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Three simple steps</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {steps.map(({ title, description, icon: Icon, color }, index) => (
              <article key={title} className="group rounded-[26px] border border-slate-100 bg-[#fbfaf7] p-6 transition hover:-translate-y-1 hover:border-amber-200 hover:shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">0{index + 1}</span>
                  <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${color} transition-transform group-hover:rotate-6 group-hover:scale-110`}>
                    <Icon size={21} />
                  </span>
                </div>
                <h3 className="mt-6 text-base font-bold text-slate-900">{title}</h3>
                <p className="mt-2 text-xs leading-6 text-slate-500">{description}</p>
              </article>
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <Link href="/register" className="inline-flex items-center gap-2 rounded-full bg-sara-navy px-5 py-3 text-xs font-semibold text-white transition hover:bg-slate-800">
              Get started <ArrowRight size={14} />
            </Link>
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-3 border-t border-slate-100 pt-6 text-[10px] font-medium text-slate-500">
            {['No entry fee', 'Students in Grades 6–13', 'Sinhala and English', 'Schools across Sri Lanka'].map((item) => (
              <span key={item} className="inline-flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-600" />{item}</span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
