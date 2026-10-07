'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  FileCheck2,
  FolderLock,
  CalendarDays,
  ArrowRight,
} from 'lucide-react';

export function GuidelinesSection() {
  const rules = [
    {
      title: 'Share your work',
      desc: 'Set your Google Drive link so anyone with the link can view it. Judges cannot open private or broken links.',
      icon: FolderLock,
    },
    {
      title: 'Get school approval',
      desc: 'Ask your principal or teacher-in-charge to sign the school approval form.',
      icon: FileCheck2,
    },
    {
      title: 'Send original work',
      desc: 'Entries must be made by current students. Copied or AI-generated work is not allowed.',
      icon: ShieldAlert,
    },
    {
      title: 'Submit on time',
      desc: 'Send your entry before the deadline. Late entries will not be accepted.',
      icon: CalendarDays,
    },
  ];

  return (
    <section className="border-t border-slate-200 bg-slate-50 py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-8 max-w-2xl">
          <p className="mb-3 text-sm font-semibold text-amber-700">Before you enter</p>
          <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">
            Competition guidelines
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Read these rules before sending an entry for your school.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {rules.map((rule) => {
            const Icon = rule.icon;
            return (
              <div key={rule.title} className="border-t border-slate-300 pt-4">
                <div className="mb-2 flex items-center gap-2 text-slate-700">
                  <Icon size={17} className="text-amber-700" />
                  <h3 className="text-base font-semibold">{rule.title}</h3>
                </div>
                <p className="text-sm leading-6 text-slate-600">{rule.desc}</p>
              </div>
            );
          })}
        </div>
        <Link
          href="/register"
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-amber-600 px-5 py-3 text-sm font-semibold text-white hover:bg-amber-700"
        >
          Register your school <ArrowRight size={15} />
        </Link>
      </div>
    </section>
  );
}
