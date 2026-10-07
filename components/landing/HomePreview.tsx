'use client';

import React from 'react';
import Link from 'next/link';
import { useMediaStore } from '@/lib/store';
import {
  ArrowRight,
  FileCheck2,
  UploadCloud,
  Award,
} from 'lucide-react';

export function HomePreview() {
  const { competitions } = useMediaStore();
  const previewComps = competitions.slice(0, 3);

  const steps = [
    {
      num: '01',
      title: 'School Registration',
      desc: 'The teacher-in-charge registers the school delegation once with official contact details.',
      icon: FileCheck2,
    },
    {
      num: '02',
      title: 'Online Submission',
      desc: 'Submit student work links (Google Drive, YouTube) with automatic age and grade validation.',
      icon: UploadCloud,
    },
    {
      num: '03',
      title: 'National Honours',
      desc: 'Entries are reviewed by national media professionals and celebrated at Saranath College.',
      icon: Award,
    },
  ];

  return (
    <div className="bg-slate-50/50 py-20 border-t border-slate-100">
      <div className="max-w-5xl mx-auto px-6 space-y-24">
        
        {/* Section 1: Featured Tracks */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">
                Featured Categories
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Competition Tracks
              </h2>
            </div>
            <Link
              href="/competitions"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-slate-950 transition-colors"
            >
              <span>Explore all {competitions.length} tracks</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {previewComps.map((comp) => (
              <Link
                key={comp.id}
                href="/competitions"
                className="group rounded-2xl bg-white p-6 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:border-slate-200 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      {comp.category}
                    </span>
                    {comp.medium && comp.medium !== 'None' && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-slate-600">
                        {comp.medium}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-700 transition-colors mb-2 leading-snug">
                    {comp.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-6">
                    {comp.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400">
                  <span>Due {comp.deadline}</span>
                  <span className="font-semibold text-slate-700 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    Details <ArrowRight size={12} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Section 2: 3 Simple Steps */}
        <div>
          <div className="text-center max-w-xl mx-auto mb-12">
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">
              Simple Workflow
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              How Schools Participate
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="rounded-2xl bg-white p-7 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <span className="text-xs font-mono font-bold text-slate-300">
                        {step.num}
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700">
                        <Icon size={18} />
                      </div>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
