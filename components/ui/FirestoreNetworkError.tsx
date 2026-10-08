import { AlertTriangle, RefreshCw } from 'lucide-react';

interface FirestoreNetworkErrorProps {
  title: string;
  message: string;
  onRetry: () => void;
  compact?: boolean;
}

export function FirestoreNetworkError({
  title,
  message,
  onRetry,
  compact = false,
}: FirestoreNetworkErrorProps) {
  return (
    <section
      role="alert"
      className={`flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 text-amber-950 ${
        compact ? 'p-3' : 'p-5'
      }`}
    >
      <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-700" />
      <div className="min-w-0 flex-1">
        <h2 className="text-sm font-semibold">{title}</h2>
        <p className="mt-1 text-xs leading-5 text-amber-900">{message}</p>
        <p className="mt-1 text-[11px] text-amber-800">
          We&apos;ll retry when your connection returns.
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-semibold text-amber-950 hover:bg-amber-100"
      >
        <RefreshCw size={13} />
        Retry
      </button>
    </section>
  );
}
