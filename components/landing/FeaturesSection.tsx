'use client';

import React from 'react';
import Link from 'next/link';
import {
  FileText,
  FileCheck2,
  Users,
  Award,
  ArrowRight,
  Download,
  Sparkles,
  CheckCircle,
} from 'lucide-react';

export function FeaturesSection() {
  const steps = [
    {
      num: '01',
      title: 'School Registration',
      desc: 'The teacher-in-charge completes a simple 3-step registration to establish the school’s official delegation profile.',
      icon: FileCheck2,
      badge: 'Step 1',
    },
    {
      num: '02',
      title: 'Digital Submission',
      desc: 'Submit student work links (Google Drive / YouTube) with real-time age verification and track medium matching.',
      icon: FileText,
      badge: 'Step 2',
    },
    {
      num: '03',
      title: 'Panel Evaluation',
      desc: 'Jury of veteran broadcasters and filmmakers review entries strictly against national judging criteria.',
      icon: Users,
      badge: 'Step 3',
    },
    {
      num: '04',
      title: 'Grand Assembly Awards',
      desc: 'Selected schools receive invitations to the prestigious All-Island Awards Assembly at Saranath College.',
      icon: Award,
      badge: 'Step 4',
    },
  ];

  const guidelines = [
    {
      title: 'Official Bylaws & General Rules',
      desc: 'Full competition rules for Sinhala & English tracks',
      tag: 'PDF Guide',
    },
    {
      title: 'Teacher Endorsement Protocol',
      desc: 'Sample authorization letter and verification template',
      tag: 'School Doc',
    },
    {
      title: 'Cinematography & Audio Standards',
      desc: 'Recommended codecs, aspect ratios, and loudness guidelines',
      tag: 'Technical Spec',
    },
    {
      title: 'Digital Art & Photography Specs',
      desc: 'Resolution standards and submission format checklist',
      tag: 'Checklist',
    },
  ];

  return (
    <section className="bg-white py-20 border-b border-slate-200" id="workflow">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles size={13} className="text-amber-600" />
            <span>Structured & Transparent Process</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How Schools Take Part in Agradhi 2026
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
            Follow this clear 4-stage roadmap designed for teachers-in-charge and student media delegations.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-16">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="relative rounded-2xl border border-slate-200 bg-slate-50/70 p-6 transition-all hover:bg-white hover:border-amber-300 hover:shadow-md group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                      {step.badge}
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-700 shadow-xs group-hover:bg-amber-600 group-hover:text-white group-hover:border-amber-600 transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Official Reference Documents Box */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950 text-white p-8 sm:p-10 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-5 space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Official Resources</span>
              <h3 className="text-2xl font-bold text-white tracking-tight">Competition Guidelines & Materials</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Download the verified bylaws, code of conduct, and submission specifications provided by the Agradhi Executive Board.
              </p>
              <div className="pt-2">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 text-xs font-bold transition-colors shadow-xs"
                >
                  <span>Register School Account</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {guidelines.map((doc, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:border-amber-500/50 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-xs font-bold text-white leading-snug">{doc.title}</h4>
                    <span className="text-[10px] font-mono uppercase bg-slate-950 px-2 py-0.5 rounded text-amber-300 shrink-0">
                      {doc.tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{doc.desc}</p>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
