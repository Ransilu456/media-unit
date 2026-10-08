'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, Moon, Sun } from 'lucide-react';

export function AuthPageShell({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(false);

  return (
    <div className="auth-shell" data-theme={dark ? 'dark' : 'light'}>
      <div className="auth-toolbar">
        <Link href="/" className="auth-back">
          <ArrowLeft size={15} />
          Back to home
        </Link>
        <button
          type="button"
          className="auth-theme-toggle"
          onClick={() => setDark((current) => !current)}
          aria-label={`Switch to ${dark ? 'light' : 'dark'} mode`}
          title={`Switch to ${dark ? 'light' : 'dark'} mode`}
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
      <main className="auth-main">
        <div className="auth-main-content">{children}</div>
      </main>
    </div>
  );
}
