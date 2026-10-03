'use client';

import React from 'react';

interface CategoryShare {
  name: string;
  percentage: number;
  color: string;
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
  subtitle = '8% More entries than previous edition',
  totalCount = '1,420',
  countLabel = 'Total Submissions',
  categories = [
    { name: 'Short Film', percentage: 28, color: '#f43f5e' },
    { name: 'Photography', percentage: 32, color: '#ec4899' },
    { name: 'Announcing', percentage: 20, color: '#8b5cf6' },
    { name: 'Radio Play', percentage: 12, color: '#3b82f6' },
    { name: 'Graphic Art', percentage: 8, color: '#00d2ff' },
  ],
}: SegmentedGaugeProps) {
  // Generate 24 radial segments in a semi-circle (180 degrees)
  const totalSegments = 24;

  const segmentColors = [
    '#ef4444', '#f43f5e', '#f43f5e', '#fb7185',
    '#e11d48', '#ec4899', '#f472b6', '#d946ef',
    '#c026d3', '#a855f7', '#9333ea', '#8b5cf6',
    '#7c3aed', '#6366f1', '#4f46e5', '#3b82f6',
    '#2563eb', '#1d4ed8', '#0284c7', '#0ea5e9',
    '#38bdf8', '#00d2ff', '#06b6d4', '#0891b2',
  ];

  return (
    <div className="p-6 rounded-3xl bg-[#10172d]/90 border border-slate-800 shadow-xl relative overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="text-base font-semibold text-white tracking-tight">{title}</h4>
          <p className="text-xs text-emerald-400 flex items-center gap-1 mt-0.5">
            <span>↑</span> {subtitle}
          </p>
        </div>
      </div>

      {/* Semicircular Fan Display */}
      <div className="relative flex flex-col items-center justify-center pt-2 pb-2">
        <svg viewBox="0 0 320 180" className="w-full max-w-[280px] overflow-visible">
          {/* Semicircular radiating pins */}
          {Array.from({ length: totalSegments }).map((_, i) => {
            // angle from 180 (left) to 0 (right)
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

            const color = segmentColors[i % segmentColors.length];

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
          <span className="font-mono text-2xl font-bold text-white tracking-tight">
            {totalCount}
          </span>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
            {countLabel}
          </p>
        </div>
      </div>

      {/* Category Legend & Breakdown */}
      <div className="pt-4 border-t border-slate-800/80 mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs">
        {categories.map((cat) => (
          <div key={cat.name} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: cat.color }}
            />
            <span className="text-slate-300 text-[11px] font-medium">{cat.name}</span>
            <span className="text-slate-500 font-mono text-[10px]">({cat.percentage}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}
