'use client';

import React from 'react';

interface StackedBarChartProps {
  title?: string;
  totalSubmissions?: string | number;
  period?: string;
}

export function StackedBarChart({
  title = 'Annual Competition Entries & Velocity',
  totalSubmissions = '1,842',
  period = 'Past 6 Months',
}: StackedBarChartProps) {
  const bars = [
    { month: 'Jan', blueVal: 65, purpleVal: 20, tag: '75%' },
    { month: 'Feb', blueVal: 55, purpleVal: 25, tag: '32%' },
    { month: 'Mar', blueVal: 68, purpleVal: 35, tag: '40%' },
    { month: 'Apr', blueVal: 82, purpleVal: 30, tag: '92%' },
    { month: 'May', blueVal: 58, purpleVal: 28, tag: '35%' },
    { month: 'Jun', blueVal: 42, purpleVal: 22, tag: '28%' },
  ];

  const tracks = [
    { name: 'Short Film & Cinema', value: 142, color: '#4f46e5' },
    { name: 'Salon Photography', value: 128, color: '#06b6d4' },
    { name: 'News & Announcing', value: 96, color: '#f59e0b' },
    { name: 'Radio Play Audio', value: 84, color: '#8b5cf6' },
    { name: 'Graphic & Digital Art', value: 72, color: '#3b82f6' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left 2 Cols: Stacked Bar Chart */}
      <div className="lg:col-span-2 p-5 rounded-xl bg-white border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-2">{title}</h4>
            <span className="text-xs uppercase text-slate-500">Total Delegations</span>
            <div className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
              {totalSubmissions}
            </div>
            <span className="text-[11px] text-slate-500">{period}</span>
          </div>

          <div className="flex gap-6 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Participating</span>
              <span className="font-semibold text-slate-900 text-base">42 Schools</span>
              <span className="text-emerald-700 block text-[10px]">↑ 24% more</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">New Districts</span>
              <span className="font-semibold text-slate-900 text-base">9 Provinces</span>
              <span className="text-emerald-700 block text-[10px]">↑ 37% more</span>
            </div>
          </div>
        </div>

        {/* Stacked Bars */}
        <div className="h-56 flex items-end justify-between gap-3 pt-6 border-b border-slate-200 pb-2">
          {bars.map((bar, i) => (
            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group">
              <span className="text-[10px] text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 mb-1">
                {bar.tag}
              </span>
              <div className="w-full max-w-[42px] flex flex-col-reverse rounded-md overflow-hidden">
                {/* Purple base bar */}
                <div
                  style={{ height: `${bar.purpleVal * 1.4}px` }}
                  className="w-full bg-[#4f46e5] group-hover:bg-[#6366f1] transition-colors"
                />
                {/* Blue top bar */}
                <div
                  style={{ height: `${bar.blueVal * 1.4}px` }}
                  className="w-full bg-[#0284c7] group-hover:bg-[#38bdf8] transition-colors"
                />
              </div>
              <span className="text-[11px] text-slate-500 mt-2">{bar.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Col: Top 5 Tracks Progress */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-slate-900">Top 5 Competition Tracks</h4>
            <span className="text-[11px] text-slate-500">All Tracks</span>
          </div>

          <div className="space-y-3.5">
            {tracks.map((t) => (
              <div key={t.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium truncate">{t.name}</span>
                  <span className="text-slate-900 font-semibold">{t.value}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(t.value / 150) * 100}%`,
                      backgroundColor: t.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Active Adjudication</span>
          <span className="text-emerald-700 font-medium">94.2% Reviewed</span>
        </div>
      </div>
    </div>
  );
}
