import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import {
  CalendarDays,
  FileCheck2,
  FolderLock,
  GraduationCap,
  ShieldAlert,
  Trophy,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Rules & Regulations | Agradhi Media Unit',
  description: 'Competition eligibility, entry requirements, and submission rules for the Agradhi Media Unit.',
};

const rules = [
  {
    title: 'Eligibility and competition tracks',
    description:
      'Entries must be created by current students. Check each competition track for its eligible grades or age range, language, deadline, and maximum number of entries per school.',
    icon: GraduationCap,
  },
  {
    title: 'Original work',
    description:
      'Submit original student work. Copied work and AI-generated work are not allowed.',
    icon: ShieldAlert,
  },
  {
    title: 'School approval',
    description:
      'Get your principal or teacher-in-charge to sign the school approval form before submitting an entry.',
    icon: FileCheck2,
  },
  {
    title: 'Submission link access',
    description:
      'Provide a working Google Drive link and set its sharing permission to “Anyone with the link can view.” Private or broken links cannot be opened by judges.',
    icon: FolderLock,
  },
  {
    title: 'Deadlines and entry limits',
    description:
      'Submit before the deadline shown for your competition track. Late entries will not be accepted, and each school must stay within that track’s entry limit.',
    icon: CalendarDays,
  },
];

export default function RulesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-800">
      <Navbar />
      <main className="flex-1">
        <section className="border-b border-slate-100 bg-slate-50 py-16 md:py-20">
          <div className="mx-auto max-w-5xl px-6">
            <p className="mb-3 text-sm font-semibold text-amber-700">
              Agradhi Media Unit
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Rules &amp; Regulations
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Please review these requirements and the details listed for your
              chosen competition track before submitting an entry.
            </p>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="mx-auto max-w-5xl px-6">
            <div className="grid gap-5 md:grid-cols-2">
              {rules.map(({ title, description, icon: Icon }, index) => (
                <article
                  key={title}
                  className={`rounded-2xl border border-slate-200 bg-white p-6 ${index === rules.length - 1 ? 'md:col-span-2' : ''
                    }`}
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                    <Icon size={19} aria-hidden="true" />
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {description}
                  </p>
                </article>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-4 rounded-2xl bg-slate-900 p-6 text-white sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2 font-semibold">
                  <Trophy size={17} className="text-amber-400" aria-hidden="true" />
                  <h2>Ready to explore the tracks?</h2>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Review each track’s eligibility, guidelines, deadline, and entry limit.
                </p>
              </div>
              <Link
                href="/competitions"
                className="inline-flex shrink-0 items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-100"
              >
                View competitions
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
