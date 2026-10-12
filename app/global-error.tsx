'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error('[application root error]', error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'Arial, sans-serif', background: '#fffaf1', color: '#0f172a' }}>
        <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: 'radial-gradient(ellipse at 72% 28%, rgba(255,194,135,.48), transparent 42%), radial-gradient(ellipse at 10% 0%, rgba(255,230,170,.45), transparent 35%), #fffaf1' }}>
          <section style={{ width: '100%', maxWidth: 480, border: '1px solid rgba(255,255,255,.85)', borderRadius: 32, padding: 36, background: 'rgba(255,255,255,.92)', textAlign: 'center', boxShadow: '0 24px 80px rgba(124,45,18,.12)' }}>
            <p style={{ color: '#9a3412', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.16em' }}>
              Agradhi Media Unit
            </p>
            <h1 style={{ marginTop: 10, fontSize: 28 }}>We couldn&apos;t load this page.</h1>
            <p style={{ color: '#475569', lineHeight: 1.7 }}>Please try again. If the problem continues, return home and try later.</p>
            <button
              type="button"
              onClick={() => unstable_retry()}
              style={{ marginTop: 12, border: 0, borderRadius: 999, padding: '13px 22px', color: '#fff', background: '#9a3412', fontWeight: 700, cursor: 'pointer' }}
            >
              Try again
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
