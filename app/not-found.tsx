import Link from 'next/link';
import { ArrowRight, Home, SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#fffaf1] px-4 py-12">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_72%_28%,rgba(255,194,135,0.48),transparent_42%),radial-gradient(ellipse_at_10%_0%,rgba(255,230,170,0.45),transparent_35%)]" />
      <section className="w-full max-w-xl rounded-[2rem] border border-white/80 bg-white/90 p-8 text-center shadow-[0_24px_80px_rgba(124,45,18,0.12)] backdrop-blur-sm sm:p-12">
        <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[1.7rem] bg-orange-100 text-orange-800">
          <span aria-hidden="true" className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-amber-300" />
          <SearchX size={32} />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-800">Error 404</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">This page is off the map.</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-600">
          We couldn&apos;t find that page. The address may be wrong, or the page may have moved.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-orange-800 px-5 text-sm font-semibold text-white transition hover:bg-orange-900"
          >
            <Home size={15} /> Go to home
          </Link>
          <Link
            href="/competitions"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-orange-200 hover:bg-orange-50"
          >
             Browse competitions <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </main>
  );
}
