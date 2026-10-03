'use client';

import React, { useState } from 'react';
import { useMediaStore } from '@/lib/store';
import { Competition } from '@/lib/types';
import { StatusBadge } from '@/components/ui/Badge';
import { CompetitionFormEditorModal } from './CompetitionFormEditorModal';
import { Plus, Edit3, Trash2 } from 'lucide-react';

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

  const handleOpenAdd = () => {
    setCompToEdit(null);
    setEditorOpen(true);
  };

  const handleOpenEdit = (comp: Competition) => {
    setCompToEdit(comp);
    setEditorOpen(true);
  };

  const handleSave = (compData: any) => {
    if (compToEdit) {
      updateCompetition(compToEdit.id, compData);
    } else {
      addCompetition(compData);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar with Add Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div>
          <h3 className="text-xl font-serif font-bold text-slate-900 tracking-tight">
            Competition Tracks & Dynamic Forms ({competitions.length})
          </h3>
          <p className="text-xs text-slate-500 font-light mt-0.5">
            Configure entry categories, submission quotas, deadlines, and dynamic form questions.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition-all shadow-sm"
        >
          <Plus size={15} />
          <span>Add Competition Track</span>
        </button>
      </div>

      {/* Competitions Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {competitions.map((comp) => {
          const compSubs = submissions.filter((s) => s.competitionId === comp.id);

          return (
            <div
              key={comp.id}
              className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-amber-300 transition-all flex flex-col justify-between"
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
                    <span className="text-slate-400">Deadline:</span>
                    <span className="text-amber-700 font-semibold">{comp.deadline}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Entries Lodged:</span>
                    <span className="text-slate-900 font-bold">{compSubs.length} entries</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Form Questions:</span>
                    <span className="text-slate-800">
                      Standard + {comp.customFields.length} custom fields
                    </span>
                  </div>
                </div>

                {comp.customFields.length > 0 && (
                  <div className="mb-4">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
                      Configured Custom Fields:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {comp.customFields.map((f) => (
                        <span
                          key={f.id}
                          className="px-2 py-0.5 rounded bg-slate-100 text-[10px] text-slate-700 font-mono"
                        >
                          {f.label} ({f.type})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() =>
                      updateCompetition(comp.id, {
                        status: comp.status === 'open' ? 'closed' : 'open',
                      })
                    }
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 font-medium"
                  >
                    Toggle {comp.status === 'open' ? 'Close' : 'Open'}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(comp)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-xs text-amber-800 font-medium transition-colors"
                  >
                    <Edit3 size={13} />
                    <span>Edit Form</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Delete track "${comp.title}"?`)) {
                        deleteCompetition(comp.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                    title="Delete Competition"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Form Editor Modal */}
      {editorOpen && (
        <CompetitionFormEditorModal
          isOpen={true}
          onClose={() => setEditorOpen(false)}
          competitionToEdit={compToEdit}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
