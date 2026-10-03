'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { CompetitionsSection } from '@/components/landing/CompetitionsSection';
import { RecentWorksSection } from '@/components/landing/RecentWorksSection';

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <CompetitionsSection />
        <RecentWorksSection />
      </main>
      <Footer />
    </>
  );
}