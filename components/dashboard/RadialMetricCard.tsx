'use client';

import React from 'react';

interface RadialMetricCardProps {
  percentage: number;
  label: string;
  value: string;
  trendText?: string;
  strokeColor?: string;
  glowColor?: string;
}

export function RadialMetricCard({
  percentage,
  label,
  value,
  trendText,
  strokeColor = '#8b5cf6',
  glowColor = 'rgba(139, 92, 246, 0.4)',
}: RadialMetricCardProps) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#131b34]/90 border border-slate-800/80 shadow-lg hover:border-slate-700 transition-all">
      {/* Circular Progress Ring */}
      <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 70 70">
          {/* Background Track */}
          <circle
            cx="35"
            cy="35"
            r={radius}
            fill="transparent"
            stroke="#1e2b52"
            strokeWidth="6"
          />
          {/* Progress Arc */}
          <circle
            cx="35"
            cy="35"
            r={radius}
            fill="transparent"
            stroke={strokeColor}
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 6px ${glowColor})`,
              transition: 'stroke-dashoffset 0.8s ease',
            }}
          />
        </svg>

        {/* Center Percentage */}
        <span className="absolute text-xs font-mono font-bold text-white">
          {percentage}%
        </span>
      </div>

      {/* Metric Info */}
      <div className="min-w-0">
        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block truncate">
          {label}
        </span>
        <div className="text-xl font-mono font-bold text-white tracking-tight truncate">
          {value}
        </div>
        {trendText && (
          <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 mt-0.5 truncate">
            <span>{trendText}</span>
            <span className="text-xs">↑</span>
          </p>
        )}
      </div>
    </div>
  );
}
