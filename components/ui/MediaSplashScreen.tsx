'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';

export const SPLASH_SESSION_KEY = 'agradhi_media_splash_viewed_v1';

export interface MediaSplashScreenProps {
  forceShow?: boolean;
  onFinish?: () => void;
}

export function MediaSplashScreen({ forceShow = false, onFinish }: MediaSplashScreenProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [dismissed, setDismissed] = useState(false);
  const [fading, setFading] = useState(false);

  const isTestRoute = pathname.startsWith('/test') || forceShow;

  const dismissSplash = useCallback(() => {
    setFading(true);
    setTimeout(() => {
      setDismissed(true);
      try {
        if (!isTestRoute) {
          window.sessionStorage.setItem(SPLASH_SESSION_KEY, 'true');
        }
      } catch {
        // ignore storage errors
      }
      if (typeof document !== 'undefined') {
        document.documentElement.classList.remove('splash-active');
        document.documentElement.classList.add('no-splash');
      }
      onFinish?.();
    }, 280);
  }, [isTestRoute, onFinish]);

  useEffect(() => {
    const isAuthOrAdmin =
      pathname.startsWith('/login') ||
      pathname.startsWith('/register') ||
      pathname.startsWith('/admin') ||
      pathname.startsWith('/dashboard');

    if (!forceShow && isAuthOrAdmin) {
      setDismissed(true);
      document.documentElement.classList.add('no-splash');
      document.documentElement.classList.remove('splash-active');
      return;
    }

    try {
      if (!forceShow && !isAuthOrAdmin) {
        const alreadyShown = window.sessionStorage.getItem(SPLASH_SESSION_KEY);
        if (alreadyShown) {
          setDismissed(true);
          document.documentElement.classList.add('no-splash');
          document.documentElement.classList.remove('splash-active');
          return;
        }

        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (mediaQuery.matches) {
          window.sessionStorage.setItem(SPLASH_SESSION_KEY, 'true');
          setDismissed(true);
          document.documentElement.classList.add('no-splash');
          document.documentElement.classList.remove('splash-active');
          return;
        }
      }

      // Splash is active
      document.documentElement.classList.remove('no-splash');
      document.documentElement.classList.add('splash-active');

      // Pre-warm essential routes & images
      try {
        router.prefetch('/competitions');
        router.prefetch('/rules');
        router.prefetch('/login');
      } catch {
        // ignore
      }

      const fadeTimer = setTimeout(() => {
        setFading(true);
      }, 950);

      const dismissTimer = setTimeout(() => {
        setDismissed(true);
        try {
          if (!isTestRoute) {
            window.sessionStorage.setItem(SPLASH_SESSION_KEY, 'true');
          }
        } catch {
          // ignore
        }
        document.documentElement.classList.remove('splash-active');
        document.documentElement.classList.add('no-splash');
        if (onFinish) onFinish();
      }, 1250);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(dismissTimer);
      };
    } catch {
      setDismissed(true);
    }
  }, [pathname, forceShow, router, isTestRoute, onFinish]);

  if (dismissed && !forceShow) return null;

  return (
    <div
      id="agradhi-splash-root"
      role="status"
      aria-label="Welcome to Agradhi Media Unit"
      aria-live="polite"
      onClick={dismissSplash}
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-slate-950 text-white transition-opacity duration-300 ease-out select-none cursor-pointer ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Subtle ambient amber backdrop glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-600/15 via-transparent to-transparent pointer-events-none" />

      <div className="relative flex flex-col items-center text-center px-6">
        {/* Crest */}
        <div className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5 p-3.5 backdrop-blur-md border border-white/10 shadow-2xl">
          <Image
            src="/Agradhi.png"
            alt="Agradhi Media Unit Crest"
            width={72}
            height={72}
            priority
            className="h-full w-full object-contain drop-shadow"
          />
        </div>

        {/* Clean typography */}
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-serif">
          Agradhi Media Unit
        </h1>
        <p className="mt-1 text-xs font-medium text-amber-300/80 tracking-wide uppercase">
          Saranath College · Media Assembly 2026
        </p>

        {/* Sleek minimal loader bar */}
        <div className="mt-6 w-36 h-1 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-full bg-gradient-to-r from-amber-500 to-amber-300 animate-[progress_1s_ease-out_forwards]" />
        </div>
      </div>
    </div>
  );
}

