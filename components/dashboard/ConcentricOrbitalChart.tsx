'use client';

import React from 'react';

interface ConcentricOrbitalChartProps {
  percentage?: number;
  label?: string;
  sublabel?: string;
}

export function ConcentricOrbitalChart({
  percentage = 89,
  label = 'Adjudication Clearance',
  sublabel = 'Submissions verified by jury board',
}: ConcentricOrbitalChartProps) {
  const rings = [35, 50, 65, 80, 95, 110];

  return (
    <div className="p-6 rounded-3xl bg-[#10172d]/90 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col items-center justify-between">
      <div className="w-full text-left mb-2">
        <h4 className="text-base font-semibold text-white tracking-tight">{label}</h4>
        <p className="text-xs text-slate-400 mt-0.5">{sublabel}</p>
      </div>

      {/* Concentric Orbital Radar SVG */}
      <div className="relative w-64 h-64 flex items-center justify-center my-3">
        <svg viewBox="0 0 260 260" className="w-full h-full">
          {/* Concentric Dotted / Dashed Rings */}
          {rings.map((r, i) => (
            <circle
              key={r}
              cx="130"
              cy="130"
              r={r}
              fill="none"
              stroke="#1e2b52"
              strokeWidth="1.2"
              strokeDasharray={i % 2 === 0 ? '4 5' : '2 4'}
              opacity={0.7}
            />
          ))}

          {/* Orbital Nodes / Beads */}
          {Array.from({ length: 42 }).map((_, i) => {
            const ringIdx = i % rings.length;
            const r = rings[ringIdx];
            const angle = (i * 37) * (Math.PI / 180);
            const cx = 130 + r * Math.cos(angle);
            const cy = 130 + r * Math.sin(angle);

            const colors = ['#38bdf8', '#818cf8', '#a855f7', '#c084fc', '#e879f9', '#f43f5e'];
            const color = colors[i % colors.length];

            return (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={i % 5 === 0 ? 3.5 : 2.2}
                fill={color}
                opacity={0.85}
                style={{
                  filter: i % 4 === 0 ? `drop-shadow(0 0 4px ${color})` : undefined,
                }}
              />
            );
          })}

          {/* Center Gauge Ring */}
          <circle
            cx="130"
            cy="130"
            r="30"
            fill="#090d1a"
            stroke="url(#gradient-orbit)"
            strokeWidth="5"
            style={{
              filter: 'drop-shadow(0 0 10px rgba(217, 70, 239, 0.5))',
            }}
          />

          <defs>
            <linearGradient id="gradient-orbit" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="50%" stopColor="#d946ef" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Percentage Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-mono text-sm font-bold text-white tracking-tight">
            {percentage}%
          </span>
          <span className="text-[8px] font-mono uppercase text-slate-400">Clear</span>
        </div>
      </div>

      {/* Footer Legend */}
      <div className="w-full flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#f43f5e]" /> Short Film
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#8b5cf6]" /> Photography
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#00d2ff]" /> Broadcast
        </span>
      </div>
    </div>
  );
}
