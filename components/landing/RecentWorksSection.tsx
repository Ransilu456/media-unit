import React from 'react';
import Link from 'next/link';
import { Film, Radio, Video, Award, ArrowRight } from 'lucide-react';

export function RecentWorksSection() {
  const items = [
    {
      title: 'Centennial Archives & Heritage',
      desc: 'Documenting Saranath College heritage, collegiate traditions, and historical achievements since 1883.',
      icon: Film,
      href: '/competitions',
      tag: 'Heritage',
    },
    {
      title: 'Live OB Broadcasting Unit',
      desc: 'Student-engineered multi-camera high definition broadcasting team covering sports derbies and national assemblies.',
      icon: Video,
      href: '/competitions',
      tag: 'Broadcast',
    },
    {
      title: 'Cinematic Narrative Features',
      desc: 'Award-winning investigative documentaries, dramatic short films, and colour-graded visual narratives.',
      icon: Award,
      href: '/competitions',
      tag: 'Cinema',
    },
    {
      title: 'Acoustic Radio Theater & Voice',
      desc: 'SLBC gold medal radio dramas, binaural sound design, vocal presenting, and news commentary.',
      icon: Radio,
      href: '/competitions',
      tag: 'Audio',
    },
  ];

  return (
    <section className="py-24 bg-white relative overflow-hidden" id="explore">
      {/* Subtle dot pattern matching reference site */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#0f172a 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header matching Explore Saranath */}
        <div className="text-center mb-20">
          <span className="text-amber-600 font-bold tracking-[0.2em] text-xs uppercase block mb-4">
            Discover
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 tracking-tight">
            Explore Agradhi Media
          </h2>
          <div className="w-20 h-1 bg-amber-500 mx-auto mt-6 rounded-full" />
        </div>


        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link
                key={idx}
                href={item.href}
                className="group bg-slate-50 border border-slate-100 p-10 rounded-[2.5rem] hover:bg-white hover:shadow-[0_20px_50px_rgba(15,23,42,0.08)] hover:border-amber-200 transition-all duration-500 flex flex-col items-center text-center relative overflow-hidden h-full"
              >
                <div className="w-20 h-20 bg-white shadow-sm border border-slate-100 text-slate-700 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-amber-600 group-hover:text-white group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-slate-200/50">
                  <Icon className="w-9 h-9" />
                  </div>

                <h3 className="font-serif font-bold text-2xl mb-4 text-slate-900 group-hover:text-amber-700 transition-colors">
                    {item.title}
                  </h3>

                <p className="text-slate-500 leading-relaxed text-sm mb-8 grow">
                    {item.desc}
                  </p>

                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 group-hover:text-amber-600 uppercase tracking-widest transition-all">
                  Learn More
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>

                {/* Bottom Amber Line Indicator */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-amber-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                  </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}
