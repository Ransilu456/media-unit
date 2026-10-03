'use client';

import React, { useState } from 'react';
import { useMediaStore } from '@/lib/store';
import { StatusBadge } from '@/components/ui/Badge';
import { Search, Filter } from 'lucide-react';

export function AdminSchoolsManager() {
  const { schools, updateSchoolStatus, submissions } = useMediaStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'suspended'>('all');

  const filtered = schools.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.district.toLowerCase().includes(search.toLowerCase()) ||
      s.badgeCode.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search school, district, code..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={14} className="text-slate-400 shrink-0" />
          <div className="flex gap-1 overflow-x-auto">
            {(['all', 'active', 'pending', 'suspended'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-slate-50 text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Schools Table / Grid */}
      <div className="space-y-4">
        {filtered.map((school) => {
          const schoolSubmissions = submissions.filter((sub) => sub.schoolId === school.id);

          return (
            <div
              key={school.id}
              className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-amber-300 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              <div className="space-y-2 max-w-xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-mono font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                    {school.badgeCode}
                  </span>
                  <StatusBadge status={school.status} />
                  <span className="text-xs text-slate-400 font-mono">
                    Registered: {school.registeredAt}
                  </span>
                </div>

                <h3 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">
                  {school.name}
                </h3>

                <p className="text-xs text-slate-500 font-light">
                  {school.district} • {school.province} {school.registrationNumber && `(${school.registrationNumber})`}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs text-slate-700 font-mono">
                  <div>
                    <span className="text-slate-400">Teacher: </span>
                    <span className="font-medium text-slate-800">{school.teacherInCharge} ({school.teacherPhone})</span>
                  </div>
                  <div>
                    <span className="text-slate-400">President: </span>
                    <span className="font-medium text-slate-800">{school.mediaPresident} ({school.presidentPhone})</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Email: </span>
                    <span className="text-amber-700">{school.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Entries: </span>
                    <span className="font-bold text-slate-900">{schoolSubmissions.length} submissions</span>
                  </div>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                <span className="text-[11px] text-slate-400 w-full lg:w-auto">Status:</span>
                <button
                  onClick={() => updateSchoolStatus(school.id, 'active')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    school.status === 'active'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                      : 'bg-slate-50 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Approve / Active
                </button>
                <button
                  onClick={() => updateSchoolStatus(school.id, 'pending')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    school.status === 'pending'
                      ? 'bg-amber-50 text-amber-800 border border-amber-300'
                      : 'bg-slate-50 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => updateSchoolStatus(school.id, 'suspended')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    school.status === 'suspended'
                      ? 'bg-red-50 text-red-800 border border-red-300'
                      : 'bg-slate-50 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Suspend
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="p-8 text-center rounded-2xl bg-white border border-slate-200 text-slate-500 text-xs">
            No schools matched the search criteria.
          </div>
        )}
      </div>
    </div>
  );
}
