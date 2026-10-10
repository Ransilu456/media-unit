'use client';

import React, { useState } from 'react';
import { useMediaStore } from '@/lib/store';
import { StatusBadge } from '@/components/ui/Badge';
import { Search, Filter, Trash2, Clock3, ShieldCheck, X } from 'lucide-react';

export function AdminSchoolsManager() {
  const {
    schools,
    updateSchoolStatus,
    submissions,
    competitions,
    notifications,
    isSubmissionsLoaded,
    removeSubmission,
    resolveEntryReplacementRequest,
  } = useMediaStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'suspended' | 'banned'>('all');
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [approvalSchoolId, setApprovalSchoolId] = useState<string | null>(null);
  const [reviewConfirmed, setReviewConfirmed] = useState(false);

  const saveSchoolStatus = async (
    id: string,
    status: 'active' | 'pending' | 'suspended' | 'banned'
  ) => {
    setWorkingId(id);
    setActionError(null);
    try {
      await updateSchoolStatus(id, status);
      if (status === 'active') setApprovalSchoolId(null);
    } catch (error: unknown) {
      setActionError(error instanceof Error ? error.message : 'Unable to save the school status.');
    } finally {
      setWorkingId(null);
    }
  };

  const requestSchoolStatusUpdate = (
    id: string,
    status: 'active' | 'pending' | 'suspended' | 'banned',
    schoolName: string
  ) => {
    if (status === 'active') {
      setActionError(null);
      setReviewConfirmed(false);
      setApprovalSchoolId(id);
      return;
    }
    if (window.confirm(`Change ${schoolName}'s account status to ${status}?`)) {
      void saveSchoolStatus(id, status);
    }
  };

  const pendingReplacementRequests = notifications.filter(
    (item) => item.kind === 'entry_replacement_request' && item.resolved !== true
  );

  const handleReplacementDecision = async (requestId: string, approved: boolean) => {
    if (
      approved &&
      !window.confirm('Permanently delete the requested entry and reopen this school’s slot in the competition?')
    ) {
      return;
    }
    setWorkingId(requestId);
    setActionError(null);
    try {
      await resolveEntryReplacementRequest(requestId, approved);
    } catch (error: unknown) {
      setActionError(error instanceof Error ? error.message : 'Unable to process the replacement request.');
    } finally {
      setWorkingId(null);
    }
  };

  const handleRemoveEntry = async (submissionId: string) => {
    if (!window.confirm('Permanently remove this student entry? This will free one slot for this school and competition.')) {
      return;
    }
    setWorkingId(submissionId);
    setActionError(null);
    try {
      await removeSubmission(submissionId);
    } catch (error: unknown) {
      setActionError(error instanceof Error ? error.message : 'Unable to remove this entry.');
    } finally {
      setWorkingId(null);
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
  const schoolEntries = schools.map((school) => ({
    school,
    competitions: competitions
      .map((competition) => ({
        competition,
        entries: submissions.filter(
          (submission) =>
            submission.schoolId === school.id &&
            submission.competitionId === competition.id
        ),
      }))
      .filter((group) => group.entries.length > 0),
  })).filter((group) => group.competitions.length > 0);

  return (
    <div className="space-y-6">
      {actionError && (
        <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          {actionError}
        </p>
      )}

      {pendingReplacementRequests.length > 0 && (
        <section className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Entry removal requests</h2>
            <p className="mt-1 text-sm text-slate-600">
              Approving permanently removes the entry and reopens one slot for that school and competition.
            </p>
          </div>
          {pendingReplacementRequests.map((request) => {
            const requestedEntry = submissions.find((entry) =>
              entry.id === request.submissionId &&
              entry.schoolId === request.schoolId &&
              entry.competitionId === request.competitionId
            );
            return (
              <article key={request.id} className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs font-semibold text-amber-900">
                      <Clock3 size={14} />
                      Pending admin review
                    </div>
                    <p className="mt-2 text-sm text-slate-800">{request.message}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      disabled={workingId === request.id || !isSubmissionsLoaded || !requestedEntry}
                      onClick={() => void handleReplacementDecision(request.id, true)}
                      className="rounded-lg bg-rose-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                    >
                      Delete entry & reopen slot
                    </button>
                    <button
                      type="button"
                      disabled={workingId === request.id}
                      onClick={() => void handleReplacementDecision(request.id, false)}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-50"
                    >
                      Keep entry
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}

      <section>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-slate-950">School accounts</h1>
            <p className="mt-1 text-sm text-slate-600">
              Review registration details before activating an account. Pending schools cannot sign in or submit entries.
            </p>
          </div>
          {pendingCount > 0 && (
            <button
              type="button"
              onClick={() => setStatusFilter('pending')}
              className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100"
            >
              <Clock3 size={14} />
              Review {pendingCount} pending {pendingCount === 1 ? 'registration' : 'registrations'}
            </button>
          )}
        </div>
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
                  onClick={() => requestSchoolStatusUpdate(school.id, 'active', school.name)}
                  disabled={school.status === 'active' || workingId === school.id}
                  title={school.status === 'pending' ? 'Review and approve this school registration.' : undefined}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                    school.status === 'active'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                      : 'bg-slate-50 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {school.status === 'banned' || school.status === 'suspended' ? 'Restore / Active' : 'Review & approve'}
                </button>
                <button
                  onClick={() => requestSchoolStatusUpdate(school.id, 'pending', school.name)}
                  disabled={school.status === 'pending' || workingId === school.id}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    school.status === 'pending'
                      ? 'bg-amber-50 text-amber-800 border border-amber-300'
                      : 'bg-slate-50 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => requestSchoolStatusUpdate(school.id, 'suspended', school.name)}
                  disabled={school.status === 'suspended' || workingId === school.id}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    school.status === 'suspended'
                      ? 'bg-red-50 text-red-800 border border-red-300'
                      : 'bg-slate-50 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Suspend
                </button>
                <button
                  onClick={() => requestSchoolStatusUpdate(school.id, 'banned', school.name)}
                  disabled={school.status === 'banned' || workingId === school.id}
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

      <section className="space-y-4 pt-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">Entries by school and competition</h2>
          <p className="mt-1 text-sm text-slate-600">
            Review all student entries under each school and competition. Removing an entry frees its quota slot.
          </p>
        </div>
        {schoolEntries.length === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
            No student entries have been submitted.
          </p>
        ) : schoolEntries.map(({ school, competitions: schoolCompetitions }) => (
          <article key={school.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <header className="border-b border-slate-100 bg-slate-50 px-5 py-4">
              <h3 className="font-semibold text-slate-900">{school.name}</h3>
              <p className="text-xs text-slate-500">{school.district} · {school.email}</p>
            </header>
            <div className="divide-y divide-slate-100">
              {schoolCompetitions.map(({ competition, entries }) => (
                <section key={competition.id} className="space-y-3 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="text-sm font-semibold text-slate-800">{competition.title}</h4>
                    <span className="text-xs text-slate-500">
                      {entries.length} / {competition.maxEntriesPerSchool} entries
                    </span>
                  </div>
                  {entries.map((entry) => (
                    <div key={entry.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {entry.studentName} <span className="font-normal text-slate-500">· {entry.entryTitle}</span>
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {entry.studentGrade} · {entry.status.replace('_', ' ')} · submitted {entry.submittedAt}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={workingId === entry.id || !isSubmissionsLoaded}
                        onClick={() => void handleRemoveEntry(entry.id)}
                        className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-800 hover:bg-rose-50 disabled:opacity-50"
                      >
                        <Trash2 size={13} />
                        Remove & reopen slot
                      </button>
                    </div>
                  ))}
                </section>

              ))}
            </div>
          </article>
        ))}
      </section>

      {approvalSchoolId && (() => {
        const school = schools.find((entry) => entry.id === approvalSchoolId);
        if (!school) return null;
        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4" role="presentation">
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="approve-school-title"
              className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                    <ShieldCheck size={20} />
                  </span>
                  <div>
                    <h2 id="approve-school-title" className="text-lg font-semibold text-slate-950">Review school registration</h2>
                    <p className="text-xs text-slate-500">Approval immediately enables sign-in and submissions.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setApprovalSchoolId(null)}
                  disabled={workingId === approvalSchoolId}
                  aria-label="Close approval dialog"
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
                <p className="font-semibold text-slate-900">{school.name}</p>
                <p className="mt-1 text-slate-600">{school.email}</p>
                <p className="mt-1 text-xs text-slate-500">{school.district}, {school.province} · {school.badgeCode}</p>
                <p className="mt-3 text-xs text-slate-600">
                  Teacher-in-charge: {school.teacherInCharge} · {school.teacherPhone}
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  Media president: {school.mediaPresident} · {school.presidentPhone}
                </p>
              </div>
              {actionError && (
                <p role="alert" className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                  {actionError}
                </p>
              )}
              <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-950">
                <input
                  type="checkbox"
                  checked={reviewConfirmed}
                  onChange={(event) => setReviewConfirmed(event.target.checked)}
                  className="mt-0.5 accent-amber-700"
                />
                I have reviewed these school details and confirm this registration should be activated.
              </label>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setApprovalSchoolId(null)}
                  disabled={workingId === approvalSchoolId}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void saveSchoolStatus(school.id, 'active')}
                  disabled={!reviewConfirmed || workingId === school.id}
                  className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {workingId === school.id ? 'Activating…' : 'Confirm and activate'}
                </button>
              </div>
            </section>
          </div>
        );
      })()}
    </div>
  );
}
