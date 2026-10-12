import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CompetitionsSection } from '@/components/landing/CompetitionsSection';

export default function CompetitionsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#fbfaf7] text-slate-800">
      <Navbar />
      <main className="flex-1">
        <CompetitionsSection />
      </main>
      <Footer />
    </div>
  );
}
