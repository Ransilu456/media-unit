'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AdminDashboardView } from '@/components/admin/AdminDashboardView';

export default function AdminPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 py-10">
        <AdminDashboardView />
      </main>
      <Footer />
    </>
  );
}
