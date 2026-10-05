'use client';

import React from 'react';
import { SubmissionStatus, CompetitionStatus } from '@/lib/types';

interface BadgeProps {
  status?: SubmissionStatus | CompetitionStatus | 'active' | 'pending' | 'suspended';
  label?: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, label, size = 'sm' }: BadgeProps) {
  const current = status || 'submitted';

  const styles: Record<string, { bg: string; text: string; border: string; dot: string; display: string }> = {
    submitted: {
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      border: 'border-blue-200',
      dot: 'bg-blue-500',
      display: 'Awaiting review',
    },
    under_review: {
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
      dot: 'bg-amber-500',
      display: 'Under review',
    },
    verified: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
      dot: 'bg-emerald-500',
      display: 'Accepted',
    },
    shortlisted: {
      bg: 'bg-purple-50',
      text: 'text-purple-800',
      border: 'border-purple-200',
      dot: 'bg-purple-500',
      display: 'Finalist',
    },
    winner: {
      bg: 'bg-amber-100',
      text: 'text-amber-900',
      border: 'border-amber-300',
      dot: 'bg-amber-600',
      display: 'Winner',
    },
    disqualified: {
      bg: 'bg-red-50',
      text: 'text-red-800',
      border: 'border-red-200',
      dot: 'bg-red-500',
      display: 'Rejected',
    },
    open: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
      dot: 'bg-emerald-500',
      display: 'Submissions Open',
    },
    closed: {
      bg: 'bg-slate-100',
      text: 'text-slate-600',
      border: 'border-slate-200',
      dot: 'bg-slate-400',
      display: 'Closed',
    },
    judging: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-800',
      border: 'border-indigo-200',
      dot: 'bg-indigo-500',
      display: 'In Jury Evaluation',
    },
    upcoming: {
      bg: 'bg-sky-50',
      text: 'text-sky-800',
      border: 'border-sky-200',
      dot: 'bg-sky-500',
      display: 'Opening Soon',
    },
    active: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
      dot: 'bg-emerald-500',
      display: 'Active Delegation',
    },
    pending: {
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
      dot: 'bg-amber-500',
      display: 'Pending Approval',
    },
    suspended: {
      bg: 'bg-red-50',
      text: 'text-red-800',
      border: 'border-red-200',
      dot: 'bg-red-500',
      display: 'Suspended',
    },
  };

  const currentStyle = styles[current] || styles.submitted;
  const padding = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${currentStyle.bg} ${currentStyle.text} ${currentStyle.border} ${padding}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${currentStyle.dot}`} />
      {label || currentStyle.display}
    </span>
  );
}
