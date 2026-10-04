'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MEDIA_UNIT_INFO } from '@/lib/constants';
import { Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 border-t-4 border-amber-600 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4">

          {/* Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-950 border border-amber-500 p-0.5 shrink-0">
              <Image src="/Agradhi.png" alt="Agradhi Media Unit" width={30} height={30} className="object-contain" />
            </div>
            <div>
              <p className="text-sm font-serif font-semibold text-white leading-none">{MEDIA_UNIT_INFO.name}</p>
              <p className="text-[10px] text-amber-500 font-mono mt-0.5">{MEDIA_UNIT_INFO.institution}</p>
            </div>
          </div>

          {/* Contact info */}
          <div className="flex flex-wrap justify-center md:justify-end items-center gap-x-5 gap-y-1 text-xs font-mono">
            <span className="flex items-center gap-1.5">
              <MapPin size={11} className="text-amber-500 shrink-0" />
              {MEDIA_UNIT_INFO.address}
            </span>
            <span className="flex items-center gap-1.5">
              <Mail size={11} className="text-amber-500 shrink-0" />
              {MEDIA_UNIT_INFO.email}
            </span>
            <span className="flex items-center gap-1.5">
              <Phone size={11} className="text-amber-500 shrink-0" />
              {MEDIA_UNIT_INFO.hotline}
            </span>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} {MEDIA_UNIT_INFO.name} · {MEDIA_UNIT_INFO.institution}. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <Link href="/competitions" className="hover:text-amber-400 transition-colors">Competitions</Link>
            <span>·</span>
            <Link href="/register" className="hover:text-amber-400 transition-colors">Register School</Link>
            <span>·</span>
            <Link href="/login?tab=admin" className="hover:text-amber-400 transition-colors">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}