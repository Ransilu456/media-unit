import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { MEDIA_UNIT_INFO } from '@/lib/constants';

export function AboutMediaUnit() {
  return (
    <section id="about" className="scroll-mt-28 border-y border-slate-200/70 bg-white py-14 sm:py-16 lg:py-[4.5rem]">
      <div className="mx-auto grid max-w-6xl gap-6 px-5 sm:px-8 md:grid-cols-[minmax(250px,0.85fr)_minmax(0,1.5fr)] md:items-start md:gap-12 lg:gap-16">
        <div className="border-l-[3px] border-amber-400 pl-5">
          <p className="text-sm font-semibold text-amber-800">{MEDIA_UNIT_INFO.institution}</p>
          <h2 className="mt-2 text-2xl font-bold leading-tight tracking-tight text-slate-950 sm:text-[1.75rem]">
            About the Media Unit
          </h2>
          <p className="mt-3 text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
            Create · Learn · Connect
          </p>
        </div>
        <div className="md:pt-1">
          <p className="text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
            {MEDIA_UNIT_INFO.name} is based at {MEDIA_UNIT_INFO.institution} in Kuliyapitiya. We bring schools together through all-island inter-school media competitions and Media Day, giving students a place to develop and share their ideas.
          </p>
          <Link
            href="/rules"
            className="group mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-900 transition-colors hover:text-amber-800"
          >
            Read how to enter
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
