import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CompetitionsSection } from '@/components/landing/CompetitionsSection';

export default function CompetitionsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <CompetitionsSection />
      </main>
      <Footer />
    </>
  );
}
