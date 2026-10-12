import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ArrowRight, CheckCircle2, FileText, Link2, School, Trophy } from 'lucide-react';

export const metadata: Metadata = {
  title: 'How to Enter | Agradhi Media Unit',
  description: 'A clear guide to school registration, competition requirements, and submitting student media entries.',
};

const steps = [
  {
    title: 'Register your school',
    description: 'A teacher or school media leader creates one account for the school. An administrator must approve it before sign-in and submissions are enabled.',
    detail: 'One account for your school',
    icon: School,
    color: 'bg-orange-100 text-orange-800',
  },
  {
    title: 'Choose a competition',
    description: 'Check the competition page for eligible grades, language, closing date, and how many entries your school may submit.',
    detail: 'Check the entry requirements',
    icon: Trophy,
    color: 'bg-amber-100 text-amber-900',
  },
  {
    title: 'Prepare the student entry',
    description: 'Submit one student’s work at a time. Enter their details, give the work a title, and complete any questions required for that competition.',
    detail: 'One student per entry',
    icon: FileText,
    color: 'bg-amber-100 text-amber-800',
  },
  {
    title: 'Share a viewable link',
    description: 'Add a link to the finished work. For Drive, YouTube, or OneDrive, check the sharing settings so the review team can open it.',
    detail: 'Test the link before submitting',
    icon: Link2,
    color: 'bg-emerald-100 text-emerald-800',
  },
];

export default function RulesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#fffaf1] text-slate-800">
      <Navbar />
      <main className="flex-1">

        <section className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
          <div className="mb-7">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-800">The entry process</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Four steps to submit</h2>
          </div>

          <ol className="grid gap-4 md:grid-cols-2">
            {steps.map(({ title, description, detail, icon: Icon, color }, index) => (
              <li key={title} className="relative rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.04)] sm:p-6">
                <div className="flex items-start gap-4">
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${color}`}>
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Step {index + 1}</p>
                    <h3 className="mt-1 text-base font-bold text-slate-950">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
                    <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 text-[11px] font-semibold text-slate-700">
                      <CheckCircle2 size={13} className="text-emerald-700" />
                      {detail}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>

          <aside className="mt-6 flex flex-col gap-4 rounded-3xl bg-orange-950 p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-orange-200">Ready to begin?</p>
              <h2 className="mt-1 text-lg font-bold">Find the right competition for your students.</h2>
              <p className="mt-1 text-sm leading-6 text-orange-100/80">Each competition lists its own requirements and closing date.</p>
            </div>
            <Link
              href="/competitions"
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-orange-950 transition hover:bg-orange-50"
            >
              View competitions <ArrowRight size={15} />
            </Link>
          </aside>
        </section>
      </main>
      <Footer />
    </div>
  );
}
