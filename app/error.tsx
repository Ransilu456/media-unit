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
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
          <AlertTriangle size={30} />
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">Something went wrong</p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">We couldn&apos;t load this page</h1>
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
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <RefreshCw size={15} /> Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Home size={15} /> Go to home
          </Link>
        </div>
      </section>
    </main>
  );
}
