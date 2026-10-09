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
  const [preloadStatus, setPreloadStatus] = useState('Initializing portal...');

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
    }, 300);
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

      // Splash is active - guarantee classes are applied
      document.documentElement.classList.remove('no-splash');
      document.documentElement.classList.add('splash-active');

      if (typeof document !== 'undefined' && 'fonts' in document) {
        setPreloadStatus('Loading collegiate typography...');
        document.fonts.load('400 16px Poppins').catch(() => {});
        document.fonts.load('600 16px Poppins').catch(() => {});
      }

      const imagesToWarm = ['/Agradhi.png', '/hero-studio.jpg', '/apple-touch-icon.png'];
      imagesToWarm.forEach((src) => {
        try {
          const img = new window.Image();
          img.src = src;
        } catch {
          // ignore
        }
      });

      try {
        router.prefetch('/competitions');
        router.prefetch('/rules');
        router.prefetch('/login');
      } catch {
        // ignore
      }

      const t1 = setTimeout(() => {
        setPreloadStatus('Caching brand & studio media...');
      }, 500);

      const t2 = setTimeout(() => {
        setPreloadStatus('Preparing competition tracks...');
      }, 1000);

      const t3 = setTimeout(() => {
        setPreloadStatus('Welcome to Agradhi Media Unit');
        setFading(true);
      }, 1800);

      const t4 = setTimeout(() => {
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
      }, 2250);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
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
      className={`fixed inset-0 z-[99999] flex items-center justify-center bg-slate-50/98 backdrop-blur-md transition-opacity duration-400 ease-out select-none cursor-pointer ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        background:
          'radial-gradient(ellipse at 50% 40%, rgba(217, 119, 6, 0.08), transparent 70%), #f8fafc',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative mx-4 flex w-full max-w-sm flex-col items-center rounded-3xl border border-slate-200/90 bg-white p-8 text-center shadow-[0_20px_50px_rgba(15,23,42,0.08)] ring-1 ring-slate-100 sm:p-9"
      >
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-200/80 bg-amber-50 px-3.5 py-1 text-[11px] font-semibold text-amber-800">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-600 animate-pulse" />
          <span>Saranath College · All-Island Media Assembly 2026</span>
        </div>

        <div className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-slate-200/80 bg-slate-50 p-2.5 shadow-xs">
          <Image
            src="/Agradhi.png"
            alt="Agradhi Media Unit Crest"
            width={64}
            height={64}
            priority
            className="h-full w-full object-contain"
          />
        </div>

        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-serif">
            Agradhi Media Unit
          </h1>
          <p className="text-xs font-medium text-slate-500">
            Official All-Island Competition &amp; Broadcast Portal
          </p>
        </div>

        <div className="mt-7 w-48 overflow-hidden rounded-full border border-slate-100 bg-slate-100 p-0.5">
          <div className="h-1 rounded-full bg-gradient-to-r from-amber-600 to-amber-500 animate-[progress_1.6s_ease-out_forwards]" />
        </div>

        <p className="mt-2.5 text-[11px] font-medium text-slate-400">
          {preloadStatus}
        </p>

        <button
          type="button"
          onClick={dismissSplash}
          className="mt-5 text-[11px] font-semibold text-slate-400 hover:text-slate-700 transition-colors py-1 px-3 rounded-lg hover:bg-slate-50"
        >
          Click to enter portal
        </button>
      </div>
    </div>
  );
}
