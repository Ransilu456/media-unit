'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { FIRESTORE_QUOTA_EXCEEDED_EVENT } from '@/lib/firestoreErrors';

export function FirestoreQuotaGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  useEffect(() => {
    const markQuotaExceeded = () => setQuotaExceeded(true);
    window.addEventListener(FIRESTORE_QUOTA_EXCEEDED_EVENT, markQuotaExceeded);
    return () => window.removeEventListener(FIRESTORE_QUOTA_EXCEEDED_EVENT, markQuotaExceeded);
  }, []);

  if (!quotaExceeded || pathname === '/') return children;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <section className="w-full max-w-lg rounded-3xl border border-amber-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
          <AlertTriangle size={28} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Service temporarily unavailable</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          The application has reached a Firebase Firestore usage limit. Your data has not been
          deleted. Please try again later, or contact the Agradhi administrator if this continues.
        </p>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          The home page remains available. Repeatedly refreshing this page will not restore the
          Firestore quota.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Home size={15} /> Home page
          </Link>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <RefreshCw size={15} /> Try again
          </button>
        </div>
      </section>
    </main>
  );
}
