'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useMediaStore } from '@/lib/store';
import {
  ArrowDownRight,
  ArrowRight,
  AudioLines,
  Camera,
  Check,
  Film,
  Newspaper,
  Play,
} from 'lucide-react';

const showcases = [
  {
    label: 'Film',
    icon: Film,
    title: 'Stories brought to life',
    caption: 'PLAN · FILM · SHARE',
    heroClass: 'bg-[#fffaf1]',
    glowClass: 'bg-[radial-gradient(ellipse_at_78%_42%,rgba(222,210,255,0.68),transparent_38%),radial-gradient(ellipse_at_14%_4%,rgba(255,230,170,0.55),transparent_32%)]',
    backdropRingClass: 'border-violet-200/60',
    badgeClass: 'border-violet-200 text-violet-900',
    headlineClass: 'text-violet-800',
    underlineClass: 'text-amber-400',
    primaryButtonClass: 'bg-violet-800 shadow-[0_12px_28px_rgba(91,55,160,0.22)] hover:bg-violet-900 focus-visible:outline-violet-800',
    secondaryButtonClass: 'hover:border-violet-200 hover:bg-violet-50 focus-visible:outline-violet-800',
    checkClass: 'text-emerald-700',
    tagClass: 'bg-violet-100 text-violet-800',
    iconClass: 'bg-violet-100 text-violet-800',
    frameClass: 'from-[#ded1fb] via-[#b99cf0] to-[#7950c7]',
    panelClass: 'from-violet-300 via-[#b9a1f3] to-[#7950c7]',
    orbClass: 'bg-amber-300',
    ringClass: 'border-white/20',
    eyebrowClass: 'text-violet-700',
    actionClass: 'text-violet-800',
    floatClass: 'bg-amber-100 text-amber-800',
  },
  {
    label: 'Photography',
    icon: Camera,
    title: 'Moments worth remembering',
    caption: 'NOTICE · FRAME · CAPTURE',
    heroClass: 'bg-[#fff9f2]',
    glowClass: 'bg-[radial-gradient(ellipse_at_78%_42%,rgba(255,205,160,0.62),transparent_38%),radial-gradient(ellipse_at_14%_4%,rgba(255,230,170,0.55),transparent_32%)]',
    backdropRingClass: 'border-orange-200/70',
    badgeClass: 'border-orange-200 text-orange-900',
    headlineClass: 'text-orange-700',
    underlineClass: 'text-rose-400',
    primaryButtonClass: 'bg-orange-700 shadow-[0_12px_28px_rgba(194,91,42,0.22)] hover:bg-orange-800 focus-visible:outline-orange-700',
    secondaryButtonClass: 'hover:border-orange-200 hover:bg-orange-50 focus-visible:outline-orange-700',
    checkClass: 'text-orange-700',
    tagClass: 'bg-amber-100 text-amber-900',
    iconClass: 'bg-amber-100 text-amber-900',
    frameClass: 'from-[#ffe5a7] via-[#f5bb74] to-[#e77950]',
    panelClass: 'from-amber-200 via-orange-200 to-rose-300',
    orbClass: 'bg-sky-300',
    ringClass: 'border-white/35',
    eyebrowClass: 'text-orange-800',
    actionClass: 'text-orange-800',
    floatClass: 'bg-sky-100 text-sky-800',
  },
  {
    label: 'Journalism',
    icon: Newspaper,
    title: 'Stories that matter',
    caption: 'ASK · WRITE · REPORT',
    heroClass: 'bg-[#f4faff]',
    glowClass: 'bg-[radial-gradient(ellipse_at_78%_42%,rgba(145,211,245,0.58),transparent_38%),radial-gradient(ellipse_at_14%_4%,rgba(255,231,178,0.5),transparent_32%)]',
    backdropRingClass: 'border-sky-200/70',
    badgeClass: 'border-sky-200 text-sky-900',
    headlineClass: 'text-sky-800',
    underlineClass: 'text-yellow-400',
    primaryButtonClass: 'bg-sky-800 shadow-[0_12px_28px_rgba(37,99,145,0.22)] hover:bg-sky-900 focus-visible:outline-sky-800',
    secondaryButtonClass: 'hover:border-sky-200 hover:bg-sky-50 focus-visible:outline-sky-800',
    checkClass: 'text-sky-700',
    tagClass: 'bg-sky-100 text-sky-800',
    iconClass: 'bg-sky-100 text-sky-800',
    frameClass: 'from-[#c7e7f8] via-[#83c5e6] to-[#397eaf]',
    panelClass: 'from-sky-200 via-cyan-200 to-blue-300',
    orbClass: 'bg-yellow-300',
    ringClass: 'border-white/35',
    eyebrowClass: 'text-sky-800',
    actionClass: 'text-sky-800',
    floatClass: 'bg-indigo-100 text-indigo-800',
  },
  {
    label: 'Audio',
    icon: AudioLines,
    title: 'A voice of your own',
    caption: 'LISTEN · RECORD · CREATE',
    heroClass: 'bg-[#f2fbf6]',
    glowClass: 'bg-[radial-gradient(ellipse_at_78%_42%,rgba(137,224,184,0.54),transparent_38%),radial-gradient(ellipse_at_14%_4%,rgba(255,230,170,0.5),transparent_32%)]',
    backdropRingClass: 'border-emerald-200/70',
    badgeClass: 'border-emerald-200 text-emerald-900',
    headlineClass: 'text-emerald-800',
    underlineClass: 'text-lime-400',
    primaryButtonClass: 'bg-emerald-800 shadow-[0_12px_28px_rgba(28,112,83,0.22)] hover:bg-emerald-900 focus-visible:outline-emerald-800',
    secondaryButtonClass: 'hover:border-emerald-200 hover:bg-emerald-50 focus-visible:outline-emerald-800',
    checkClass: 'text-emerald-700',
    tagClass: 'bg-emerald-100 text-emerald-800',
    iconClass: 'bg-emerald-100 text-emerald-800',
    frameClass: 'from-[#c5f0d8] via-[#78cba9] to-[#328b84]',
    panelClass: 'from-emerald-200 via-teal-200 to-cyan-300',
    orbClass: 'bg-fuchsia-300',
    ringClass: 'border-white/35',
    eyebrowClass: 'text-emerald-800',
    actionClass: 'text-emerald-800',
    floatClass: 'bg-fuchsia-100 text-fuchsia-800',
  },
];

