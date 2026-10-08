import React from 'react';
import { AuthPageShell } from '@/components/layout/AuthPageShell';
import { SchoolRegisterForm } from '@/components/forms/SchoolRegisterForm';

export default function RegisterPage() {
  return (
    <AuthPageShell>
      <div className="w-full">
        <SchoolRegisterForm />
      </div>
    </AuthPageShell>
  );
}
