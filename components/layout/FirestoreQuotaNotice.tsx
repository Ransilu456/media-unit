import Link from 'next/link';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { MEDIA_UNIT_INFO } from '@/lib/constants';

export function FirestoreQuotaNotice() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <section className="w-full max-w-lg rounded-3xl border border-amber-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
          <AlertTriangle size={28} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Service temporarily unavailable</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Firestore has reached its daily usage limit. Your data has not been deleted, but some
          application features may be unavailable until the limit resets.
        </p>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          Limits usually reset within 24 hours. If the service is still unavailable after that,
          contact the Agradhi administrator at{' '}
          <a className="font-semibold text-slate-700 underline" href={`mailto:${MEDIA_UNIT_INFO.email}`}>
            {MEDIA_UNIT_INFO.email}
          </a>
          .
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Home size={15} /> Home page
          </Link>
          <a
            href="/test"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <RefreshCw size={15} /> Try again
          </a>
        </div>
      </section>
    </main>
  );
}