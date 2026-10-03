'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CompetitionsSection } from '@/components/landing/CompetitionsSection';
import { GuidelinesSection } from '@/components/landing/GuidelinesSection';

export default function CompetitionsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <CompetitionsSection />
        <GuidelinesSection />
      </main>
      <Footer />
    </>
  );
}
