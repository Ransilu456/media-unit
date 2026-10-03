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
      title: 'Drive Link Permissions',
      desc: 'All Google Drive submission folders must be set to "Anyone with the link can view". Broken or private links cannot be evaluated by the jury.',
      icon: FolderLock,
    },
    {
      title: 'School Endorsement Letter',
      desc: 'Each participating delegation must obtain the signature of the Principal or Media Teacher-in-Charge on the official school declaration form.',
      icon: FileCheck2,
    },
    {
      title: 'Authenticity & Anti-Plagiarism',
      desc: 'All artwork, scripts, photography, and video footage must be original work produced by currently enrolled students. Unauthorized AI-generated submissions will be disqualified.',
      icon: ShieldAlert,
    },
    {
      title: 'Deadline Compliance',
      desc: 'Submissions portal closes strictly at 23:59 on the indicated dates. No late submissions will be accepted through email or direct message.',
      icon: CalendarDays,
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900 border-t border-slate-800">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          {/* Left Column — Header */}
          <div className="space-y-4">
            <span className="text-amber-500 font-bold tracking-[0.2em] text-xs uppercase block font-mono">
              Official Regulations
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
              Competition Guidelines & Standards
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed font-light">
              Please review all technical requirements and compliance standards before lodging official entries on behalf of your school media circle.
            </p>
            <div className="pt-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 px-5 py-2.5 rounded transition-colors shadow-sm"
              >
                <span>Register Your Delegation</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Right Column — Rule Cards */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {rules.map((rule, idx) => {
              const Icon = rule.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3 hover:bg-white/10 hover:border-amber-500/30 transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-600/10 border border-amber-500/20 flex items-center justify-center">
                    <Icon size={18} className="text-amber-400" />
                  </div>
                  <h4 className="text-base font-serif font-bold text-white">
                    {rule.title}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {rule.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
