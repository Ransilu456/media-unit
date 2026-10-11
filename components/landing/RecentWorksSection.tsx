import React from 'react';
import Link from 'next/link';
import { Film, Radio, Camera, Newspaper, ArrowRight } from 'lucide-react';

export function RecentWorksSection() {
  const items = [
    {
      title: 'Make a short film',
      desc: 'Plan a story, record it, and share your own film with other young creators.',
      icon: Film,
      href: '/competitions',
      tag: 'Film',
      art: 'from-amber-100 via-orange-50 to-rose-50',
      iconStyle: 'bg-white text-amber-900',
    },
    {
      title: 'Capture a moment',
      desc: 'Show the people, places, and ideas around you through photography.',
      icon: Camera,
      href: '/competitions',
      tag: 'Photography',
      art: 'from-sky-100 via-cyan-50 to-indigo-50',
      iconStyle: 'bg-white text-sky-900',
    },
    {
      title: 'Tell the news',
      desc: 'Build confidence by writing, reporting, and presenting a story that matters.',
      icon: Newspaper,
      href: '/competitions',
      tag: 'Journalism',
      art: 'from-emerald-100 via-teal-50 to-sky-50',
      iconStyle: 'bg-white text-emerald-900',
    },
    {
      title: 'Create with sound',
      desc: 'Try radio, voice, and audio storytelling with a student-made production.',
      icon: Radio,
      href: '/competitions',
      tag: 'Audio',
      art: 'from-violet-100 via-fuchsia-50 to-rose-50',
      iconStyle: 'bg-white text-violet-900',
    },
  ];

  return (
    <section className="relative overflow-hidden bg-[#fbfaf7] py-16 sm:py-20" id="explore">
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#0f172a 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="mb-10 text-center">
          <span className="mb-3 block text-[10px] font-bold uppercase tracking-[0.2em] text-amber-700">Make something of your own</span>
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Your next story starts here</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
            Explore different ways to create, then find an open competition for your idea.
          </p>
          <Link
            href="/competitions"
            className="group mt-5 inline-flex items-center gap-2 text-xs font-bold text-slate-700 transition-colors hover:text-amber-800"
          >
            Browse all competitions
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.tag}
                href={item.href}
                className="group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-[0_8px_28px_rgba(15,23,42,0.04)] transition duration-300 hover:-translate-y-1 hover:border-amber-200 hover:shadow-[0_18px_40px_rgba(15,23,42,0.10)]"
              >
                <div className={`relative flex h-36 items-center justify-center overflow-hidden bg-gradient-to-br ${item.art}`}>
                  <span className="absolute -right-8 -top-12 h-40 w-40 rounded-full border-[22px] border-white/45 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110" />
                  <span className="absolute -bottom-8 -left-6 h-28 w-28 rounded-full bg-white/45 blur-xl" />
                  <span className={`relative flex h-[68px] w-[68px] items-center justify-center rounded-[24px] ${item.iconStyle} shadow-[0_12px_28px_rgba(15,23,42,0.10)] transition duration-500 group-hover:-rotate-6 group-hover:scale-110`}>
                    <Icon className="h-8 w-8" strokeWidth={1.5} />
                  </span>
                  <span className="absolute left-3 top-3 rounded-full border border-white/80 bg-white/85 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-600">{item.tag}</span>
                </div>
                <div className="flex grow flex-col p-5 sm:p-6">
                  <h3 className="text-base font-bold text-slate-900 transition-colors group-hover:text-amber-800">{item.title}</h3>
                  <p className="mt-2 grow text-xs leading-6 text-slate-500">{item.desc}</p>
                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-[10px] font-bold text-slate-600 transition-colors group-hover:text-amber-800">
                    Find a competition
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 transition group-hover:bg-amber-50">
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 h-1 w-full origin-left scale-x-0 bg-amber-500 transition-transform duration-300 group-hover:scale-x-100" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
