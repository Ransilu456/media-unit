'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error('[application route error]', error);
  }, [error]);

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#fffaf1] px-4 py-12">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_72%_28%,rgba(255,194,135,0.48),transparent_42%),radial-gradient(ellipse_at_10%_0%,rgba(255,230,170,0.45),transparent_35%)]" />
      <section className="w-full max-w-lg rounded-[2rem] border border-white/80 bg-white/90 p-8 text-center shadow-[0_24px_80px_rgba(124,45,18,0.12)] backdrop-blur-sm sm:p-10">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-orange-100 text-orange-800">
          <AlertTriangle size={30} />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-800">Agradhi Media Unit</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">We couldn&apos;t load this page.</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-600">
          Please try again. If the problem continues, return home and try later.
        </p>
        {error.digest && (
          <p className="mt-3 text-xs text-slate-400">Reference: {error.digest}</p>
        )}
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => unstable_retry()}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-orange-800 px-5 text-sm font-semibold text-white transition hover:bg-orange-900"
          >
            <RefreshCw size={15} /> Try again
          </button>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition hover:border-orange-200 hover:bg-orange-50"
          >
            <Home size={15} /> Go to home
          </Link>
        </div>
      </section>
    </main>
  );
}
