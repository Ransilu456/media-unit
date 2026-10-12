export function PortalSkeleton({ sections = 3 }: { sections?: number }) {
  return (
    <div
      role="status"
      aria-label="Loading dashboard"
      aria-busy="true"
      className="mx-auto w-full max-w-7xl space-y-6"
    >
      <span className="sr-only">Loading dashboard...</span>
      <div className="space-y-2">
        <div className="h-3 w-40 animate-pulse rounded bg-slate-200" />
        <div className="h-8 w-64 max-w-full animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-96 max-w-full animate-pulse rounded bg-slate-100" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
            <div className="h-3 w-28 animate-pulse rounded bg-slate-100" />
            <div className="h-8 w-20 animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-36 max-w-full animate-pulse rounded bg-slate-100" />
          </div>
        ))}
      </div>
      {Array.from({ length: sections }, (_, sectionIndex) => (
        <div key={sectionIndex} className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
          <div className="h-5 w-48 animate-pulse rounded bg-slate-200" />
          {Array.from({ length: 3 }, (_, rowIndex) => (
            <div key={rowIndex} className="h-12 animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function PortalOverviewSkeleton() {
  return (
    <div role="status" aria-label="Loading dashboard content" aria-busy="true" className="w-full space-y-5">
      <span className="sr-only">Loading dashboard content...</span>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="min-h-56 animate-pulse rounded-3xl bg-slate-200 xl:col-span-8" />
        <div className="min-h-56 animate-pulse rounded-3xl bg-white xl:col-span-4" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white p-4">
            <div className="h-3 w-24 rounded bg-slate-100" />
            <div className="mt-4 h-8 w-12 rounded bg-slate-200" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="h-72 animate-pulse rounded-3xl border border-slate-200 bg-white xl:col-span-8" />
        <div className="h-72 animate-pulse rounded-3xl border border-slate-200 bg-white xl:col-span-4" />
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading form"
      aria-busy="true"
      className="mx-auto w-full max-w-2xl space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <span className="sr-only">Loading form...</span>
      <div className="h-7 w-56 animate-pulse rounded bg-slate-200" />
      <div className="h-4 w-80 max-w-full animate-pulse rounded bg-slate-100" />
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="space-y-2">
          <div className="h-3 w-32 animate-pulse rounded bg-slate-200" />
          <div className="h-11 animate-pulse rounded-lg bg-slate-100" />
        </div>
      ))}
      <div className="h-11 animate-pulse rounded-lg bg-amber-100" />
    </div>
  );
}
