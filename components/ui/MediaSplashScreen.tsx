'use client';

import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';

export const SPLASH_SESSION_KEY = 'agradhi_media_splash_viewed_v2';

const SPLASH_DURATION = 4200;
const SPLASH_FADE_START = 3800;

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

      const fadeTimer = window.setTimeout(() => {
        setFading(true);
      }, SPLASH_FADE_START);

      const dismissTimer = window.setTimeout(() => {
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
      }, SPLASH_DURATION);

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
        duration: 1.1,
        stagger: 0.18,
        ease: 'power2.out',
      }
    );

    return () => {
      animation.kill();
    };
  }, [forceShow, isAuthOrAdmin, pathname]);

  if ((dismissed || isAuthOrAdmin) && !forceShow) return null;

  return (
    <div
      ref={splashRef}
      id="agradhi-splash-root"
      role="status"
      aria-label="Agradhi Media Unit, Saranath College"
      aria-live="polite"
      className={`agradhi-splash-backdrop fixed inset-0 z-99999 flex items-center justify-center overflow-hidden px-6 text-center text-white transition-opacity duration-300 ease-out select-none ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-[min(84vw,38rem)] w-[min(84vw,38rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/4.5">
        <span className="absolute inset-[10%] rounded-full border border-white/4.5" />
        <span className="absolute inset-[21%] rounded-full border border-amber-200/[0.07]" />
      </div>

      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-200/5.5 blur-3xl sm:h-72 sm:w-72" />

      <div className="relative z-10 flex w-full flex-col items-center">
        <div data-splash-word style={{ opacity: 0, visibility: 'hidden' }} className="relative mb-8 flex h-28 w-28 items-center justify-center rounded-full border border-amber-100/35 bg-[#090f19]/85 p-2 shadow-[0_0_70px_rgba(245,158,11,0.12)] sm:mb-9 sm:h-32 sm:w-32">
          <Image
            src="/Agradhi.png"
            alt="Agradhi Media Unit logo"
            width={128}
            height={128}
            priority
            className="h-full w-full rounded-full object-contain"
          />
        </div>
        <div data-splash-word style={{ opacity: 0, visibility: 'hidden' }} className="flex flex-col items-center gap-3 text-amber-50/75">
          <span aria-hidden="true" className="h-px w-8 bg-amber-200/55" />
          <span className="text-[10px] font-medium uppercase tracking-[0.32em] sm:text-[11px]">
            Saranath College
          </span>
          <span className="text-[9px] font-medium uppercase tracking-[0.42em] text-amber-200/55">
            Media Unit
          </span>
        </div>
        </div>

        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-white/10">
          <span className="splash-progress block h-full w-full bg-linear-to-r from-amber-300 via-amber-100 to-white" />
        </div>
    </div>
  );
}
