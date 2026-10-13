'use client';

import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import { usePathname, useRouter } from 'next/navigation';

export const SPLASH_SESSION_KEY = 'agradhi_media_splash_viewed_v1';

export interface MediaSplashScreenProps {
  forceShow?: boolean;
  onFinish?: () => void;
}

export function MediaSplashScreen({ forceShow = false, onFinish }: MediaSplashScreenProps) {
  const pathname = usePathname();
  const router = useRouter();
  const splashRef = useRef<HTMLDivElement>(null);

  const [dismissed, setDismissed] = useState(false);
  const [fading, setFading] = useState(false);

  const isTestRoute = pathname.startsWith('/test') || forceShow;
  const isAuthOrAdmin =
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/dashboard');

  useEffect(() => {
    if (!forceShow && isAuthOrAdmin) {
      document.documentElement.classList.add('no-splash');
      document.documentElement.classList.remove('splash-active');
      return;
    }

    try {
      if (!forceShow && !isAuthOrAdmin) {
        const alreadyShown = window.sessionStorage.getItem(SPLASH_SESSION_KEY);
        if (alreadyShown) {
          document.documentElement.classList.add('no-splash');
          document.documentElement.classList.remove('splash-active');
          return;
        }

        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (mediaQuery.matches) {
          window.sessionStorage.setItem(SPLASH_SESSION_KEY, 'true');
          document.documentElement.classList.add('no-splash');
          document.documentElement.classList.remove('splash-active');
          return;
        }
      }

      // Splash is active
      document.documentElement.classList.remove('no-splash');
      document.documentElement.classList.add('splash-active');

      try {
        router.prefetch('/competitions');
        router.prefetch('/rules');
        router.prefetch('/login');
      } catch {
        // ignore
      }

      const fadeTimer = setTimeout(() => {
        setFading(true);
      }, 4650);

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
      }, 5000);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(dismissTimer);
      };
    } catch {
      document.documentElement.classList.add('no-splash');
      document.documentElement.classList.remove('splash-active');
    }
  }, [pathname, forceShow, router, isAuthOrAdmin, isTestRoute, onFinish]);

  useEffect(() => {
    if (!splashRef.current || (isAuthOrAdmin && !forceShow)) return;

    const animation = gsap.fromTo(
      splashRef.current.querySelectorAll('[data-splash-word]'),
      { autoAlpha: 0, y: 12 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 1,
        stagger: 0.42,
        ease: 'power2.out',
      }
    );

    return () => {
      animation.kill();
    };
  }, [forceShow, isAuthOrAdmin, pathname]);

  if ((dismissed || isAuthOrAdmin) && !forceShow) return null;

  const sinhalaWords = 'පඤ්ඥා ධයාති රථනං'.split(' ');
  const englishWords = 'Wisdom is a precious jewel.'.split(' ');

  return (
    <div
      ref={splashRef}
      id="agradhi-splash-root"
      role="status"
      aria-label="පඤ්ඥා ධයාති රථනං. Wisdom is a precious jewel."
      aria-live="polite"
      className={`fixed inset-0 z-99999 flex items-center justify-center bg-[#081426] px-6 text-center text-white transition-opacity duration-300 ease-out select-none ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex w-full max-w-[96vw] flex-col items-center gap-8 sm:gap-12">
        <p className="flex flex-wrap justify-center gap-x-4 gap-y-2 font-serif text-[clamp(2.75rem,10vw,8rem)] leading-[1.35] text-white sm:gap-x-8">
          {sinhalaWords.map((word, index) => (
            <span key={`si-${index}`} data-splash-word className="inline-block">
              {word}
            </span>
          ))}
        </p>
        <p className="flex flex-wrap justify-center gap-x-2.5 gap-y-1 font-serif text-[clamp(1.5rem,4.5vw,3.5rem)] leading-relaxed tracking-[0.08em] text-slate-300 sm:gap-x-4">
          {englishWords.map((word, index) => (
            <span key={`en-${index}`} data-splash-word className="inline-block">
              {word}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}
