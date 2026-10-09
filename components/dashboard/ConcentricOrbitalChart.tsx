'use client';

import React from 'react';

export interface RadarEntry {
  id: string;
  title: string;
  category: string;
  status: string;
  studentName?: string;
  color?: string;
}

export interface RadarCategory {
  name: string;
  color: string;
  count: number;
}

interface ConcentricOrbitalChartProps {
  percentage?: number;
  label?: string;
  sublabel?: string;
  entries?: RadarEntry[];
  categories?: RadarCategory[];
  totalSubmissions?: number;
}

const CATEGORY_DEFAULT_COLORS: Record<string, string> = {
  'Short Film & Cinematography': '#4f46e5',
  'Photography': '#06b6d4',
  'News Reading & Announcing': '#f59e0b',
  'Radio Play & Audio Production': '#8b5cf6',
  'Graphic Design & Digital Art': '#3b82f6',
  'Live Media Reporting': '#10b981',
};

export function ConcentricOrbitalChart({
  percentage = 0,
  label = 'Adjudication Clearance Radar',
  sublabel,
  entries = [],
  categories = [],
  totalSubmissions = 0,
}: ConcentricOrbitalChartProps) {
  // Rings define adjudication phases:
  // r=52: Inner (Verified / Finalist / Winner)
  // r=78: Middle (Under Review)
  // r=104: Outer (Submitted / In Queue)
  const rings = [52, 78, 104];

  // Derive blips from real entries
  const blips = React.useMemo(() => {
    if (!entries.length) return [];

    // Group entries by ring
    const ringGroups: Record<number, RadarEntry[]> = { 52: [], 78: [], 104: [] };
    entries.forEach((entry) => {
      if (['verified', 'shortlisted', 'winner'].includes(entry.status)) {
        ringGroups[52].push(entry);
      } else if (entry.status === 'under_review') {
        ringGroups[78].push(entry);
      } else {
        ringGroups[104].push(entry);
      }
    });

    const result: Array<{
      entry: RadarEntry;
      cx: number;
      cy: number;
      color: string;
    }> = [];

    // Distribute entries around their respective rings
    rings.forEach((r) => {
      const items = ringGroups[r];
      const count = items.length;
      if (count === 0) return;

      const angleStep = (2 * Math.PI) / count;
      const baseOffset = r === 52 ? 0.4 : r === 78 ? 0.9 : 1.5;

      items.forEach((item, idx) => {
        const angle = baseOffset + idx * angleStep;
        const cx = 130 + r * Math.cos(angle);
        const cy = 130 + r * Math.sin(angle);
        const color =
          item.color ||
          CATEGORY_DEFAULT_COLORS[item.category] ||
          '#6366f1';

        result.push({ entry: item, cx, cy, color });
      });
    });

    return result;
  }, [entries]);

  // Derive legend items from passed categories or from entries
  const legendItems = React.useMemo(() => {
    if (categories && categories.length > 0) {
      return categories.filter((c) => c.count > 0);
    }
    if (entries.length > 0) {
      const map = new Map<string, { count: number; color: string }>();
      entries.forEach((e) => {
        const current = map.get(e.category) || {
          count: 0,
          color: e.color || CATEGORY_DEFAULT_COLORS[e.category] || '#6366f1',
        };
        current.count += 1;
        map.set(e.category, current);
      });
      return Array.from(map.entries()).map(([name, val]) => ({
        name,
        color: val.color,
        count: val.count,
      }));
    }
    return [];
  }, [categories, entries]);

  const totalCount = totalSubmissions || entries.length;
  const computedSublabel =
    sublabel ||
    (totalCount > 0
      ? `${totalCount} ${totalCount === 1 ? 'delegation entry' : 'delegation entries'} tracked across adjudication rings`
      : 'No active submissions currently in adjudication pipeline');

  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs relative overflow-hidden flex flex-col justify-between h-full">
      {/* Header */}
      <div className="w-full text-left mb-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-slate-950 tracking-tight">{label}</h4>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
            {totalCount} {totalCount === 1 ? 'Entry' : 'Entries'}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{computedSublabel}</p>
      </div>

      {/* Concentric Orbital Radar SVG */}
      <div className="relative w-60 h-60 mx-auto flex items-center justify-center my-2">
        <svg viewBox="0 0 260 260" className="w-full h-full">
          <defs>
            <linearGradient id="orbit-center-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0f766e" />
              <stop offset="50%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
            <radialGradient id="radar-sweep" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Radar background aura */}
          <circle cx="130" cy="130" r="108" fill="url(#radar-sweep)" />

          {/* Concentric Dotted Rings with Stage Markers */}
          {rings.map((r, i) => (
            <g key={r}>
              <circle
                cx="130"
                cy="130"
                r={r}
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="1.2"
                strokeDasharray={i === 0 ? '3 3' : i === 1 ? '5 5' : '2 4'}
                opacity={0.8}
              />
              {/* Ring stage label */}
              <text
                x="130"
                y={130 - r - 3}
                textAnchor="middle"
                fontSize="7.5"
                fill="#94a3b8"
                fontWeight="600"
                className="select-none uppercase tracking-wider"
              >
                {i === 0 ? 'Verified' : i === 1 ? 'In Review' : 'Submitted'}
              </text>
            </g>
          ))}

          {/* Crosshair guide lines */}
          <line x1="130" y1="18" x2="130" y2="242" stroke="#e2e8f0" strokeWidth="0.8" strokeDasharray="2 3" opacity={0.6} />
          <line x1="18" y1="130" x2="242" y2="130" stroke="#e2e8f0" strokeWidth="0.8" strokeDasharray="2 3" opacity={0.6} />

          {/* Real Entry Blips */}
          {blips.map(({ entry, cx, cy, color }, idx) => (
            <g key={entry.id || idx} className="group cursor-pointer">
              {/* Pulse glow ring */}
              <circle
                cx={cx}
                cy={cy}
                r="7"
                fill={color}
                opacity="0.25"
                className="animate-pulse"
              />
              {/* Solid core blip */}
              <circle
                cx={cx}
                cy={cy}
                r="4"
                fill={color}
                stroke="#ffffff"
                strokeWidth="1.5"
                className="transition-transform duration-200 group-hover:scale-150"
              />
              <title>{`${entry.title}${entry.studentName ? ` · ${entry.studentName}` : ''} (${entry.category} — ${entry.status.replace('_', ' ')})`}</title>
            </g>
          ))}

          {/* Center Gauge Ring */}
          <circle cx="130" cy="130" r="32" fill="#ffffff" stroke="url(#orbit-center-grad)" strokeWidth="4.5" />
        </svg>

        {/* Center Percentage / Clearance Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-base font-bold text-slate-900 tracking-tight leading-none">
            {totalCount > 0 ? `${percentage}%` : '0%'}
          </span>
          <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">
            {totalCount > 0 ? 'Adjudicated' : 'Queue Empty'}
          </span>
        </div>
      </div>

      {/* Footer Legend */}
      <div className="w-full pt-3 border-t border-slate-100 mt-1">
        {legendItems.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
            {legendItems.map((item) => (
              <div key={item.name} className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate text-[11px] text-slate-600 font-medium" title={item.name}>
                  {item.name}
                </span>
                <span className="ml-auto text-[11px] font-bold text-slate-900 shrink-0">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-[11px] text-slate-400 py-1">
            No entries submitted yet — radar blips appear as submissions arrive
          </p>
        )}
      </div>
    </div>
  );
}
