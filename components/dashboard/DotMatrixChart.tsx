'use client';

import React from 'react';

export interface MonthlyPulsePoint {
  month: string;
  count: number;
}

interface DotMatrixChartProps {
  title?: string;
  subtitle?: string;
  monthlyData?: MonthlyPulsePoint[];
  totalSubmissions?: number;
}

const DOT_PALETTE = [
  '#fed7aa',
  '#fdba74',
  '#fb923c',
  '#f97316',
  '#ea580c',
  '#c2410c',
];

export function DotMatrixChart({
  title = 'Monthly Submission Pulse',
  subtitle = 'Delegation entry intake across the academic calendar',
  monthlyData,
  totalSubmissions = 0,
}: DotMatrixChartProps) {
  // Default to the last 6 calendar months if not supplied
  const columns: MonthlyPulsePoint[] = React.useMemo(() => {
    if (monthlyData && monthlyData.length > 0) {
      return monthlyData;
    }
    const months: MonthlyPulsePoint[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push({
        month: d.toLocaleString('en-GB', { month: 'short' }),
        count: 0,
      });
    }
    return months;
  }, [monthlyData]);

  const maxVal = Math.max(...columns.map((c) => c.count), 0);
  const total = totalSubmissions || columns.reduce((acc, c) => acc + c.count, 0);

  // Dynamic Y-axis ticks based on real maximum count (max 4 ticks)
  const yTicks = React.useMemo(() => {
    if (maxVal <= 0) return [0];
    if (maxVal <= 4) {
      return Array.from({ length: maxVal + 1 }, (_, i) => i).reverse();
    }
    const step = Math.ceil(maxVal / 4);
    const ticks: number[] = [];
    for (let i = 4; i >= 0; i--) {
      ticks.push(i * step);
    }
    return ticks;
  }, [maxVal]);

  return (
    <div className="relative flex min-h-[340px] flex-col overflow-hidden rounded-2xl border border-sky-100/80 bg-white p-5 shadow-[0_8px_28px_rgba(59,130,246,0.07)]">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h4 className="text-sm font-semibold text-slate-950 tracking-tight">{title}</h4>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2 text-xs shrink-0">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{total} Total Entries</span>
          </span>
        </div>
      </div>

      {/* Grid with Y-axis and Dot Columns */}
      <div className="grid grid-cols-[24px_minmax(0,1fr)] items-end gap-3 pt-3">
        {/* Y-axis Labels */}
        <div className="flex h-44 flex-col justify-between pb-6 text-right font-mono text-[10px] text-slate-400 select-none">
          {yTicks.map((tick, i) => (
            <span key={i}>{tick}</span>
          ))}
        </div>

        {/* Columns Grid */}
        <div className="flex h-44 min-w-0 items-end justify-between gap-1 border-b border-slate-200 pb-2 sm:gap-2">
          {columns.map((col, cIdx) => {
            // Number of dots to display (up to 10 dots max)
            const dotCount =
              maxVal > 10
                ? Math.round((col.count / maxVal) * 10)
                : col.count;

            return (
              <div
                key={cIdx}
                className="group flex min-w-0 flex-1 cursor-default flex-col items-center justify-end"
                title={`${col.month}: ${col.count} ${col.count === 1 ? 'submission' : 'submissions'}`}
              >
                {/* Dots stack */}
                <div className="mb-2 flex min-h-[14px] flex-col-reverse gap-1.5">
                  {col.count > 0 ? (
                    Array.from({ length: Math.max(dotCount, 1) }).map((_, dIdx) => {
                      const color = DOT_PALETTE[Math.min(dIdx, DOT_PALETTE.length - 1)];
                      return (
                        <span
                          key={dIdx}
                          className="h-3.5 w-3.5 rounded-full shadow-[0_1px_2px_rgba(15,23,42,0.08)] transition-transform duration-150 group-hover:scale-125 sm:h-4 sm:w-4"
                          style={{ backgroundColor: color }}
                        />
                      );
                    })
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-slate-200 opacity-60" />
                  )}
                </div>

                {/* Submissions count tooltip pill on hover */}
                {col.count > 0 && (
                  <span className="text-[10px] font-bold text-slate-700 mb-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {col.count}
                  </span>
                )}

                {/* Month label */}
                <span className="text-[11px] font-semibold text-slate-500 mt-1">
                  {col.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-500">
        <span>
          {maxVal > 0 ? `Peak month volume: ${maxVal} entries` : 'Awaiting entry volume'}
        </span>
        <span className="font-medium text-slate-700">{total > 0 ? 'Active' : 'No activity'}</span>
      </div>
    </div>
  );
}
