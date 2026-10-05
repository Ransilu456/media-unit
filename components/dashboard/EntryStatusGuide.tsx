'use client';

import type { SubmissionStatus } from '@/lib/types';
import { StatusBadge } from '@/components/ui/Badge';
import { ChevronDown, CircleHelp } from 'lucide-react';

const STATUS_HELP: Array<{ status: SubmissionStatus; description: string }> = [
  { status: 'submitted', description: 'Received and waiting for review.' },
  { status: 'under_review', description: 'Currently being checked.' },
  { status: 'verified', description: 'Accepted as eligible and complete.' },
  { status: 'shortlisted', description: 'Selected as a finalist.' },
  { status: 'winner', description: 'Selected as a competition winner.' },
  { status: 'disqualified', description: 'Not accepted; read the feedback for why.' },
];

export function EntryStatusGuide() {
  return (
    <details className="group rounded-xl border border-slate-200 bg-white">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 [&::-webkit-details-marker]:hidden">
        <span className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <CircleHelp size={16} />
          </span>
          <span>
            <span className="block text-xs font-semibold text-slate-900">Understand entry statuses</span>
            <span className="mt-0.5 block text-[11px] text-slate-500">
              See what each decision means and what happens next.
            </span>
          </span>
        </span>
        <ChevronDown size={16} className="shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
      </summary>
      <div className="grid gap-2 border-t border-slate-100 px-4 py-3 sm:grid-cols-2 xl:grid-cols-3">
        {STATUS_HELP.map(({ status, description }) => (
          <div key={status} className="flex min-w-0 items-center gap-2.5 rounded-lg bg-slate-50 px-3 py-2.5">
            <StatusBadge status={status} />
            <p className="min-w-0 text-[11px] leading-4 text-slate-600">{description}</p>
          </div>
        ))}
      </div>
    </details>
  );
}
