'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowRight, LockKeyhole, Trophy } from 'lucide-react';
import { EntrySubmissionModal } from '@/components/forms/EntrySubmissionModal';
import { useMediaStore } from '@/lib/store';
import type { Competition } from '@/lib/types';

const inputClassName =
  'w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-amber-500 focus:outline-none';

export function StudentEntryForm() {
  const { competitions, isLoaded, session, submissions } = useMediaStore();
  const [selectedCompetitionId, setSelectedCompetitionId] = useState('');
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);

  const school = session.type === 'school' ? session.school : undefined;
  const openCompetitions = competitions.filter((competition) => competition.status === 'open');
  const selectedOpenCompetition = openCompetitions.find(
    (competition) => competition.id === selectedCompetitionId
  );
  const entriesForCompetition = selectedOpenCompetition && school
    ? submissions.filter((entry) =>
        entry.competitionId === selectedOpenCompetition.id &&
        entry.schoolId === school.id &&
        entry.status !== 'disqualified'
      ).length
    : 0;
  const entryLimitReached = selectedOpenCompetition
    ? entriesForCompetition >= selectedOpenCompetition.maxEntriesPerSchool
    : false;

  if (!isLoaded) {
    return <p className="py-12 text-center text-sm text-slate-500">Loading competitions…</p>;
  }

  if (!school || school.status !== 'active') {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 text-center sm:p-8">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600">
          <LockKeyhole size={20} />
        </div>
        <h2 className="text-lg font-semibold text-slate-900">Submit through your school</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
          Competition entries must be submitted by an active, registered school account so the
          entry is linked to the correct school. Ask your teacher-in-charge to sign in here.
        </p>
        {school && school.status !== 'active' && (
          <p className="mt-3 text-sm text-amber-700">
            This school account is {school.status}; it cannot submit entries yet.
          </p>
        )}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700"
          >
            School sign in <ArrowRight size={15} />
          </Link>
          <Link
            href="/register"
            className="rounded-lg border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Register a school
          </Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
            <Trophy size={18} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Choose a competition</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Submissions are saved to your school account. Complete the student and entry details
              in the next step.
            </p>
          </div>
        </div>

        {openCompetitions.length > 0 ? (
          <div>
            <label htmlFor="application-competition" className="mb-2 block text-sm font-medium text-slate-700">
              Open competition
            </label>
            <select
              id="application-competition"
              required
              value={selectedCompetitionId}
              onChange={(event) => setSelectedCompetitionId(event.target.value)}
              className={inputClassName}
            >
              <option value="">Select a competition</option>
              {openCompetitions.map((competition) => (
                <option key={competition.id} value={competition.id}>
                  {competition.title}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
            There are no competitions open for entries right now.
          </p>
        )}

        {entryLimitReached && selectedOpenCompetition && (
          <p className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            Your school has used all {selectedOpenCompetition.maxEntriesPerSchool} allowed entries
            for this competition.
          </p>
        )}

        {selectedOpenCompetition && (
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-sm font-semibold text-slate-900">{selectedOpenCompetition.title}</p>
            <p className="mt-1 text-xs text-slate-500">
              {selectedOpenCompetition.category}
              {selectedOpenCompetition.medium !== 'None'
                ? ` · ${selectedOpenCompetition.medium} medium`
                : ''}
            </p>
            {selectedOpenCompetition.ageCategory && (
              <p className="mt-2 text-xs text-slate-500">
                Eligible ages {selectedOpenCompetition.ageCategory.minAge}–
                {selectedOpenCompetition.ageCategory.maxAge}
              </p>
            )}
          </div>
        )}

        <button
          type="button"
          disabled={!selectedOpenCompetition || entryLimitReached}
          onClick={() => setSelectedCompetition(selectedOpenCompetition ?? null)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-amber-600 px-5 py-3 text-sm font-semibold text-white hover:bg-amber-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 sm:w-auto"
        >
          Continue to application <ArrowRight size={15} />
        </button>
      </section>

      {selectedCompetition && (
        <EntrySubmissionModal
          isOpen
          competition={selectedCompetition}
          school={school}
          onClose={() => setSelectedCompetition(null)}
        />
      )}
    </>
  );
}
