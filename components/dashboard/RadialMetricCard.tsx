'use client';

import React from 'react';

interface RadialMetricCardProps {
  percentage?: number;
  label: string;
  value: string;
  trendText?: string;
  description?: string;
  strokeColor?: string;
  isLoading?: boolean;
}

export function RadialMetricCard({
  percentage,
  label,
  value,
  trendText,
  description,
  strokeColor = '#f97316',
  isLoading = false,
}: RadialMetricCardProps) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const hasPercentage = percentage !== undefined;
  const progress = percentage ?? 0;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex min-h-[104px] items-center gap-4 rounded-2xl border border-sky-100/80 bg-white p-4 shadow-[0_8px_28px_rgba(59,130,246,0.07)]">
      {/* Circular Progress Ring */}
      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
        {isLoading ? (
          <div className="w-14 h-14 rounded-full bg-slate-100 animate-pulse border border-slate-200/60" />
        ) : (
          <>
            <svg className="w-full h-full -rotate-90" viewBox="0 0 70 70">
              {/* Background Track */}
              <circle
                cx="35"
                cy="35"
                r={radius}
                fill="transparent"
                stroke="#dbeafe"
                strokeWidth="6"
              />
              {/* Progress Arc */}
              <circle
                cx="35"
                cy="35"
                r={radius}
                fill="transparent"
                stroke={hasPercentage ? strokeColor : '#bfdbfe'}
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{
                  transition: 'stroke-dashoffset 0.8s ease',
                }}
              />
            </svg>

            {hasPercentage && (
              <span className="absolute text-xs font-semibold text-slate-800" aria-hidden="true">
                {progress}%
              </span>
            )}
          </>
        )}
      </div>

      {/* Metric Info */}
      <div className="min-w-0 flex-1">
        <span className="text-[11px] uppercase tracking-wider text-slate-500 block truncate">
          {label}
        </span>
        {isLoading ? (
          <div className="h-6 w-16 rounded bg-slate-100 animate-pulse my-1" />
        ) : (
          <div className="truncate text-xl font-semibold tracking-tight text-slate-900">
            {value}
          </div>
        )}
        {description && (
          <p className="mt-0.5 text-[11px] leading-4 text-slate-500">{description}</p>
        )}
        {trendText && (
          <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 mt-0.5 truncate">
            <span>{trendText}</span>
            <span className="text-xs">↑</span>
          </p>
        )}
      </div>
    </div>
  );
}
