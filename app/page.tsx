import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/landing/HeroSection';
import { HomePreview } from '@/components/landing/HomePreview';
import { RecentWorksSection } from '@/components/landing/RecentWorksSection';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <HomePreview />
        <RecentWorksSection />
      </main>
      <Footer />
    </div>
  );
}