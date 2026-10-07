'use client';

import React, { useState } from 'react';
import { useMediaStore } from '@/lib/store';
import { StatusBadge } from '@/components/ui/Badge';
import { Search, Filter } from 'lucide-react';

export function AdminSchoolsManager() {
  const { schools, updateSchoolStatus, submissions } = useMediaStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'suspended' | 'banned'>('all');

  const handleSchoolStatusUpdate = async (
    id: string,
    status: 'active' | 'pending' | 'suspended' | 'banned'
  ) => {
    try {
      await updateSchoolStatus(id, status);
    } catch (error: unknown) {
      window.alert(error instanceof Error ? error.message : 'Unable to save the school status.');
    }
  };

  const filtered = schools.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.district.toLowerCase().includes(search.toLowerCase()) ||
      s.badgeCode.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const pendingCount = schools.filter((school) => school.status === 'pending').length;
  const activeCount = schools.filter((school) => school.status === 'active').length;
  const suspendedCount = schools.filter((school) => school.status === 'suspended').length;
  const bannedCount = schools.filter((school) => school.status === 'banned').length;

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-xl font-semibold text-slate-950">School accounts</h1>
        <p className="mt-1 text-sm text-slate-600">
          Pending accounts wait for approval. Suspended and banned accounts cannot use the school portal; restore them by setting status to active.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="School account status counts">
        {[
          { label: 'Pending approval', value: pendingCount, detail: 'Review registration details', tone: 'text-amber-800 bg-amber-50' },
          { label: 'Active accounts', value: activeCount, detail: 'Can sign in and submit', tone: 'text-emerald-800 bg-emerald-50' },
          { label: 'Suspended accounts', value: suspendedCount, detail: 'Sign-in and submissions blocked', tone: 'text-rose-800 bg-rose-50' },
          { label: 'Banned accounts', value: bannedCount, detail: 'Blocked until restored by admin', tone: 'text-red-900 bg-red-100' },
        ].map(({ label, value, detail, tone }) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-slate-600">{label}</p>
              <span className={`rounded-md px-2 py-1 text-xs font-semibold ${tone}`}>{value}</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">{detail}</p>
          </div>
        ))}
      </section>

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
            {(['all', 'active', 'pending', 'suspended', 'banned'] as const).map((st) => (
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
                    <a
                      href={`mailto:${school.email}?subject=${encodeURIComponent('Agradhi school account update')}`}
                      className="text-amber-700 underline decoration-amber-300 underline-offset-2 hover:text-amber-900"
                    >
                      {school.email}
                    </a>
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
                  onClick={() => void handleSchoolStatusUpdate(school.id, 'active')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    school.status === 'active'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                      : 'bg-slate-50 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {school.status === 'banned' || school.status === 'suspended' ? 'Restore / Active' : 'Approve / Active'}
                </button>
                <button
                  onClick={() => void handleSchoolStatusUpdate(school.id, 'pending')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    school.status === 'pending'
                      ? 'bg-amber-50 text-amber-800 border border-amber-300'
                      : 'bg-slate-50 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => void handleSchoolStatusUpdate(school.id, 'suspended')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    school.status === 'suspended'
                      ? 'bg-red-50 text-red-800 border border-red-300'
                      : 'bg-slate-50 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Suspend
                </button>
                <button
                  onClick={() => void handleSchoolStatusUpdate(school.id, 'banned')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    school.status === 'banned'
                      ? 'bg-red-100 text-red-900 border border-red-300'
                      : 'bg-slate-50 text-slate-600 hover:text-red-800'
                  }`}
                >
                  Ban
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
