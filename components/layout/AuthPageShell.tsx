'use client';

import { useEffect, useSyncExternalStore, type ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, Moon, Sun } from 'lucide-react';

const AUTH_THEME_KEY = 'agradhi_auth_theme_v1';
const AUTH_THEME_CHANGE_EVENT = 'agradhi:auth-theme-change';

function subscribeToAuthTheme(onChange: () => void): () => void {
  window.addEventListener('storage', onChange);
  window.addEventListener(AUTH_THEME_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(AUTH_THEME_CHANGE_EVENT, onChange);
  };
}

function getAuthTheme(): 'dark' | 'light' {
  try {
    return window.localStorage.getItem(AUTH_THEME_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function getServerAuthTheme(): 'light' {
  return 'light';
}

function toggleAuthTheme(current: 'dark' | 'light'): void {
  const next = current === 'dark' ? 'light' : 'dark';
  try {
    window.localStorage.setItem(AUTH_THEME_KEY, next);
  } catch {
    // Keep the current page theme functional when storage is unavailable.
  }
  window.dispatchEvent(new Event(AUTH_THEME_CHANGE_EVENT));
}

export function AuthPageShell({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribeToAuthTheme, getAuthTheme, getServerAuthTheme);
  const dark = theme === 'dark';

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    root.setAttribute('data-theme', theme);
    body.setAttribute('data-theme', theme);

    if (dark) {
      root.classList.add('dark');
      body.classList.add('dark');
      root.style.backgroundColor = '#090a0c';
      body.style.backgroundColor = '#090a0c';
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
      root.style.backgroundColor = '#f8fafc';
      body.style.backgroundColor = '#f8fafc';
      root.style.colorScheme = 'light';
    }

    return () => {
      root.removeAttribute('data-theme');
      body.removeAttribute('data-theme');
      root.classList.remove('dark');
      body.classList.remove('dark');
      root.style.backgroundColor = '';
      body.style.backgroundColor = '';
      root.style.colorScheme = '';
    };
  }, [theme, dark]);

  return (
    <div className="auth-shell" data-theme={theme}>
      <div className="auth-toolbar">
        <Link href="/" className="auth-back">
          <ArrowLeft size={15} />
          Back to home
        </Link>
        <button
          type="button"
          className="auth-theme-toggle"
          onClick={() => toggleAuthTheme(theme)}
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