export function HeroSection() {
  const { session } = useMediaStore();
  const schoolSignedIn = session.type === 'school';
  const [activeShowcase, setActiveShowcase] = useState(0);
  const [isShowcasePaused, setIsShowcasePaused] = useState(false);
  const showcase = showcases[activeShowcase];
  const ShowcaseIcon = showcase.icon;

  useEffect(() => {
    if (isShowcasePaused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const interval = window.setInterval(() => {
      setActiveShowcase((current) => (current + 1) % showcases.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [isShowcasePaused]);

  return (
    <section className={`relative isolate overflow-hidden transition-colors duration-700 ${showcase.heroClass} z-40 min-h-full`}>
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 -z-10 transition-colors duration-700 ${showcase.glowClass}`}
      />
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -right-40 top-12 -z-10 h-[34rem] w-[34rem] rounded-full border transition-colors duration-700 sm:right-[-7rem] lg:right-[3%] ${showcase.backdropRingClass}`}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-28 -z-10 h-[25rem] w-[25rem] rounded-full border-[28px] border-white/35 sm:right-[-1rem] lg:right-[9%]"
      />

      <div className="mx-auto flex min-h-[620px] max-w-7xl flex-col items-center gap-12 px-5 pb-16 pt-12 sm:px-8 sm:pb-20 sm:pt-16 lg:min-h-[680px] lg:flex-row lg:gap-10 lg:px-10 lg:py-16">
        <div className="relative z-10 w-full max-w-2xl text-center lg:w-[52%] lg:shrink-0 lg:text-left">
          <p className={`inline-flex items-center gap-2 rounded-full border bg-white/80 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] shadow-sm transition-colors duration-500 sm:text-[11px] ${showcase.badgeClass}`}>
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            Saranath College <span className="text-slate-300">/</span> Media Unit 2026
          </p>

          <h1 className="mt-7 text-[2.75rem] font-bold leading-[1.04] tracking-[-0.055em] text-slate-950 sm:text-6xl lg:text-[4.5rem]">
            Every school has
            <span className={`block transition-colors duration-500 ${showcase.headlineClass}`}>a story worth</span>
            <span className="relative inline-block text-slate-950">
              sharing.
              <svg
                aria-hidden="true"
                viewBox="0 0 230 18"
                preserveAspectRatio="none"
                className={`absolute -bottom-2 left-0 h-3 w-full transition-colors duration-500 sm:-bottom-3 sm:h-4 ${showcase.underlineClass}`}
                fill="none"
              >
                <path d="M5 12C60 3 169 4 225 11" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
              </svg>
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-xl text-sm leading-7 text-slate-600 sm:text-base sm:leading-8 lg:mx-0">
            Agradhi Media Unit brings schools together through student-made films, photography, journalism, and audio. Create meaningful work, enter competitions, and share your school&apos;s voice.
          </p>

          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 min-[460px]:flex-row lg:justify-start">
            <Link
              href="/competitions"
              className={`group inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 ${showcase.primaryButtonClass}`}
            >
              Explore competitions
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href={schoolSignedIn ? '/dashboard' : '/register'}
              className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/90 px-6 text-sm font-semibold text-slate-800 transition focus-visible:outline-2 focus-visible:outline-offset-2 ${showcase.secondaryButtonClass}`}
            >
              {schoolSignedIn ? 'Open school dashboard' : 'Register your school'}
            </Link>
          </div>

          <ul className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-3 text-[11px] font-medium text-slate-600 sm:gap-x-7 lg:justify-start">
            {['For school communities', 'Student creativity', 'Simple online entry'].map((item) => (
              <li key={item} className="inline-flex items-center gap-1.5">
                <Check size={14} strokeWidth={2.5} className={`transition-colors duration-500 ${showcase.checkClass}`} />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto flex min-h-[360px] w-full max-w-[510px] items-center justify-center sm:min-h-[420px] lg:min-h-[480px] lg:flex-1">
          <div
            aria-hidden="true"
            className={`absolute inset-x-4 inset-y-5 rounded-[2.5rem] bg-gradient-to-br shadow-[0_30px_80px_rgba(99,66,166,0.2)] transition-colors duration-700 sm:inset-x-8 sm:inset-y-8 sm:rounded-[3rem] ${showcase.panelClass}`}
          />
          <div aria-hidden="true" className={`absolute right-3 top-5 h-24 w-24 rounded-full shadow-lg shadow-slate-900/10 transition-colors duration-700 sm:right-7 sm:top-7 sm:h-32 sm:w-32 ${showcase.orbClass}`} />
          <div aria-hidden="true" className="absolute bottom-4 left-2 h-28 w-28 rounded-full border-[18px] border-white/20 sm:bottom-8 sm:left-5 sm:h-36 sm:w-36" />

          <div
            role="group"
            aria-label="Student media showcase carousel"
            onMouseEnter={() => setIsShowcasePaused(true)}
            onMouseLeave={() => setIsShowcasePaused(false)}
            onFocus={() => setIsShowcasePaused(true)}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setIsShowcasePaused(false);
            }}
            aria-roledescription="carousel"
            className="relative z-10 w-[78%] max-w-[360px] -rotate-2 rounded-[1.8rem] border border-white/80 bg-white p-4 shadow-[0_24px_65px_rgba(45,30,84,0.25)] transition-transform duration-500 hover:rotate-0 sm:w-[76%] sm:rounded-[2rem] sm:p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors duration-500 ${showcase.iconClass}`}>
                  <ShowcaseIcon size={18} />
                </span>
                <span>
                  <span className="block text-[10px] font-medium text-slate-400">Agradhi Media Unit</span>
                  <span className="block text-sm font-bold text-slate-900">Student {showcase.label.toLowerCase()}</span>
                </span>
              </div>
              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-amber-900">2026</span>
            </div>

            <div className={`relative mt-4 flex h-40 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br transition-colors duration-700 sm:h-48 ${showcase.frameClass}`}>
              <span aria-hidden="true" className={`absolute -right-7 -top-10 h-36 w-36 rounded-full border-[18px] transition-colors duration-700 ${showcase.ringClass}`} />
              <span aria-hidden="true" className={`absolute -bottom-10 -left-4 h-32 w-32 rounded-full opacity-85 blur-[1px] transition-colors duration-700 ${showcase.orbClass}`} />
              <span className="relative flex h-16 w-16 items-center justify-center rounded-full border border-white/60 bg-white/25 text-white shadow-lg backdrop-blur-sm transition-transform hover:scale-110">
                <Play size={24} fill="currentColor" className="ml-1" />
              </span>
              <span className="absolute bottom-3 left-3 rounded-full border border-white/50 bg-slate-950/20 px-2.5 py-1 text-[9px] font-semibold tracking-wide text-white backdrop-blur-sm">
                {showcase.caption}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between gap-2">
              <div>
                <p className={`text-[9px] font-semibold uppercase tracking-[0.15em] transition-colors duration-500 ${showcase.eyebrowClass}`}>Ideas in every medium</p>
                <p className="mt-1 text-xs font-semibold text-slate-800">{showcase.title}</p>
              </div>
              <ArrowDownRight size={18} className={`shrink-0 transition-colors duration-500 ${showcase.actionClass}`} />
            </div>

            <div className="mt-4 flex items-center justify-between gap-2">
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-semibold transition-colors duration-500 ${showcase.tagClass}`}>
                <ShowcaseIcon size={11} />
                {showcase.label}
              </span>
              <div role="group" aria-label="Choose a media showcase" className="flex items-center gap-1.5">
                {showcases.map((item, index) => (
                  <button
                    key={item.label}
                    type="button"
                    aria-label={`Show ${item.label.toLowerCase()} theme`}
                    aria-pressed={activeShowcase === index}
                    onClick={() => setActiveShowcase(index)}
                    className={`h-2 rounded-full transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-700 ${
                      activeShowcase === index ? 'w-5 bg-slate-800' : 'w-2 bg-slate-300 hover:bg-slate-500'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="absolute left-0 top-10 z-20 flex items-center gap-2 rounded-2xl border border-white/80 bg-white px-3 py-2.5 shadow-[0_12px_30px_rgba(15,23,42,0.12)] sm:left-1 sm:top-12 sm:px-4 sm:py-3">
            <span className={`flex h-8 w-8 items-center justify-center rounded-xl transition-colors duration-500 ${showcase.floatClass}`}>
              <ShowcaseIcon size={16} />
            </span>
            <span className="text-[10px] font-bold text-slate-800 sm:text-xs">{showcase.label} together</span>
          </div>

          <div className="absolute bottom-8 right-0 z-20 rounded-2xl border border-white/80 bg-white px-3 py-2.5 shadow-[0_12px_30px_rgba(15,23,42,0.12)] sm:bottom-12 sm:right-1 sm:px-4 sm:py-3">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">Your next step</p>
            <p className={`mt-1 flex items-center gap-1.5 text-[10px] font-bold transition-colors duration-500 sm:text-xs ${showcase.actionClass}`}>
              Find a competition <ArrowRight size={13} />
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
