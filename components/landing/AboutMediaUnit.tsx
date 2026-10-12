import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { MEDIA_UNIT_INFO } from '@/lib/constants';

export function AboutMediaUnit() {
  return (
    <section id="about" className="scroll-mt-28 border-y border-slate-100 bg-white py-12 sm:py-14">
      <div className="mx-auto grid max-w-5xl gap-4 px-5 sm:px-8 md:grid-cols-[1fr_2fr] md:items-start md:gap-10">
        <div>
          <p className="text-xs font-semibold text-amber-800">{MEDIA_UNIT_INFO.institution}</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
            About the Media Unit
          </h2>
        </div>
        <div>
          <p className="text-sm leading-7 text-slate-600 sm:text-base">
            {MEDIA_UNIT_INFO.name} is based at {MEDIA_UNIT_INFO.institution} in Kuliyapitiya. We bring schools together for all-island inter-school media competitions and Media Day.
          </p>
          <Link
            href="/rules"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-800 transition hover:text-amber-800"
          >
            Read how to enter <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
