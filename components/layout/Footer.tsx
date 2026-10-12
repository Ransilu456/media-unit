'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MEDIA_UNIT_INFO } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white py-12 text-slate-500 text-xs">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-5 sm:flex-row sm:px-8">
        
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-200/80 p-1 flex items-center justify-center">
            <Image src="/Agradhi.png" alt="Agradhi Media Unit" width={22} height={22} className="object-contain" />
          </div>
          <div>
            <p className="font-semibold text-slate-800">{MEDIA_UNIT_INFO.name}</p>
            <p className="text-[11px] text-slate-400">{MEDIA_UNIT_INFO.institution}</p>
          </div>
        </div>

        {/* Links */}
        <nav aria-label="Footer navigation" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-center font-medium text-slate-500">
          <Link href="/competitions" className="hover:text-slate-900 transition-colors">
            Competitions
          </Link>
          <Link href="/rules" className="hover:text-slate-900 transition-colors">
            Rules &amp; Regulations
          </Link>
          <Link href="/register" className="hover:text-slate-900 transition-colors">
            Register School
          </Link>
          <Link href="/login" className="hover:text-slate-900 transition-colors">
            Teacher Login
          </Link>
        </nav>

        <div className="text-center sm:text-right">
          <p className="font-medium text-slate-500 text-[11px]">
            Developed by Keshan Ransilu
          </p>
          <p className="mt-1 text-slate-400 text-[11px]">
            © 2026 {MEDIA_UNIT_INFO.name}.
          </p>
        </div>
      </div>
    </footer>
  );
}