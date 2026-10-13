'use client';

import React, { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useMediaStore } from '@/lib/store';
import { Competition } from '@/lib/types';
import { StatusBadge } from '@/components/ui/Badge';
import { Plus, Edit3, Eye, Trash2 } from 'lucide-react';

const categoryTones = [
  'border-sky-200 bg-sky-50 text-sky-800',
  'border-orange-200 bg-orange-50 text-orange-800',
  'border-teal-200 bg-teal-50 text-teal-800',
  'border-emerald-200 bg-emerald-50 text-emerald-800',
  'border-amber-200 bg-amber-50 text-amber-900',
];

const CompetitionFormEditorModal = dynamic(
  () => import('./CompetitionFormEditorModal').then((module) => module.CompetitionFormEditorModal),
  { loading: () => <div role="status" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 text-sm text-white">Loading competition editor...</div> }
);

export function AdminCompetitionsManager() {
  const {
    competitions,
    addCompetition,
    updateCompetition,
    deleteCompetition,
    submissions,
  } = useMediaStore();

  const [editorOpen, setEditorOpen] = useState(false);
  const [compToEdit, setCompToEdit] = useState<Competition | null>(null);
  const [startInPreview, setStartInPreview] = useState(false);

  const submissionCounts = useMemo(() => {
    const counts = new Map<string, number>();
    submissions.forEach((submission) => {
      counts.set(submission.competitionId, (counts.get(submission.competitionId) ?? 0) + 1);
    });
    return counts;
  }, [submissions]);

  const handleOpenAdd = () => {
    setCompToEdit(null);
    setStartInPreview(false);
    setEditorOpen(true);
  };

  const handleOpenEdit = (comp: Competition, preview = false) => {
    setCompToEdit(comp);
    setStartInPreview(preview);
    setEditorOpen(true);
  };

  const handleSave = async (compData: Omit<Competition, 'id'>) => {
    if (compToEdit) {
      await updateCompetition(compToEdit.id, compData);
    } else {
      await addCompetition(compData);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCompetition(id);
    } catch (error: unknown) {
      window.alert(error instanceof Error ? error.message : 'Unable to delete the competition.');
    }
  };

  const handleToggleStatus = async (id: string, status: Competition['status']) => {
    try {
      await updateCompetition(id, { status });
    } catch (error: unknown) {
      window.alert(error instanceof Error ? error.message : 'Unable to update the competition.');
    }
  };

  const openCount = competitions.filter((competition) => competition.status === 'open').length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-sky-100/80 bg-white p-4 shadow-[0_8px_26px_rgba(59,130,246,0.06)] sm:flex-row sm:items-center sm:p-5">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900">
            Competitions <span className="text-sm font-medium text-slate-400">({competitions.length})</span>
          </h1>
          <p className="mt-1 text-xs text-slate-500">{openCount} open</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-orange-700 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-orange-800"
        >
          <Plus size={15} />
          <span>Add competition</span>
        </button>
      </div>

      {/* Competitions Cards */}
      <div className="grid grid-cols-1 items-stretch gap-3 lg:grid-cols-2">
        {competitions.map((comp, index) => {
          const submissionCount = submissionCounts.get(comp.id) ?? 0;

          return (
            <div
              key={comp.id}
              className="flex min-w-0 flex-col justify-between rounded-2xl border border-orange-100/80 bg-white p-4 shadow-[0_8px_26px_rgba(249,115,22,0.06)] transition-colors hover:border-orange-200 sm:p-5"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${categoryTones[index % categoryTones.length]}`}>
                    {comp.category}
                  </span>
                  <StatusBadge status={comp.status} />
                </div>

                <h4 className="mb-2 text-lg font-semibold tracking-tight text-slate-900">
                  {comp.title}
                </h4>

                <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-slate-600">
                  {comp.description}
                </p>

                <div className="mb-3 grid grid-cols-2 gap-2 rounded-xl bg-slate-50/80 p-3 text-xs text-slate-700 sm:grid-cols-3">
                  <div className="min-w-0">
                    <span className="block text-[10px] text-slate-400">Deadline</span>
                    <span className="mt-0.5 block truncate font-medium text-slate-800">{new Date(`${comp.deadline}T00:00:00`).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400">Entries</span>
                    <span className="mt-0.5 block font-semibold text-slate-900">{submissionCount}</span>
                  </div>
                  <div className="col-span-2 min-w-0 sm:col-span-1">
                    <span className="block text-[10px] text-slate-400">Eligibility</span>
                    <span className="mt-0.5 block truncate text-slate-800">{comp.eligibility}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => void handleToggleStatus(
                      comp.id,
                      comp.status === 'open' ? 'closed' : 'open'
                    )}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    {comp.status === 'open' ? 'Close entries' : 'Open entries'}
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(comp, true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 font-medium transition-colors hover:bg-slate-50"
                  >
                    <Eye size={13} />
                    <span>Preview</span>
                  </button>

                  <button
                    onClick={() => handleOpenEdit(comp)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-medium text-orange-900 transition-colors hover:bg-orange-100"
                  >
                    <Edit3 size={13} />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => {
                      if (submissionCount === 0 && confirm(`Delete track "${comp.title}"? This cannot be undone.`)) {
                        void handleDelete(comp.id);
                      }
                    }}
                    disabled={submissionCount > 0}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                    title={submissionCount > 0 ? 'Close entries instead; this competition has submissions.' : 'Delete competition'}
                    aria-label={`Delete ${comp.title}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              {submissionCount > 0 && (
                <p className="mt-2 text-right text-[11px] text-slate-500">
                  Delete is unavailable because this competition has {submissionCount} {submissionCount === 1 ? 'entry' : 'entries'}.
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Form Editor Modal */}
      {editorOpen && (
        <CompetitionFormEditorModal
          key={compToEdit?.id ?? 'new-competition'}
          isOpen={true}
          onClose={() => setEditorOpen(false)}
          competitionToEdit={compToEdit}
          onSave={handleSave}
          startInPreview={startInPreview}
        />
      )}
    </div>
  );
}
