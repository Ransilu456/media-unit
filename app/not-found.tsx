import Link from 'next/link';
import { Home, SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
          <SearchX size={30} />
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">Error 404</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">Page not found</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-600">
          This page may have moved, or the address may be incorrect.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <Home size={15} /> Go to home
          </Link>
          <Link
            href="/competitions"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
             Browse competitions
          </Link>
        </div>
      </section>
    </main>
  );
}
