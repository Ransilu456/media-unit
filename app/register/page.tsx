'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SchoolRegisterForm } from '@/components/forms/SchoolRegisterForm';

export default function RegisterPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8">
        <SchoolRegisterForm />
      </main>
      <Footer />
    </>
  );
}
