'use client';

import React from 'react';
import Image from 'next/image';
import { MEDIA_UNIT_INFO } from '@/lib/constants';
import { Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 border-t-4 border-amber-600 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-5 md:grid-cols-5 lg:grid-cols-5 gap-10 mb-12 ">

          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-slate-950 border-2 border-amber-500 p-1 shrink-0">
                <Image
                  src="/Agradhi.png"
                  alt="Agradhi Media Unit"
                  width={44}
                  height={44}
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="text-xl font-serif font-bold text-white tracking-tight">
                  {MEDIA_UNIT_INFO.name}
                </h3>
                <p className="text-xs text-amber-500 font-mono">
                  {MEDIA_UNIT_INFO.institution}
                </p>
              </div>
            </div>

          </div>


          <div className="lg:col-span-3">
            <div className="space-y-2 text-xs text-slate-400 pt-2 font-mono">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-amber-500 shrink-0" />
                <span>{MEDIA_UNIT_INFO.address}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="space-y-2 text-xs text-slate-400 pt-2 font-mono">
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-amber-500 shrink-0" />
                <span>{MEDIA_UNIT_INFO.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-amber-500 shrink-0" />
                <span>{MEDIA_UNIT_INFO.hotline}</span>
              </div>
            </div>
          </div>

        </div>


        {/* Bottom Bar */}
        <div className="pt-8 mt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {MEDIA_UNIT_INFO.name} of {MEDIA_UNIT_INFO.institution}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="text-slate-400 hover:text-white cursor-pointer">Terms of Participation</span>
          </div>
        </div>
      </div>
    </footer >
  );
}