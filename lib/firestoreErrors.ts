'use client';

export const FIRESTORE_QUOTA_EXCEEDED_EVENT = 'agradhi:firestore-quota-exceeded';

export function isFirebaseConnectionError(error: unknown): boolean {
  const code = (error as { code?: unknown } | null)?.code;
  const message = error instanceof Error ? error.message : '';

  return (
    code === 'auth/network-request-failed' ||
    code === 'unavailable' ||
    code === 'firestore/unavailable' ||
    /network-request-failed|fetching auth token failed|client is offline|failed to fetch|networkerror|unable to connect to firebase/i.test(message)
  );
}

export function reportFirestoreError(error: unknown): void {
  const code = (error as { code?: unknown } | null)?.code;
  if (
    typeof window !== 'undefined' &&
    (code === 'resource-exhausted' ||
      code === 'firestore/resource-exhausted' ||
      code === 'quota-exceeded' ||
      code === 'firestore/quota-exceeded')
  ) {
    window.dispatchEvent(new Event(FIRESTORE_QUOTA_EXCEEDED_EVENT));
  }
}

export async function withFirestoreErrorReporting<T>(
  operation: () => Promise<T>
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    reportFirestoreError(error);
    throw error;
  }
}
