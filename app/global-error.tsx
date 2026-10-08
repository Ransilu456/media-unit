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
      <body style={{ margin: 0, fontFamily: 'Arial, sans-serif', background: '#f8fafc', color: '#0f172a' }}>
        <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
          <section style={{ width: '100%', maxWidth: 480, border: '1px solid #e2e8f0', borderRadius: 24, padding: 32, background: '#fff', textAlign: 'center' }}>
            <p style={{ color: '#b45309', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              Application error
            </p>
            <h1>We couldn&apos;t load Agradhi Media Unit</h1>
            <p>Please try again. If the problem continues, return later.</p>
            <button
              type="button"
              onClick={() => unstable_retry()}
              style={{ border: 0, borderRadius: 12, padding: '12px 18px', color: '#fff', background: '#0f172a', fontWeight: 700, cursor: 'pointer' }}
            >
              Try again
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
