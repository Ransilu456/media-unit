'use client';

import Link from 'next/link';
import { useMediaStore } from '@/lib/store';
import {
  ArrowRight,
  Camera,
  Check,
  Film,
  Mic2,
  Radio,
  Trophy,
} from 'lucide-react';

export function HeroSection() {
  const { session } = useMediaStore();
  const dashboardHref = session.type === 'school' ? '/dashboard' : '/register';
  const dashboardLabel = session.type === 'school' ? 'Go to your dashboard' : 'Register your school';

  return (
    <section className="relative isolate overflow-hidden bg-[#fffefa]">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_0%,rgba(251,191,36,0.13),transparent_45%),linear-gradient(180deg,#fffefa_0%,#faf9f6_100%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-20 top-24 -z-10 h-48 w-48 rounded-full border border-amber-200/60 sm:left-[8%] sm:top-32 sm:h-64 sm:w-64" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-40 -z-10 h-56 w-56 rounded-full bg-orange-100/60 blur-3xl sm:right-[7%] sm:top-36 sm:h-72 sm:w-72" />

      <div className="relative mx-auto flex min-h-147.5 w-full max-w-7xl flex-col items-center justify-center px-5 pb-16 pt-16 text-center sm:min-h-[660px] sm:px-8 sm:pb-20 sm:pt-20">
        <div aria-hidden="true" className="pointer-events-none absolute left-[8%] top-[23%] hidden -rotate-12 items-center justify-center rounded-[20px] border border-white bg-white/90 p-3 text-amber-800 shadow-[0_12px_35px_rgba(15,23,42,0.10)] md:flex">
          <Film size={25} strokeWidth={1.7} />
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute right-[8%] top-[30%] hidden rotate-12 items-center justify-center rounded-full border border-white bg-white/90 p-4 text-slate-800 shadow-[0_12px_35px_rgba(15,23,42,0.10)] md:flex">
          <Camera size={25} strokeWidth={1.7} />
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute bottom-[22%] left-[17%] hidden rotate-6 items-center justify-center rounded-full bg-amber-100 p-3 text-amber-900 md:flex">
          <Radio size={19} strokeWidth={1.8} />
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute bottom-[25%] right-[16%] hidden -rotate-6 items-center justify-center rounded-[18px] bg-slate-900 p-3 text-amber-300 shadow-lg md:flex">
          <Mic2 size={20} strokeWidth={1.8} />
        </div>

        <p className="inline-flex items-center gap-2 rounded-full border border-amber-200/80 bg-white/90 px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-700 shadow-sm sm:text-xs">
          Saranath College · Media Assembly 2026
        </p>

        <h1 className="mt-7 max-w-4xl text-[2.65rem] font-bold leading-[1.08] tracking-[-0.05em] text-slate-950 sm:mt-8 sm:text-6xl lg:text-[5rem]">
          The place for your
          <span className="relative mt-1 block text-amber-700">
            story to shine
            <svg
              aria-hidden="true"
              viewBox="0 0 360 18"
              preserveAspectRatio="none"
              className="mx-auto mt-1 h-3 w-52 text-amber-300 sm:h-4 sm:w-72"
              fill="none"
            >
              <path d="M4 12C78 3 222 3 356 11" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
            </svg>
          </span>
        </h1>

        <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600 sm:mt-6 sm:text-base sm:leading-8">
          Bring your ideas to life. Share student-made films, photographs, audio, and news stories with school media creators across Sri Lanka.
        </p>

        <div className="mt-7 flex w-full max-w-md flex-col items-stretch justify-center gap-3 min-[460px]:w-auto min-[460px]:flex-row">
          <Link
            href="/competitions"
            className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-sara-navy px-6 text-sm font-semibold text-white shadow-[0_10px_26px_rgba(15,23,42,0.17)] transition hover:-translate-y-0.5 hover:bg-slate-800"
          >
            Explore competitions
            <ArrowRight size={16} className="text-amber-300 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href={dashboardHref}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/90 px-6 text-sm font-semibold text-slate-800 transition hover:border-amber-300 hover:bg-amber-50"
          >
            {dashboardLabel}
          </Link>
        </div>

        <ul className="mt-7 flex flex-wrap justify-center gap-x-5 gap-y-2.5 text-[11px] font-medium text-slate-600 sm:mt-8 sm:gap-x-7 sm:text-xs">
          {['Free to enter', 'Grades 6–13', 'Sinhala & English'].map((item) => (
            <li key={item} className="inline-flex items-center gap-1.5">
              <Check size={13} strokeWidth={2.5} className="text-emerald-700" />
              {item}
            </li>
          ))}
        </ul>

        <div aria-hidden="true" className="mt-10 flex items-center gap-2 text-amber-600/80 sm:mt-12">
          <span className="h-px w-8 bg-amber-300" />
          <Trophy size={15} />
          <span className="h-px w-8 bg-amber-300" />
        </div>
      </div>
    </section>
  );
}
