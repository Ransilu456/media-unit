'use client';

import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
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
        duration: 0.8,
        stagger: 0.26,
        ease: 'power2.out',
      }
    );

    return () => {
      animation.kill();
    };
  }, [forceShow, isAuthOrAdmin, pathname]);

  if ((dismissed || isAuthOrAdmin) && !forceShow) return null;

  const sinhalaWords = 'ප්‍රඤ්ඥා ධයාති රථනං'.split(' ');
  const englishWords = 'Wisdom is a precious jewel.'.split(' ');

  return (
    <div
      ref={splashRef}
      id="agradhi-splash-root"
      role="status"
      aria-label="පඤ්ඥා ධයාති රථනං. Wisdom is a precious jewel."
      aria-live="polite"
      className={`agradhi-splash-backdrop fixed inset-0 z-99999 flex items-center justify-center overflow-hidden px-6 text-center text-white transition-opacity duration-300 ease-out select-none ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-[min(86vw,42rem)] w-[min(86vw,42rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/6">
        <span className="absolute inset-[8%] rounded-full border border-white/6" />
        <span className="absolute inset-[18%] rounded-full border border-amber-300/8" />
      </div>

      <div className="relative z-10 flex w-full max-w-[96vw] flex-col items-center">
        <div data-splash-word style={{ opacity: 0, visibility: 'hidden' }} className="mb-7 flex h-24 w-24 items-center justify-center rounded-full border border-amber-200/40 bg-[#101e49]/80 p-1.5 shadow-[0_0_50px_rgba(245,158,11,0.14)] sm:mb-8 sm:h-28 sm:w-28">
          <Image
            src="/Agradhi.png"
            alt="Agradhi Media Unit logo"
            width={112}
            height={112}
            priority
            className="h-full w-full rounded-full object-contain"
          />
        </div>
        <div data-splash-word style={{ opacity: 0, visibility: 'hidden' }} className="mb-8 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-200/85 sm:mb-10 sm:text-xs">
          <span aria-hidden="true" className="h-px w-8 bg-amber-300/60 sm:w-12" />
          Saranath College · Media Unit
          <span aria-hidden="true" className="h-px w-8 bg-amber-300/60 sm:w-12" />
        </div>
        <p aria-hidden="true" className="splash-sinhala flex flex-wrap justify-center gap-x-4 gap-y-2 text-[clamp(2.75rem,10vw,7rem)] font-semibold leading-normal text-white sm:gap-x-8">
          {sinhalaWords.map((word, index) => (
            <span key={`si-${index}`} data-splash-word style={{ opacity: 0, visibility: 'hidden' }} className="inline-block">
              {word}
            </span>
          ))}
        </p>
        <span aria-hidden="true" className="my-5 h-px w-12 bg-linear-to-r from-transparent via-amber-300/70 to-transparent sm:my-7 sm:w-16" />
        <p aria-hidden="true" className="splash-english flex flex-wrap justify-center gap-x-2.5 gap-y-1 text-[clamp(1.25rem,4.5vw,3rem)] font-medium leading-relaxed tracking-[0.06em] text-slate-300 sm:gap-x-4">
          {englishWords.map((word, index) => (
            <span key={`en-${index}`} data-splash-word style={{ opacity: 0, visibility: 'hidden' }} className="inline-block">
              {word}
            </span>
          ))}
        </p>
      </div>
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-white/10">
        <span className="splash-progress block h-full w-full bg-linear-to-r from-amber-300 via-amber-100 to-white" />
      </div>
    </div>
  );
}
