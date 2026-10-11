'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { FIRESTORE_QUOTA_EXCEEDED_EVENT } from '@/lib/firestoreErrors';

export function FirestoreQuotaGuard({
  children,
  quotaNotice,
}: {
  children: ReactNode;
  quotaNotice: ReactNode;
}) {
  const pathname = usePathname();
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  useEffect(() => {
    const markQuotaExceeded = () => setQuotaExceeded(true);
    window.addEventListener(FIRESTORE_QUOTA_EXCEEDED_EVENT, markQuotaExceeded);
    return () => window.removeEventListener(FIRESTORE_QUOTA_EXCEEDED_EVENT, markQuotaExceeded);
  }, []);

  if (!quotaExceeded || pathname === '/') return children;

  return quotaNotice;
}
