'use client';

import React from 'react';
import Link from 'next/link';
import {
  FileText,
  FileCheck2,
  Users,
  Award,
  Download,
  ArrowRight,
} from 'lucide-react';

export function FeaturesSection() {
  const steps = [
    {
      num: '01',
      title: 'School Media Unit Registration',
      desc: 'Register your school media circle with Teacher-in-Charge credentials to receive an official delegation code.',
      icon: FileCheck2,
    },
    {
      num: '02',
      title: 'Online Entry Submission',
      desc: 'Fill category-specific entry forms for Short Film, Photography, Announcing, Radio, and Graphic Design with Drive links.',
      icon: FileText,
    },
    {
      num: '03',
      title: 'Technical Adjudication',
      desc: 'External jury of broadcast professionals reviews and evaluates all entries in accordance with national media guidelines.',
      icon: Users,
    },
    {
      num: '04',
      title: 'Grand Media Day Assembly',
      desc: 'Shortlisted delegations receive formal invitations to the awards ceremony and exhibition at Saranath Auditorium.',
      icon: Award,
    },
  ];

  const documents = [
    { title: 'General Competition Regulations', lang: 'ENGLISH & SINHALA' },
    { title: 'Teacher Endorsement Declaration Form', lang: 'OFFICIAL SLIP' },
    { title: 'Short Film & Cinema Technical Guide', lang: '1080P FHD / 4K' },
    { title: 'Photography RAW EXIF Specification', lang: 'SALON RULES' },
  ];

  return (
    <section className="py-24 bg-slate-50 relative overflow-hidden" id="workflow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-14">
          <span className="text-amber-600 font-bold tracking-[0.2em] text-xs uppercase block mb-3 font-mono">
            Structured Delegation Workflow
          </span>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-slate-900 tracking-tight mb-4">
            How Outer Schools Participate
          </h2>
          <p className="text-slate-600 text-base max-w-2xl font-light">
            Our structured entry process ensures a fair and comprehensive evaluation of every school media unit candidate across Sri Lanka.
          </p>
        </div>

        {/* 2-Column Layout matching Admissions 2025 in sara-by-keshan */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left 4 Step Cards */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="bg-white border border-slate-200/90 p-8 rounded-3xl relative shadow-sm hover:shadow-xl hover:border-amber-300 transition-all flex flex-col justify-between group"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-900/10">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="font-serif font-bold text-4xl text-amber-500/30 group-hover:text-amber-500/50 transition-colors">
                      {step.num}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-serif font-bold text-xl text-slate-900 mb-2 group-hover:text-amber-700 transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Dark Navy Document Sidebar matching sara-by-keshan admissions */}
          <div className="lg:col-span-4 bg-slate-900 text-white p-8 rounded-3xl shadow-xl flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-serif font-semibold text-white mb-2">
                Official Rulebooks & Forms
              </h3>
              <p className="text-xs text-slate-300 mb-6 font-light leading-relaxed">
                Get all official 2026 competition documents. Ensure your delegation reads the relevant rules before submitting.
              </p>

              <div className="space-y-3">
                {documents.map((doc, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-white group-hover:text-amber-300 transition-colors">
                          {doc.title}
                        </p>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {doc.lang}
                        </span>
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-slate-400 group-hover:text-white shrink-0" />
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8">
              <Link
                href="/register"
                className="w-full py-3.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-900/30 transition-colors"
              >
                <span>Register School Delegation</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
