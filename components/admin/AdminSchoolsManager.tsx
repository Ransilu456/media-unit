'use client';

import React, { useEffect, useState } from 'react';
import { useMediaStore } from '@/lib/store';
import { StatusBadge } from '@/components/ui/Badge';
import { Search, Filter, Trash2, Clock3, ShieldCheck, X, School, FileText } from 'lucide-react';

type SchoolStatus = 'active' | 'pending' | 'suspended' | 'banned';

function formatRegistrationDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Registration date unavailable';
  return `Registered ${new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)}`;
}

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
  const [statusDialog, setStatusDialog] = useState<{ schoolId: string; status: SchoolStatus } | null>(null);
  const [reviewConfirmed, setReviewConfirmed] = useState(false);

  useEffect(() => {
    if (!statusDialog) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && workingId !== statusDialog.schoolId) {
        setStatusDialog(null);
      }
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [statusDialog, workingId]);

  const saveSchoolStatus = async (
    id: string,
    status: SchoolStatus
  ) => {
    setWorkingId(id);
    setActionError(null);
    try {
      await updateSchoolStatus(id, status);
      setStatusDialog(null);
    } catch (error: unknown) {
      setActionError(error instanceof Error ? error.message : 'Unable to save the school status.');
    } finally {
      setWorkingId(null);
    }
  };

  const requestSchoolStatusUpdate = (
    id: string,
    status: SchoolStatus,
  ) => {
    setActionError(null);
    setReviewConfirmed(false);
    setStatusDialog({ schoolId: id, status });
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
  const competitionsById = new Map(competitions.map((competition) => [competition.id, competition]));
  const entriesBySchool = new Map<string, Map<string, {
      competition: { id: string; title: string; maxEntriesPerSchool: number };
      entries: typeof submissions;
    }>>();

  submissions.forEach((submission) => {
    let competitionGroups = entriesBySchool.get(submission.schoolId);
    if (!competitionGroups) {
      competitionGroups = new Map();
      entriesBySchool.set(submission.schoolId, competitionGroups);
    }

    let group = competitionGroups.get(submission.competitionId);
    if (!group) {
      const competition = competitionsById.get(submission.competitionId);
      group = {
        competition: {
          id: submission.competitionId,
          title: competition?.title ?? submission.competitionTitle,
          maxEntriesPerSchool: competition?.maxEntriesPerSchool ?? 0,
        },
        entries: [],
      };
      competitionGroups.set(submission.competitionId, group);
    }
    group.entries.push(submission);
  });

  const schoolEntries = filtered.map((school) => ({
    school,
    competitions: [...(entriesBySchool.get(school.id)?.values() ?? [])].sort((left, right) =>
      left.competition.title.localeCompare(right.competition.title)
    ),
  })).filter((group) => group.competitions.length > 0);

  return (
    <div className="space-y-6">
      {actionError && (
        <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
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
              <article key={request.id} className="rounded-2xl border border-orange-200 bg-orange-50/60 p-4 shadow-[0_1px_4px_rgba(15,23,42,0.04)]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs font-semibold text-orange-900">
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
            <p className="mt-1 text-sm text-slate-600">Review and manage school accounts.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href="#school-entry-management"
              className="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-800 transition hover:bg-sky-100"
            >
              <FileText size={14} />
              Entries · {submissions.length}
            </a>
            {pendingCount > 0 && (
              <button
                type="button"
                onClick={() => setStatusFilter('pending')}
                className="inline-flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-900 transition hover:bg-orange-100"
              >
                <Clock3 size={14} />
                Pending · {pendingCount}
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="School account status counts">
        {[
          { label: 'Pending', value: pendingCount, borderTone: 'border-t-orange-300', badgeTone: 'text-orange-800 bg-orange-50' },
          { label: 'Active', value: activeCount, borderTone: 'border-t-emerald-300', badgeTone: 'text-emerald-800 bg-emerald-50' },
          { label: 'Suspended', value: suspendedCount, borderTone: 'border-t-rose-300', badgeTone: 'text-rose-800 bg-rose-50' },
          { label: 'Banned', value: bannedCount, borderTone: 'border-t-red-300', badgeTone: 'text-red-900 bg-red-50' },
        ].map(({ label, value, borderTone, badgeTone }) => (
          <div key={label} className={`rounded-2xl border border-slate-200/80 border-t-2 bg-white p-4 shadow-[0_8px_24px_rgba(59,130,246,0.06)] ${borderTone}`}>
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-slate-600">{label}</p>
              <span className={`rounded-md px-2 py-1 text-xs font-semibold ${badgeTone}`}>{value}</span>
            </div>
          </div>
        ))}
      </section>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_4px_rgba(15,23,42,0.04)] sm:flex-row">
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search school, district, code..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-xs text-slate-900 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 sm:text-sm"
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
                    ? 'bg-sky-700 text-white font-semibold'
                    : 'bg-slate-50 text-slate-600 hover:bg-sky-50 hover:text-sky-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Schools Table / Grid */}
      <div className="grid grid-cols-1 items-start gap-3 xl:grid-cols-2">
        {filtered.map((school) => {
          const schoolSubmissions = submissions.filter((sub) => sub.schoolId === school.id);

          return (
            <div
              key={school.id}
              className="flex min-w-0 flex-col justify-between gap-4 rounded-2xl border border-sky-100/80 bg-white p-4 shadow-[0_8px_24px_rgba(59,130,246,0.06)] transition-colors hover:border-sky-200 sm:p-5"
            >
              <div className="space-y-2 max-w-xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-slate-700">
                    {school.badgeCode}
                  </span>
                  <StatusBadge status={school.status} />
                  <time
                    dateTime={school.registeredAt}
                    className="text-[11px] text-slate-500"
                    title={new Date(school.registeredAt).toLocaleString()}
                  >
                    {formatRegistrationDate(school.registeredAt)}
                  </time>
                </div>

                <h3 className="text-lg font-semibold tracking-tight text-slate-950 sm:text-xl">
                  {school.name}
                </h3>

                <p className="text-sm text-slate-500">
                  {school.district} • {school.province}
                </p>

                <div className="grid grid-cols-1 gap-x-4 gap-y-2 border-t border-slate-100 pt-3 text-xs text-slate-700 sm:grid-cols-2">
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
                      className="break-all text-slate-700 underline decoration-slate-300 underline-offset-2 hover:text-orange-800"
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
              <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                <button
                  onClick={() => requestSchoolStatusUpdate(school.id, 'active')}
                  disabled={school.status === 'active' || workingId === school.id}
                  title={school.status === 'pending' ? 'Review and approve this school registration.' : undefined}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                    school.status === 'active'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-50 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {school.status === 'banned' || school.status === 'suspended' ? 'Restore / Active' : 'Review & approve'}
                </button>
                <button
                  onClick={() => requestSchoolStatusUpdate(school.id, 'pending')}
                  disabled={school.status === 'pending' || workingId === school.id}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    school.status === 'pending'
                      ? 'bg-orange-50 text-orange-800 border border-orange-200'
                      : 'bg-slate-50 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => requestSchoolStatusUpdate(school.id, 'suspended')}
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
                  onClick={() => requestSchoolStatusUpdate(school.id, 'banned')}
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
          <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-600">
            <School size={22} className="mx-auto mb-2 text-slate-400" />
            No schools match these filters. Try a different search or account status.
          </div>
        )}
      </div>

      <section id="school-entry-management" className="scroll-mt-6 space-y-4 border-t border-slate-200 pt-8">
        <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-[0_8px_24px_rgba(59,130,246,0.06)] sm:p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">School entry management</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-950">Entries grouped by school</h2>
          <p className="mt-1 text-sm text-slate-600">
            Review all student entries under each school and competition. Removing an entry frees its quota slot.
          </p>
        </div>
        {schoolEntries.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            No student entries have been submitted.
          </p>
        ) : schoolEntries.map(({ school, competitions: schoolCompetitions }) => {
          const entryCount = schoolCompetitions.reduce((total, group) => total + group.entries.length, 0);
          const awaitingCount = schoolCompetitions.reduce(
            (total, group) => total + group.entries.filter((entry) => entry.status === 'submitted').length,
            0
          );
          return (
            <details key={school.id} className="group/school overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-[0_8px_24px_rgba(59,130,246,0.06)]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 bg-white px-4 py-4 transition hover:bg-slate-50 [&::-webkit-details-marker]:hidden sm:px-5">
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-slate-900">{school.name}</span>
                  <span className="mt-1 block truncate text-xs text-slate-500">{school.district} · {school.email}</span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  {awaitingCount > 0 && (
                    <span className="hidden rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-medium text-orange-800 sm:inline">
                      {awaitingCount} awaiting
                    </span>
                  )}
                  <span className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
                    {entryCount} {entryCount === 1 ? 'entry' : 'entries'}
                    <span aria-hidden="true" className="text-base transition-transform group-open/school:rotate-180">⌄</span>
                  </span>
                </span>
              </summary>
              <div className="space-y-2 border-t border-slate-100 bg-slate-50/60 p-3 sm:p-4">
                {schoolCompetitions.map(({ competition, entries }) => (
                  <details key={competition.id} open={schoolCompetitions.length === 1} className="group/competition overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-slate-900">{competition.title}</span>
                        <span className="mt-0.5 block text-xs text-slate-500">
                          {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
                          {competition.maxEntriesPerSchool > 0 ? ` · ${competition.maxEntriesPerSchool} allowed per school` : ''}
                        </span>
                      </span>
                      <span aria-hidden="true" className="shrink-0 text-slate-400 transition-transform group-open/competition:rotate-180">⌄</span>
                    </summary>
                    <div className="space-y-2 border-t border-slate-100 bg-slate-50/60 p-3">
                    {entries.map((entry) => (
                      <div key={entry.id} className="flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p className="break-words text-sm font-semibold text-slate-900">
                            {entry.entryTitle}
                          </p>
                          <p className="mt-1 text-xs text-slate-600">
                            {entry.studentName} · {entry.studentGrade}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <StatusBadge status={entry.status} />
                            <span className="text-[11px] text-slate-500">Submitted {entry.submittedAt}</span>
                          </div>
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
                    </div>
                  </details>
                ))}
              </div>
            </details>
          );
        })}
      </section>

      {statusDialog && (() => {
        const school = schools.find((entry) => entry.id === statusDialog.schoolId);
        if (!school) return null;
        const statusCopy: Record<SchoolStatus, { title: string; description: string; impact: string; action: string; tone: string }> = {
          active: {
            title: 'Review school registration',
            description: 'Approval immediately enables sign-in and submissions.',
            impact: 'This school will be able to sign in and submit competition entries.',
            action: 'Confirm and activate',
            tone: 'bg-emerald-700 hover:bg-emerald-800',
          },
          pending: {
            title: 'Move school to pending',
            description: 'The account will require review before it can be used.',
            impact: 'Sign-in and new submissions will be unavailable until the school is activated.',
            action: 'Set as pending',
            tone: 'bg-orange-700 hover:bg-orange-800',
          },
          suspended: {
            title: 'Suspend school account',
            description: 'Temporarily disable this school’s portal access.',
            impact: 'The school will be unable to sign in or submit entries until restored.',
            action: 'Suspend account',
            tone: 'bg-rose-700 hover:bg-rose-800',
          },
          banned: {
            title: 'Ban school account',
            description: 'Disable this school’s portal access until it is restored.',
            impact: 'The school will be unable to sign in or submit entries. This can be reversed later.',
            action: 'Ban account',
            tone: 'bg-red-800 hover:bg-red-900',
          },
        };
        const copy = statusCopy[statusDialog.status];
        return (
          <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/50 p-4" role="presentation">
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="school-status-title"
              className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_16px_48px_rgba(15,23,42,0.14)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-800">
                    <ShieldCheck size={20} />
                  </span>
                  <div>
                    <h2 id="school-status-title" className="text-lg font-semibold text-slate-950">{copy.title}</h2>
                    <p className="text-xs text-slate-500">{copy.description}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStatusDialog(null)}
                  disabled={workingId === statusDialog.schoolId}
                  aria-label="Close school status dialog"
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
                <p className="mt-3 rounded-lg border border-orange-100 bg-orange-50/70 p-3 text-xs leading-relaxed text-slate-700">
                  {copy.impact}
                </p>
              </div>
              {actionError && (
                <p role="alert" className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                  {actionError}
                </p>
              )}
              <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 p-3 text-xs leading-relaxed text-orange-950">
                <input
                  type="checkbox"
                  checked={reviewConfirmed}
                  onChange={(event) => setReviewConfirmed(event.target.checked)}
                  className="mt-0.5 accent-orange-700"
                />
                I understand this change will take effect immediately.
              </label>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setStatusDialog(null)}
                  disabled={workingId === statusDialog.schoolId}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void saveSchoolStatus(school.id, statusDialog.status)}
                  disabled={!reviewConfirmed || workingId === school.id}
                  className={`rounded-lg px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 ${copy.tone}`}
                >
                  {workingId === school.id ? 'Saving…' : copy.action}
                </button>
              </div>
            </section>
          </div>
        );
      })()}
    </div>
  );
}
