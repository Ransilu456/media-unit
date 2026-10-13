'use client';

import { useMemo, useState } from 'react';
import type { SubmissionStatus } from '@/lib/types';
import { useMediaStore } from '@/lib/store';
import { EntryStatusGuide } from '@/components/dashboard/EntryStatusGuide';
import { StatusBadge } from '@/components/ui/Badge';
import { DropdownSelect } from '@/components/ui/DropdownSelect';
import {
  BadgeCheck,
  Check,
  Clock3,
  ExternalLink,
  FileCheck2,
  FileText,
  Lock,
  RotateCcw,
  Search,
  Save,
  Trophy,
  Unlock,
} from 'lucide-react';

type QueueFilter = 'all' | 'needs-review' | 'in-progress' | 'decided';

const statusLabels: Record<SubmissionStatus, string> = {
  submitted: 'Awaiting review',
  under_review: 'Under review',
  verified: 'Accepted',
  shortlisted: 'Shortlisted',
  winner: 'Winner',
  disqualified: 'Rejected',
};

const statusTone: Record<SubmissionStatus, string> = {
  submitted: 'border-orange-200 bg-orange-50 text-orange-900',
  under_review: 'border-sky-200 bg-sky-50 text-sky-800',
  verified: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  shortlisted: 'border-sky-200 bg-sky-50 text-sky-800',
  winner: 'border-orange-200 bg-orange-50 text-orange-900',
  disqualified: 'border-rose-200 bg-rose-50 text-rose-800',
};

function getDecisionHelp(status: SubmissionStatus): string {
  switch (status) {
    case 'submitted':
      return 'Leave in the queue until review begins.';
    case 'under_review':
      return 'Let the school know adjudication is in progress.';
    case 'verified':
      return 'Confirm that the entry is eligible and accepted.';
    case 'shortlisted':
      return 'Mark the entry as a finalist.';
    case 'winner':
      return 'Record the final competition result.';
    case 'disqualified':
      return 'A clear rejection reason is required and visible to the school.';
  }
}

