'use client';

import React from 'react';

export interface CategoryShare {
  name: string;
  percentage: number;
  color: string;
  count?: number;
}

interface SegmentedGaugeProps {
  title?: string;
  subtitle?: string;
  totalCount?: number | string;
  countLabel?: string;
  categories?: CategoryShare[];
}

export function SegmentedGauge({
  title = 'Media Category Distribution',
  subtitle = 'Active category telemetry across all competition tracks',
  totalCount = 0,
  countLabel = 'Total Entries',
  categories = [],
}: SegmentedGaugeProps) {
  const totalSegments = 24;
  const numCount = typeof totalCount === 'number' ? totalCount : parseInt(String(totalCount), 10) || 0;

  // Compute segment colors proportional to real category percentages
  const segmentColors = React.useMemo(() => {
    if (!categories.length || numCount === 0) {
      return Array(totalSegments).fill('#e2e8f0'); // Muted empty state
    }

    const colors: string[] = [];
    categories.forEach((cat) => {
      // Calculate how many segments this category gets
      const segs = Math.max(1, Math.round((cat.percentage / 100) * totalSegments));
      for (let s = 0; s < segs && colors.length < totalSegments; s++) {
        colors.push(cat.color);
      }
    });

    // Fill remaining if rounding caused fewer segments
    while (colors.length < totalSegments) {
      colors.push(categories[categories.length - 1]?.color || '#94a3b8');
    }

    return colors;
  }, [categories, numCount]);

  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs relative overflow-hidden flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="text-sm font-semibold text-slate-950 tracking-tight">{title}</h4>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>
      </div>

      {/* Semicircular Fan Display */}
      <div className="relative flex flex-col items-center justify-center pt-2 pb-1">
        <svg viewBox="0 0 320 180" className="w-full max-w-[280px] overflow-visible">
          {Array.from({ length: totalSegments }).map((_, i) => {
            const angle = 180 - (i / (totalSegments - 1)) * 180;
            const rad = (angle * Math.PI) / 180;

            const cx = 160;
            const cy = 165;
            const innerR = 75;
            const outerR = 120;

            const x1 = cx + innerR * Math.cos(rad);
            const y1 = cy - innerR * Math.sin(rad);
            const x2 = cx + outerR * Math.cos(rad);
            const y2 = cy - outerR * Math.sin(rad);

            const color = segmentColors[i];

            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={color}
                strokeWidth={7}
                strokeLinecap="round"
                className="transition-all duration-300 hover:opacity-80"
              />
            );
          })}
        </svg>

        {/* Center Readout */}
        <div className="absolute bottom-1 text-center">
          <span className="text-2xl font-bold text-slate-950 tracking-tight leading-none">
            {totalCount}
          </span>
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
            {countLabel}
          </p>
        </div>
      </div>

      {/* Category Legend & Breakdown */}
      <div className="pt-3 border-t border-slate-100 mt-1">
        {categories.length > 0 && numCount > 0 ? (
          <div className="flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1.5 text-xs">
            {categories.map((cat) => (
              <div key={cat.name} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-slate-700 text-[11px] font-medium">{cat.name}</span>
                <span className="text-slate-400 text-[10px] font-semibold">({cat.percentage}%)</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-[11px] text-slate-400 py-1">
            No entries submitted yet — categories will distribute as entries arrive
          </p>
        )}
      </div>
    </div>
  );
}
