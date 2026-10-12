import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ArrowRight, CheckCircle2, FileText, Link2, School, Trophy } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Rules & Regulations | Agradhi Media Unit',
  description: 'Competition eligibility, entry requirements, and submission rules for the Agradhi Media Unit.',
};

const rules = [
  {
    title: 'Register your school',
    description: 'A teacher or school media leader creates the school account. Wait for approval before signing in.',
    icon: School,
  },
  {
    title: 'Check the competition',
    description: 'Before entering, check the accepted grades, language, deadline, and entry limit shown on that competition.',
    icon: Trophy,
  },
  {
    title: 'Enter one student at a time',
    description: 'Choose a competition, then enter the student’s details and a short description of their work.',
    icon: FileText,
  },
  {
    title: 'Share a working link',
    description: 'Add a Google Drive, YouTube, or OneDrive link. Set it so anyone with the link can view the work.',
    icon: Link2,
  },
];

export default function RulesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#fbfaf7] text-slate-800">
      <Navbar />
      <main className="flex-1">
        <section className="relative isolate overflow-hidden border-b border-slate-200/70 bg-[#fffaf1] py-12 sm:py-16">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_85%_35%,rgba(222,210,255,0.5),transparent_38%),radial-gradient(ellipse_at_10%_0%,rgba(255,230,170,0.4),transparent_34%)]" />
          <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
            <p className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/80 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-violet-900 sm:text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Agradhi Media Unit · 2026
            </p>
            <div className="mt-5 grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                  Simple steps to enter
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                  Follow these steps to submit student work through your school.
                </p>
              </div>
              <span className="hidden h-20 w-20 items-center justify-center rounded-[1.75rem] border border-white/80 bg-white/70 text-violet-800 shadow-sm md:flex">
                <FileText size={34} strokeWidth={1.5} />
              </span>
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-14">
          <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-800">How to take part</p>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">Your entry, step by step</h2>
            </div>
            <ol className="grid gap-3 sm:grid-cols-2">
              {rules.map(({ title, description, icon: Icon }, index) => (
                <li
                  key={title}
                  className="group flex min-h-36 gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_6px_22px_rgba(15,23,42,0.035)] transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-[0_12px_28px_rgba(15,23,42,0.07)] sm:p-5"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-800 transition-colors group-hover:bg-violet-100">
                    <Icon size={19} aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-amber-700">Step {index + 1}</p>
                    <h2 className="mt-1 text-sm font-bold text-slate-950 sm:text-base">
                      {title}
                    </h2>
                    <p className="mt-1.5 text-xs leading-6 text-slate-600 sm:text-sm">{description}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-6 flex flex-col gap-5 overflow-hidden rounded-2xl bg-slate-950 p-5 text-white shadow-[0_16px_40px_rgba(15,23,42,0.12)] sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-6">
              <div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-amber-400" aria-hidden="true" />
                  <h2 className="text-base font-semibold">Ready to get started?</h2>
                </div>
                <p className="mt-1.5 max-w-xl text-sm leading-6 text-slate-300">
                  Find an open competition and check its requirements before preparing an entry.
                </p>
              </div>
              <Link
                href="/competitions"
                className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition-colors hover:bg-violet-50"
              >
                View competitions <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
