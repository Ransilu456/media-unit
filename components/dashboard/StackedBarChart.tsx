'use client';

import React from 'react';

interface MonthlyPoint {
  month: string;
  count: number;
}

interface CategoryBreakdown {
  name: string;
  value: number;
  color: string;
}

interface StackedBarChartProps {
  title?: string;
  totalSubmissions?: number;
  period?: string;
  schoolCount?: number;
  monthlyData?: MonthlyPoint[];
  categoryBreakdown?: CategoryBreakdown[];
}

const FALLBACK_MONTHS: MonthlyPoint[] = [
  { month: 'May', count: 0 },
  { month: 'Jun', count: 0 },
  { month: 'Jul', count: 0 },
  { month: 'Aug', count: 0 },
  { month: 'Sep', count: 0 },
  { month: 'Oct', count: 0 },
];

const FALLBACK_CATEGORIES: CategoryBreakdown[] = [
  { name: 'Short Film & Cinematography', value: 0, color: '#4f46e5' },
  { name: 'Photography', value: 0, color: '#06b6d4' },
  { name: 'News Reading & Announcing', value: 0, color: '#f59e0b' },
  { name: 'Radio Play & Audio', value: 0, color: '#8b5cf6' },
  { name: 'Graphic Design & Digital Art', value: 0, color: '#3b82f6' },
];

export function StackedBarChart({
  title = 'All-Island Competition Velocity & Intake',
  totalSubmissions = 0,
  period = 'Active 2026 Academic Season',
  schoolCount = 0,
  monthlyData,
  categoryBreakdown,
}: StackedBarChartProps) {
  const bars = monthlyData && monthlyData.length > 0 ? monthlyData : FALLBACK_MONTHS;
  const cats = categoryBreakdown && categoryBreakdown.length > 0 ? categoryBreakdown : FALLBACK_CATEGORIES;

  const maxBarVal = Math.max(...bars.map((b) => b.count), 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 p-5 rounded-xl bg-white border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-2">{title}</h4>
            <span className="text-xs uppercase text-slate-500">Total Submissions</span>
            <div className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
              {totalSubmissions.toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-500">{period}</span>
          </div>

          <div className="flex gap-6 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Participating</span>
              <span className="font-semibold text-slate-900 text-base">{schoolCount} Schools</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Categories</span>
              <span className="font-semibold text-slate-900 text-base">{cats.filter(c => c.value > 0).length || cats.length} Tracks</span>
            </div>
          </div>
        </div>

        {/* Bars */}
        <div className="h-52 flex items-end justify-between gap-2 border-b border-slate-200 pb-2">
          {bars.map((bar, i) => {
            const pct = bar.count > 0 ? (bar.count / maxBarVal) * 100 : 0;
            return (
              <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group">
                {bar.count > 0 && (
                  <span className="text-[10px] text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 mb-1">
                    {bar.count}
                  </span>
                )}
                <div className="w-full max-w-[44px] flex flex-col-reverse rounded-md overflow-hidden bg-slate-100">
                  <div
                    style={{ height: `${Math.max(pct * 1.7, bar.count > 0 ? 4 : 0)}px` }}
                    className="w-full bg-[#0284c7] group-hover:bg-[#38bdf8] transition-colors rounded-md"
                  />
                </div>
                <span className="text-[11px] text-slate-500 mt-2">{bar.month}</span>
              </div>
            );
          })}
        </div>

        {totalSubmissions === 0 && (
          <p className="text-center text-xs text-slate-400 mt-3">No submission data yet — bars will populate as entries are received.</p>
        )}
      </div>

      <div className="p-5 rounded-xl bg-white border border-slate-200 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-slate-900">Entries by Category</h4>
            <span className="text-[11px] text-slate-500">{cats.length} Tracks</span>
          </div>

          <div className="space-y-3.5">
            {cats.map((t) => {
              const maxVal = Math.max(...cats.map(c => c.value), 1);
              return (
                <div key={t.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium truncate">{t.name}</span>
                    <span className="text-slate-900 font-semibold ml-2">{t.value}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${t.value > 0 ? (t.value / maxVal) * 100 : 0}%`,
                        backgroundColor: t.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Live intake data</span>
          {totalSubmissions > 0 ? (
            <span className="text-emerald-700 font-medium">Live tracking</span>
          ) : (
            <span className="text-slate-400">Awaiting entries</span>
          )}
        </div>
      </div>
    </div>
  );
}
