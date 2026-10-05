'use client';

import React from 'react';

interface DotMatrixChartProps {
  title?: string;
  subtitle?: string;
}

export function DotMatrixChart({
  title = 'Annual Submission Pulse & Activity',
  subtitle = 'Monthly delegation entry volume across all competition categories',
}: DotMatrixChartProps) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Heights in number of dots (each dot represents ~100 submissions)
  const columns = [
    { count: 3 },
    { count: 5 },
    { count: 7 },
    { count: 9 },
    { count: 6 },
    { count: 7 },
    { count: 9 },
    { count: 7 },
    { count: 12 },
    { count: 9 },
    { count: 8 },
    { count: 6 },
  ];

  // Colors for dots going from bottom (sapphire/blue) to top (violet/magenta)
  const getDotColor = (index: number) => {
    const palette = [
      '#1d4ed8', '#2563eb', '#3b82f6', '#4f46e5',
      '#6366f1', '#7c3aed', '#8b5cf6', '#a855f7',
      '#c026d3', '#d946ef', '#ec4899', '#f43f5e',
    ];
    return palette[Math.min(index, palette.length - 1)];
  };

  return (
    <div className="p-5 rounded-xl bg-white border border-slate-200 relative overflow-hidden">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="text-sm font-semibold text-slate-900 tracking-tight">{title}</h4>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1d4ed8]" />
            <span className="text-slate-500">Regular</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#d946ef]" />
            <span className="text-slate-500">Peak Rush</span>
          </div>
        </div>
      </div>

      {/* Grid with Y-axis and Dot Columns */}
      <div className="flex items-end gap-3 pt-4">
        {/* Y-axis Labels */}
        <div className="flex flex-col justify-between h-48 text-[10px] text-slate-500 pb-5 shrink-0 text-right pr-1">
          <span>1000</span>
          <span>800</span>
          <span>600</span>
          <span>400</span>
          <span>200</span>
          <span>0</span>
        </div>

        {/* Columns Grid */}
        <div className="flex-1 flex items-end justify-between gap-1 sm:gap-2 h-48 border-b border-slate-200 pb-2">
          {columns.map((col, cIdx) => (
            <div key={cIdx} className="flex-1 flex flex-col items-center justify-end group">
              <div className="flex flex-col-reverse gap-1.5 mb-2">
                {Array.from({ length: col.count }).map((_, dIdx) => (
                  <span
                    key={dIdx}
                    className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full transition-transform group-hover:scale-125"
                    style={{
                      backgroundColor: getDotColor(dIdx),
                    }}
                  />
                ))}
              </div>
              <span className="text-[10px] text-slate-500 mt-1">
                {months[cIdx]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
