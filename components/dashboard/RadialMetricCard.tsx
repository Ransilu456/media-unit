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
  strokeColor = '#8b5cf6',
  isLoading = false,
}: RadialMetricCardProps) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const hasPercentage = percentage !== undefined;
  const progress = percentage ?? 0;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-white border border-slate-200">
      {/* Circular Progress Ring */}
      <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
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
                stroke="#e2e8f0"
                strokeWidth="6"
              />
              {/* Progress Arc */}
              <circle
                cx="35"
                cy="35"
                r={radius}
                fill="transparent"
                stroke={hasPercentage ? strokeColor : '#cbd5e1'}
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{
                  transition: 'stroke-dashoffset 0.8s ease',
                }}
              />
            </svg>

            <span className="absolute text-xs font-semibold text-slate-800" aria-hidden="true">
              {hasPercentage ? `${progress}%` : value}
            </span>
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
        ) : hasPercentage ? (
          <div className="text-xl font-semibold text-slate-900 tracking-tight truncate">
            {value}
          </div>
        ) : null}
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
