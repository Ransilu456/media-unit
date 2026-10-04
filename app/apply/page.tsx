'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { StudentEntryForm } from '@/components/forms/StudentEntryForm';
import { Trophy, Info } from 'lucide-react';

export default function ApplyPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-slate-50">
        {/* Page header */}
        <div className="bg-slate-900 py-10 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-amber-600/20 text-amber-400 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full mb-4">
              <Trophy size={12} /> Open For Applications
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-3">
              Apply for a Competition
            </h1>
            <p className="text-slate-400 text-sm max-w-lg mx-auto">
              Fill in the form below to enter any competition at the Agradhi Media Assembly 2026. No login needed — just complete the form!
            </p>
          </div>
        </div>

        {/* Info strip */}
        <div className="bg-amber-50 border-b border-amber-200 py-3 px-4">
          <div className="max-w-3xl mx-auto flex items-center gap-2 text-xs text-amber-800">
            <Info size={13} className="shrink-0" />
            <span>
              <strong>Important:</strong> Your school must be registered before you can apply. If your school is not in the list,{' '}
              ask your teacher to{' '}
              <a href="/register" className="underline font-semibold">register the school first</a>.
            </span>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
          <StudentEntryForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
