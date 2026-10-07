'use client';

import React, { useMemo, useState } from 'react';
import { useMediaStore } from '@/lib/store';
import { Competition } from '@/lib/types';
import { StatusBadge } from '@/components/ui/Badge';
import { CompetitionFormEditorModal } from './CompetitionFormEditorModal';
import { Plus, Edit3, Eye, Trash2 } from 'lucide-react';

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
    <div className="space-y-6">
      {/* Top Bar with Add Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div>
          <h3 className="text-xl font-serif font-bold text-slate-900 tracking-tight">
            Competitions ({competitions.length})
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {openCount} open for entries. Check eligibility, deadline, school entry limit, and form questions before opening a track.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all shadow-xs"
        >
          <Plus size={15} />
          <span>Add competition</span>
        </button>
      </div>

      <section className="grid grid-cols-1 gap-2 rounded-xl border border-slate-200 bg-white p-4 text-xs leading-5 text-slate-600 sm:grid-cols-3">
        <p><strong className="text-slate-900">Open:</strong> schools can submit entries before the deadline.</p>
        <p><strong className="text-slate-900">Closed:</strong> new entries are not accepted.</p>
        <p><strong className="text-slate-900">Upcoming / judging:</strong> not accepting entries; set Open when ready to launch.</p>
      </section>

      {/* Competitions Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {competitions.map((comp) => {
          const submissionCount = submissionCounts.get(comp.id) ?? 0;

          return (
            <div
              key={comp.id}
              className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-mono text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                    {comp.category}
                  </span>
                  <StatusBadge status={comp.status} />
                </div>

                <h4 className="text-2xl font-serif font-bold text-slate-900 mb-2">
                  {comp.title}
                </h4>

                <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed font-light">
                  {comp.description}
                </p>

                <div className="space-y-1.5 py-3 border-y border-slate-100 text-xs text-slate-700 mb-4 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Submission deadline:</span>
                    <span className="text-amber-700 font-semibold">{new Date(`${comp.deadline}T00:00:00`).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Entries received:</span>
                    <span className="text-slate-900 font-bold">{submissionCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Eligibility:</span>
                    <span className="text-slate-800">{comp.eligibility}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => void handleToggleStatus(
                      comp.id,
                      comp.status === 'open' ? 'closed' : 'open'
                    )}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 font-medium"
                  >
                    {comp.status === 'open' ? 'Close entries' : 'Open entries'}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(comp, true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 font-medium transition-colors hover:bg-slate-50"
                  >
                    <Eye size={13} />
                    <span>Preview</span>
                  </button>

                  <button
                    onClick={() => handleOpenEdit(comp)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-xs text-amber-800 font-medium transition-colors"
                  >
                    <Edit3 size={13} />
                    <span>Edit Form</span>
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