export function AdminSubmissionsReview() {
  const { submissions, schools, competitions, updateSubmissionStatus } = useMediaStore();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [schoolFilter, setSchoolFilter] = useState('all');
  const [queueFilter, setQueueFilter] = useState<QueueFilter>('all');
  const [editingScores, setEditingScores] = useState<Record<string, number>>({});
  const [clearedScoreIds, setClearedScoreIds] = useState<string[]>([]);
  const [editingFeedback, setEditingFeedback] = useState<Record<string, string>>({});
  const [editingStatuses, setEditingStatuses] = useState<Record<string, SubmissionStatus>>({});
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
  const [savingIds, setSavingIds] = useState<string[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [saveErrors, setSaveErrors] = useState<Record<string, string>>({});
  const competitionFieldsById = useMemo(
    () => new Map(
      competitions.map((competition) => [
        competition.id,
        new Map((competition.customFields ?? []).map((field) => [field.id, field.label])),
      ])
    ),
    [competitions]
  );

  const schoolSubmissions = schoolFilter === 'all'
    ? submissions
    : submissions.filter((submission) => submission.schoolId === schoolFilter);
  const categories = [...new Set(schoolSubmissions.map((submission) => submission.category))];
  const awaitingReviewCount = schoolSubmissions.filter(
    (submission) => submission.status === 'submitted'
  ).length;
  const inProgressCount = schoolSubmissions.filter(
    (submission) => submission.status === 'under_review'
  ).length;
  const decidedCount = schoolSubmissions.filter(
    (submission) => !['submitted', 'under_review'].includes(submission.status)
  ).length;

  const filtered = schoolSubmissions.filter((submission) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || [
      submission.entryTitle,
      submission.studentName,
      submission.schoolName,
      submission.competitionTitle,
    ].some((value) => value.toLowerCase().includes(query));
    const matchesCategory = categoryFilter === 'All' || submission.category === categoryFilter;
    const matchesQueue = queueFilter === 'all'
      || (queueFilter === 'needs-review' && submission.status === 'submitted')
      || (queueFilter === 'in-progress' && submission.status === 'under_review')
      || (queueFilter === 'decided' && !['submitted', 'under_review'].includes(submission.status));
    return matchesSearch && matchesCategory && matchesQueue;
  });
  const schoolGroups = useMemo(() => {
    const groups = new Map<string, {
      schoolId: string;
      schoolName: string;
      competitions: Map<string, { competitionId: string; competitionTitle: string; submissions: typeof filtered }>;
    }>();
    const schoolNames = new Map(schools.map((school) => [school.id, school.name]));

    filtered.forEach((submission) => {
      const schoolId = submission.schoolId || submission.schoolName;
      let schoolGroup = groups.get(schoolId);
      if (!schoolGroup) {
        schoolGroup = {
          schoolId,
          schoolName: schoolNames.get(submission.schoolId) ?? submission.schoolName ?? 'Unregistered school',
          competitions: new Map(),
        };
        groups.set(schoolId, schoolGroup);
      }

      let competitionGroup = schoolGroup.competitions.get(submission.competitionId);
      if (!competitionGroup) {
        competitionGroup = {
          competitionId: submission.competitionId,
          competitionTitle: submission.competitionTitle,
          submissions: [],
        };
        schoolGroup.competitions.set(submission.competitionId, competitionGroup);
      }
      competitionGroup.submissions.push(submission);
    });

    return [...groups.values()]
      .map((group) => ({
        ...group,
        competitions: [...group.competitions.values()].sort((left, right) =>
          left.competitionTitle.localeCompare(right.competitionTitle)
        ),
      }))
      .sort((left, right) => left.schoolName.localeCompare(right.schoolName));
  }, [filtered, schools]);

  const handleSaveReview = async (id: string, originalStatus: SubmissionStatus) => {
    const status = editingStatuses[id] ?? originalStatus;
    const score = editingScores[id];
    const feedback = editingFeedback[id] ?? '';
    const clearScore = clearedScoreIds.includes(id);
    if (status === 'disqualified' && !feedback.trim()) {
      setSaveErrors((previous) => ({
        ...previous,
        [id]: 'Add a clear rejection reason before rejecting this entry.',
      }));
      return;
    }

    setSavingIds((previous) => [...previous, id]);
    setSavedIds((previous) => previous.filter((savedId) => savedId !== id));
    setSaveErrors((previous) => ({ ...previous, [id]: '' }));
    try {
      await updateSubmissionStatus(id, status, score, feedback, clearScore);
      setSavedIds((previous) => [...previous, id]);
      setUnlockedIds((previous) => previous.filter((unlockedId) => unlockedId !== id));
      setClearedScoreIds((previous) => previous.filter((entryId) => entryId !== id));
    } catch (error: unknown) {
      setSaveErrors((previous) => ({
        ...previous,
        [id]: error instanceof Error ? error.message : 'Unable to save the review.',
      }));
    } finally {
      setSavingIds((previous) => previous.filter((savingId) => savingId !== id));
    }
  };

  const handleUnlock = (submissionItem: (typeof submissions)[0]) => {
    setEditingStatuses((previous) => ({ ...previous, [submissionItem.id]: submissionItem.status }));
    if (submissionItem.score !== undefined) {
      setEditingScores((previous) => ({ ...previous, [submissionItem.id]: submissionItem.score! }));
    }
    setEditingFeedback((previous) => ({ ...previous, [submissionItem.id]: submissionItem.judgeFeedback || '' }));
    setUnlockedIds((previous) => [...previous, submissionItem.id]);
    clearSaveMessage(submissionItem.id);
  };

  const handleLock = (id: string) => {
    setUnlockedIds((previous) => previous.filter((unlockedId) => unlockedId !== id));
    setClearedScoreIds((previous) => previous.filter((entryId) => entryId !== id));
    setEditingStatuses((previous) => {
      const next = { ...previous };
      delete next[id];
      return next;
    });
    setEditingScores((previous) => {
      const next = { ...previous };
      delete next[id];
      return next;
    });
    setEditingFeedback((previous) => {
      const next = { ...previous };
      delete next[id];
      return next;
    });
    clearSaveMessage(id);
  };

  const clearSaveMessage = (id: string) => {
    setSavedIds((previous) => previous.filter((savedId) => savedId !== id));
    setSaveErrors((previous) => {
      if (!previous[id]) return previous;
      const next = { ...previous };
      delete next[id];
      return next;
    });
  };

  const queueOptions: Array<{ id: QueueFilter; label: string; count: number }> = [
    { id: 'needs-review', label: 'Awaiting review', count: awaitingReviewCount },
    { id: 'in-progress', label: 'In progress', count: inProgressCount },
    { id: 'decided', label: 'Decided', count: decidedCount },
    { id: 'all', label: 'All entries', count: schoolSubmissions.length },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <section className="rounded-2xl border border-sky-100/80 bg-white p-4 shadow-[0_8px_28px_rgba(59,130,246,0.07)] sm:p-5">
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
              By school
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
              Submission review
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Review entries and share decisions.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:min-w-[330px]">
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 px-3 py-3">
              <p className="text-xl font-semibold tabular-nums text-slate-900">{awaitingReviewCount}</p>
              <p className="mt-0.5 text-[10px] font-medium leading-4 text-slate-500">Awaiting</p>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 px-3 py-3">
              <p className="text-xl font-semibold tabular-nums text-slate-900">{inProgressCount}</p>
              <p className="mt-0.5 text-[10px] font-medium leading-4 text-slate-500">In progress</p>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 px-3 py-3">
              <p className="text-xl font-semibold tabular-nums text-slate-900">{decidedCount}</p>
              <p className="mt-0.5 text-[10px] font-medium leading-4 text-slate-500">Decided</p>
            </div>
          </div>
        </div>
      </section>

      <EntryStatusGuide />

      <section aria-label="Submission queue" className="space-y-3">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter review queue">
          {queueOptions.map((option) => {
            const active = queueFilter === option.id;
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={active}
                onClick={() => setQueueFilter(option.id)}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                  active
                    ? 'border-sky-700 bg-sky-700 text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:bg-sky-50'
                }`}
              >
                {option.label}
                <span className={`rounded-md px-1.5 py-0.5 text-[10px] tabular-nums ${
                  active ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {option.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-2 rounded-2xl border border-sky-100/80 bg-white p-3 shadow-[0_8px_28px_rgba(59,130,246,0.06)] sm:flex-row">
          <label className="relative min-w-0 flex-1">
            <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
            <span className="sr-only">Search entries</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search entry, student, school, or competition"
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </label>
          <label>
            <span className="sr-only">Filter by school</span>
            <DropdownSelect
              value={schoolFilter}
              onChange={(value) => {
                setSchoolFilter(value);
                setCategoryFilter('All');
              }}
              ariaLabel="Filter by school"
              options={[
                { value: 'all', label: 'All schools' },
                ...[...schools]
                  .sort((left, right) => left.name.localeCompare(right.name))
                  .map((school) => ({ value: school.id, label: school.name })),
              ]}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 sm:w-56"
            />
          </label>
          <label>
            <span className="sr-only">Filter by category</span>
            <DropdownSelect
              value={categoryFilter}
              onChange={setCategoryFilter}
              ariaLabel="Filter by category"
              options={[
                { value: 'All', label: 'All categories' },
                ...categories.map((category) => ({ value: category, label: category })),
              ]}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 sm:w-56"
            />
          </label>
        </div>

        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-medium text-slate-500" aria-live="polite">
            {filtered.length
              ? `Showing ${filtered.length} of ${schoolSubmissions.length} ${schoolSubmissions.length === 1 ? 'entry' : 'entries'}${schoolFilter === 'all' ? ' across all schools' : ''}`
              : 'No matching entries'}
          </p>
          {(search || categoryFilter !== 'All' || schoolFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setCategoryFilter('All');
                setSchoolFilter('all');
              }}
              className="text-xs font-medium text-orange-800 underline underline-offset-2"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="space-y-6">
          {schoolGroups.map((group, groupIndex) => (
            <details key={group.schoolId} open={schoolFilter !== 'all' || groupIndex === 0} className="group/school overflow-hidden rounded-2xl border border-sky-100/80 bg-white shadow-[0_8px_28px_rgba(59,130,246,0.06)]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 bg-white px-4 py-4 transition hover:bg-slate-50/70 [&::-webkit-details-marker]:hidden sm:px-5">
                <span className="min-w-0">
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">School</span>
                  <span className="mt-1 block truncate text-base font-semibold text-slate-950">{group.schoolName}</span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {group.competitions.reduce((count, competition) => count + competition.submissions.length, 0)}{' '}
                    {group.competitions.reduce((count, competition) => count + competition.submissions.length, 0) === 1 ? 'entry' : 'entries'}
                  </span>
                  <span aria-hidden="true" className="text-lg text-orange-700 transition-transform group-open/school:rotate-180">⌄</span>
                </span>
              </summary>
              <div className="space-y-3 border-t border-slate-100 bg-slate-50/60 p-3 sm:p-4">
                {group.competitions.map((competitionGroup) => (
                  <details
                    key={competitionGroup.competitionId}
                    open={group.competitions.length === 1}
                    className="group/competition overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_5px_18px_rgba(59,130,246,0.05)]"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 transition hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-slate-900">{competitionGroup.competitionTitle}</span>
                        <span className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                          <span>{competitionGroup.submissions.length} {competitionGroup.submissions.length === 1 ? 'entry' : 'entries'}</span>
                          {competitionGroup.submissions.some((submission) => submission.status === 'submitted') && (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                              {competitionGroup.submissions.filter((submission) => submission.status === 'submitted').length} awaiting
                            </span>
                          )}
                          {competitionGroup.submissions.some((submission) => submission.status === 'under_review') && (
                            <span className="rounded-full bg-sky-50 px-2 py-0.5 font-medium text-sky-800">
                              {competitionGroup.submissions.filter((submission) => submission.status === 'under_review').length} in review
                            </span>
                          )}
                        </span>
                      </span>
                      <span aria-hidden="true" className="shrink-0 text-slate-400 transition-transform group-open/competition:rotate-180">⌄</span>
                    </summary>
                    <div className="space-y-2 border-t border-slate-100 bg-slate-50/60 p-3">
                {competitionGroup.submissions.map((submission) => {
            const currentStatus = editingStatuses[submission.id] ?? submission.status;
            const currentScore = clearedScoreIds.includes(submission.id)
              ? ''
              : editingScores[submission.id] !== undefined
              ? editingScores[submission.id]
              : submission.score ?? '';
            const currentFeedback = editingFeedback[submission.id] !== undefined
              ? editingFeedback[submission.id]
              : submission.judgeFeedback ?? '';
            const isSaving = savingIds.includes(submission.id);
            const isSaved = savedIds.includes(submission.id);
            const fieldLabels = competitionFieldsById.get(submission.competitionId);
            const customAnswers = Object.entries(submission.customValues ?? {})
              .filter(([, answer]) => answer.trim().length > 0);

            const isAlreadyDecided = submission.status !== 'submitted' || submission.score !== undefined || Boolean(submission.judgeFeedback);
            const isUnlocked = unlockedIds.includes(submission.id) || !isAlreadyDecided;

            return (
              <details key={submission.id} className="group/entry overflow-hidden rounded-xl border border-slate-200 bg-white">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3.5 py-3 hover:bg-slate-50/80 [&::-webkit-details-marker]:hidden">
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
                      <FileText size={16} />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-slate-900">{submission.entryTitle}</span>
                      <span className="mt-0.5 block truncate text-xs text-slate-500">{submission.studentName} · {submission.studentGrade}</span>
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className={`rounded-full border px-2 py-1 text-[10px] font-semibold ${statusTone[submission.status]}`}>{statusLabels[submission.status]}</span>
                    <span aria-hidden="true" className="text-slate-400 transition-transform group-open/entry:rotate-180">⌄</span>
                  </span>
                </summary>
                <article className="border-t border-slate-100 bg-white">
                <div className="h-1 bg-gradient-to-r from-slate-400 via-orange-400 to-orange-200" />

                <header className="flex flex-col gap-4 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5 sm:py-5">
                  <div className="flex min-w-0 gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700">
                      <FileText size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="truncate text-xs font-semibold text-slate-800">{submission.schoolName}</span>
                        <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />
                        <span className="text-xs text-slate-500">{submission.category}</span>
                        <span className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold ${statusTone[submission.status]}`}>
                          {statusLabels[submission.status]}
                        </span>
                      </div>
                      <h2 className="break-words text-lg font-semibold tracking-tight text-slate-950 sm:text-xl">
                        {submission.entryTitle}
                      </h2>
                      <p className="mt-1 text-xs text-slate-500">{submission.competitionTitle}</p>
                    </div>
                  </div>
                  <a
                    href={submission.submissionLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
                  >
                    <ExternalLink size={14} />
                    Open submitted work
                  </a>
                </header>

                <div className="grid gap-4 px-4 py-4 sm:px-5 md:grid-cols-[minmax(180px,0.75fr)_minmax(0,1.8fr)]">
                  <section aria-label="Student details" className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                    <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                      <BadgeCheck size={13} className="text-slate-400" /> Student
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{submission.studentName}</p>
                    <p className="mt-1 text-xs text-slate-600">
                      {submission.studentGrade} · Age {submission.studentAge}
                    </p>
                    <div className="mt-3 space-y-1.5 border-t border-slate-200/80 pt-3 text-xs text-slate-500">
                      <p>{submission.studentContact}</p>
                      <p>Submitted {submission.submittedAt}</p>
                    </div>
                  </section>

                  <section className="min-w-0">
                    <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                      <FileCheck2 size={13} className="text-slate-400" /> Project statement
                    </div>
                    <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                      {submission.synopsis}
                    </p>
                  </section>
                </div>

                {customAnswers.length > 0 && (
                  <section aria-label="Additional competition answers" className="border-t border-slate-100 px-4 py-4 sm:px-5">
                    <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Competition questions
                    </h3>
                    <dl className="grid gap-3 sm:grid-cols-2">
                      {customAnswers.map(([fieldId, answer]) => (
                        <div key={fieldId} className="rounded-lg bg-slate-50 p-3">
                          <dt className="text-xs font-semibold text-slate-700">
                            {fieldLabels?.get(fieldId) ?? fieldId}
                          </dt>
                          <dd className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-600">{answer}</dd>
                        </div>
                      ))}
                    </dl>
                  </section>
                )}

                {/* Locked / Protected Adjudication Summary Card (Prevents accidental edits) */}
                {!isUnlocked ? (
                  <section aria-label={`Adjudication summary for ${submission.entryTitle}`} className="border-t border-slate-200 bg-slate-50/60 px-4 py-4 sm:px-5 sm:py-5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3.5 border-b border-slate-200/80">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 shrink-0">
                          <Lock size={15} />
                        </span>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-bold text-slate-900">Review Decision</h3>
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-200/80 px-2.5 py-0.5 text-[10px] font-semibold text-slate-700">
                              🔒 Adjudication Locked
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">Locked to prevent accidental changes. Changes visible to {submission.schoolName}.</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleUnlock(submission)}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 shadow-2xs hover:bg-slate-50 hover:border-slate-400 transition-colors"
                      >
                        <Unlock size={14} className="text-orange-700" />
                        Unlock to Edit Decision
                      </button>
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Decision pill */}
                      <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Adjudication Decision</p>
                        <div className="mt-2 flex items-center gap-2.5">
                          <StatusBadge status={submission.status} />
                          <span className="text-xs font-semibold text-slate-700">({statusLabels[submission.status]})</span>
                        </div>
                        <p className="mt-2 text-[11px] text-slate-500 flex items-start gap-1">
                          <BadgeCheck size={13} className="mt-0.5 shrink-0 text-emerald-600" />
                          <span>{getDecisionHelp(submission.status)}</span>
                        </p>
                      </div>

                      {/* Score pill */}
                      <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Jury Score</p>
                          {submission.score !== undefined && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              Number(submission.score) >= 90
                                ? 'bg-orange-100 text-orange-900 border border-orange-200'
                                : Number(submission.score) >= 75
                                ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                : Number(submission.score) >= 60
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {Number(submission.score) >= 90
                                ? '★ Gold Tier'
                                : Number(submission.score) >= 75
                                ? '★ Silver Tier'
                                : Number(submission.score) >= 60
                                ? '★ Bronze Tier'
                                : 'Evaluated'}
                            </span>
                          )}
                        </div>
                        <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                          {submission.score !== undefined ? `${submission.score} ` : '— '}
                          <span className="text-xs font-normal text-slate-400">/ 100</span>
                        </p>
                        <p className="mt-1 text-[11px] text-slate-500">
                          {submission.score !== undefined ? 'Score visible on school delegation portal.' : 'No score recorded yet.'}
                        </p>
                      </div>
                    </div>

                    {/* Feedback block */}
                    <div className="mt-4 rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        {submission.status === 'disqualified' ? 'Rejection Reason / Grounds' : 'Official Jury Feedback'}
                      </p>
                      {submission.judgeFeedback ? (
                        <p className="mt-2 whitespace-pre-wrap rounded-lg bg-slate-50/70 p-3 text-xs leading-relaxed text-slate-800 border border-slate-100">
                          {submission.judgeFeedback}
                        </p>
                      ) : (
                        <p className="mt-2 text-xs italic text-slate-400">
                          No written feedback provided.
                        </p>
                      )}
                    </div>
                  </section>
                ) : (
                  /* Editable Adjudication Mode */
                  <section aria-label={`Review ${submission.entryTitle}`} className="border-t border-slate-200 bg-slate-50/70 px-4 py-4 sm:px-5 sm:py-5">
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-orange-700 shadow-2xs">
                          <Trophy size={14} />
                        </span>
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900">Review decision</h3>
                          <p className="text-[11px] text-slate-500">Changes are shared with the school when saved.</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isSaved && (
                          <span role="status" className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
                            <Check size={14} /> Review saved
                          </span>
                        )}
                        {isAlreadyDecided && (
                          <button
                            type="button"
                            onClick={() => handleLock(submission.id)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
                          >
                            <RotateCcw size={13} />
                            Cancel / Lock
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Top Row: Decision and Score in balanced 2 columns */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* 1. Adjudication Decision */}
                        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label htmlFor={`status-${submission.id}`} className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                1. Adjudication Decision
                              </label>
                              <StatusBadge status={currentStatus} />
                            </div>
                            <DropdownSelect
                              id={`status-${submission.id}`}
                              value={currentStatus}
                              onChange={(status) => {
                                setEditingStatuses((previous) => ({
                                  ...previous,
                                  [submission.id]: status,
                                }));
                                clearSaveMessage(submission.id);
                              }}
                              ariaLabel={`Adjudication decision for ${submission.entryTitle}`}
                              options={(Object.keys(statusLabels) as SubmissionStatus[]).map((status) => ({
                                value: status,
                                label: statusLabels[status],
                              }))}
                              ariaDescribedBy={`decision-help-${submission.id}`}
                              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none transition-colors focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:bg-white"
                            />
                          </div>
                          <p id={`decision-help-${submission.id}`} className="mt-3 flex items-start gap-1.5 text-[11px] leading-4 text-slate-500 pt-2 border-t border-slate-100">
                            {currentStatus === 'submitted' || currentStatus === 'under_review'
                              ? <Clock3 size={13} className="mt-0.5 shrink-0 text-orange-700" />
                              : <BadgeCheck size={13} className="mt-0.5 shrink-0 text-emerald-600" />}
                            <span>{getDecisionHelp(currentStatus)}</span>
                          </p>
                        </div>

                        {/* 2. Jury Score */}
                        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label htmlFor={`score-${submission.id}`} className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                2. Jury Score <span className="font-normal text-slate-400">/ 100</span>
                              </label>
                              {currentScore !== '' && Number(currentScore) >= 0 && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  Number(currentScore) >= 90
                                    ? 'bg-orange-100 text-orange-900 border border-orange-200'
                                    : Number(currentScore) >= 75
                                    ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                    : Number(currentScore) >= 60
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    : 'bg-slate-100 text-slate-700'
                                }`}>
                                  {Number(currentScore) >= 90
                                    ? '★ Gold Tier'
                                    : Number(currentScore) >= 75
                                    ? '★ Silver Tier'
                                    : Number(currentScore) >= 60
                                    ? '★ Bronze Tier'
                                    : 'Evaluated'}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <input
                                id={`score-${submission.id}`}
                                type="number"
                                min={0}
                                max={100}
                                value={currentScore}
                                onChange={(event) => {
                                  const value = event.target.value;
                                  setEditingScores((previous) => {
                                    if (value === '') {
                                      const next = { ...previous };
                                      delete next[submission.id];
                                      return next;
                                    }
                                    return { ...previous, [submission.id]: Number(value) };
                                  });
                                  setClearedScoreIds((previous) =>
                                    value === '' && submission.score !== undefined
                                      ? [...new Set([...previous, submission.id])]
                                      : previous.filter((entryId) => entryId !== submission.id)
                                  );
                                  clearSaveMessage(submission.id);
                                }}
                                placeholder="e.g. 85"
                                className="w-28 rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-center text-sm font-bold text-slate-900 outline-none transition-colors focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:bg-white"
                              />

                              {/* Quick score presets */}
                              <div className="flex items-center gap-1 overflow-x-auto text-xs">
                                {[60, 75, 85, 95].map((preset) => (
                                  <button
                                    key={preset}
                                    type="button"
                                    onClick={() => {
                                      setEditingScores((previous) => ({ ...previous, [submission.id]: preset }));
                                      setClearedScoreIds((previous) => previous.filter((entryId) => entryId !== submission.id));
                                      clearSaveMessage(submission.id);
                                    }}
                                    className="px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                                  >
                                    {preset}
                                  </button>
                                ))}
                                {currentScore !== '' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingScores((previous) => {
                                        const next = { ...previous };
                                        delete next[submission.id];
                                        return next;
                                      });
                                      setClearedScoreIds((previous) =>
                                        previous.includes(submission.id) ? previous : [...previous, submission.id]
                                      );
                                      clearSaveMessage(submission.id);
                                    }}
                                    className="px-2 py-1 rounded-lg text-[10px] text-slate-400 hover:text-rose-600 transition-colors"
                                  >
                                    Clear
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          <p className="mt-3 text-[11px] leading-4 text-slate-500 pt-2 border-t border-slate-100">
                            Official jury evaluation score visible to registered school delegation.
                          </p>
                        </div>
                      </div>

                      {/* 3. Feedback for School (Full Width, Spacious) */}
                      <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
                        <div className="flex items-center justify-between mb-2">
                          <label htmlFor={`feedback-${submission.id}`} className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                            3. {currentStatus === 'disqualified' ? 'Rejection Reason / Grounds' : 'Official Jury Feedback'}
                          </label>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {currentFeedback.length}/2,000 characters
                          </span>
                        </div>
                        <textarea
                          id={`feedback-${submission.id}`}
                          rows={3}
                          value={currentFeedback}
                          maxLength={2000}
                          onChange={(event) => {
                            setEditingFeedback((previous) => ({ ...previous, [submission.id]: event.target.value }));
                            clearSaveMessage(submission.id);
                          }}
                          placeholder={currentStatus === 'disqualified'
                            ? 'Explain the technical or eligibility grounds for disqualification so the school can review feedback…'
                            : 'Provide constructive feedback, strengths, and areas of refinement for the student…'}
                          className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-xs leading-relaxed text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:bg-white"
                        />
                      </div>

                      {/* Action Bar Footer */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                        <p className="text-[11px] text-slate-500">
                          Saving dispatches a real-time notification directly to <strong className="text-slate-700 font-semibold">{submission.schoolName}</strong>.
                        </p>

                        <div className="flex items-center gap-3 shrink-0">
                          {isSaved && (
                            <span role="status" className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                              <Check size={14} /> Review Saved & Sent
                            </span>
                          )}

                          <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => void handleSaveReview(submission.id, submission.status)}
                            className="inline-flex min-w-[130px] items-center justify-center gap-2 rounded-xl bg-orange-700 px-4 py-2.5 text-xs font-semibold text-white shadow-[0_1px_3px_rgba(15,23,42,0.08)] transition-colors hover:bg-orange-800 disabled:cursor-wait disabled:opacity-60"
                          >
                            {isSaving ? (
                              <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Saving Decision…</>
                            ) : isSaved ? (
                              <><Check size={14} /> Saved</>
                            ) : (
                              <><Save size={14} /> Save Review Decision</>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {saveErrors[submission.id] && (
                      <p role="alert" className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-800">
                        {saveErrors[submission.id]}
                      </p>
                    )}
                  </section>
                )}
                </article>
              </details>
            );
                })}
                    </div>
                  </details>
                ))}
              </div>
            </details>
          ))}

          {filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
              <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <Search size={18} />
              </span>
              <h2 className="mt-3 text-sm font-semibold text-slate-900">
                {submissions.length === 0 ? 'No submissions yet' : 'No entries in this view'}
              </h2>
              <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-500">
                {submissions.length === 0
                  ? 'When schools send in their entries, they will appear here for review.'
                  : 'Try another queue, remove the search term, or choose a different category.'}
              </p>
              {queueFilter !== 'all' && submissions.length > 0 && (
                <button
                  type="button"
                  onClick={() => setQueueFilter('all')}
                  className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700"
                >
                  View all entries
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
