'use client';

import React, { useState } from 'react';
import { useMediaStore } from '@/lib/store';
import { Submission, SubmissionStatus } from '@/lib/types';
import { StatusBadge } from '@/components/ui/Badge';
import { Search, ExternalLink, Save } from 'lucide-react';

export function AdminSubmissionsReview() {
  const { submissions, updateSubmissionStatus } = useMediaStore();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [editingScores, setEditingScores] = useState<Record<string, number>>({});
  const [editingFeedback, setEditingFeedback] = useState<Record<string, string>>({});

  const categories = ['All', ...Array.from(new Set(submissions.map((s) => s.category)))];
  const statuses = ['All', 'submitted', 'under_review', 'verified', 'shortlisted', 'winner', 'disqualified'];

  const filtered = submissions.filter((sub) => {
    const matchesSearch =
      sub.entryTitle.toLowerCase().includes(search.toLowerCase()) ||
      sub.studentName.toLowerCase().includes(search.toLowerCase()) ||
      sub.schoolName.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === 'All' || sub.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || sub.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleSaveScoring = (id: string, currentStatus: SubmissionStatus) => {
    const score = editingScores[id];
    const feedback = editingFeedback[id];
    updateSubmissionStatus(id, currentStatus, score, feedback);
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by entry title, student, or school..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-amber-500 focus:bg-white"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-amber-500 focus:bg-white capitalize"
          >
            {statuses.map((st) => (
              <option key={st} value={st}>
                Status: {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {filtered.map((sub) => {
          const currentScore = editingScores[sub.id] !== undefined ? editingScores[sub.id] : (sub.score ?? '');
          const currentFeedback = editingFeedback[sub.id] !== undefined ? editingFeedback[sub.id] : (sub.judgeFeedback ?? '');

          return (
            <div
              key={sub.id}
              className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-amber-300 transition-all space-y-4"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-amber-700 font-semibold">
                      {sub.schoolName}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500">{sub.category}</span>
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">
                    {sub.entryTitle}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge status={sub.status} />
                  <a
                    href={sub.submissionLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 font-medium transition-colors"
                  >
                    <ExternalLink size={13} />
                    <span>Open Drive / Media</span>
                  </a>
                </div>
              </div>

              {/* Contestant Meta & Synopsis */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
                  <p className="text-slate-400">Student Contestant:</p>
                  <p className="text-slate-900 font-medium">{sub.studentName} ({sub.studentGrade})</p>
                  {sub.studentContact && (
                    <p className="text-slate-600 font-mono">{sub.studentContact}</p>
                  )}
                  <p className="text-slate-400 pt-1">Lodged: {sub.submittedAt}</p>
                </div>

                <div className="md:col-span-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                  <p className="text-slate-400 mb-1">Synopsis / Project Statement:</p>
                  <p className="text-slate-700 leading-relaxed font-light">{sub.synopsis}</p>
                </div>
              </div>

              {/* Custom Parameter Values */}
              {sub.customValues && Object.keys(sub.customValues).length > 0 && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-mono">
                  <p className="text-slate-400 mb-1 uppercase text-[10px]">
                    Category Specifications:
                  </p>
                  <div className="flex flex-wrap gap-4">
                    {Object.entries(sub.customValues).map(([k, v]) => (
                      <div key={k}>
                        <span className="text-slate-500 capitalize">{k.replace('_', ' ')}: </span>
                        <span className="text-slate-900 font-medium">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Adjudication Score & Comments Panel */}
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/70 space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="w-full sm:w-36">
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-600 mb-1">
                      Score (0 - 100)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={currentScore}
                      onChange={(e) =>
                        setEditingScores({ ...editingScores, [sub.id]: Number(e.target.value) })
                      }
                      placeholder="e.g. 92"
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono font-bold text-sm focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div className="flex-1">
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-600 mb-1">
                      Jury Notes & Adjudicator Critique
                    </label>
                    <input
                      type="text"
                      value={currentFeedback}
                      onChange={(e) =>
                        setEditingFeedback({ ...editingFeedback, [sub.id]: e.target.value })
                      }
                      placeholder="Remark on lighting, vocal dynamics, color grading..."
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => handleSaveScoring(sub.id, sub.status)}
                      className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5"
                    >
                      <Save size={13} />
                      <span>Save Score</span>
                    </button>
                  </div>
                </div>

                {/* Status Transitions */}
                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-amber-200/60 text-xs">
                  <span className="text-slate-500 mr-1 text-[11px]">Verdict:</span>
                  <button
                    onClick={() => updateSubmissionStatus(sub.id, 'verified')}
                    className="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-300 text-emerald-800 hover:bg-emerald-100 text-[11px] font-medium"
                  >
                    Verify & Accept
                  </button>
                  <button
                    onClick={() => updateSubmissionStatus(sub.id, 'under_review')}
                    className="px-2.5 py-1 rounded-md bg-amber-100 border border-amber-300 text-amber-800 hover:bg-amber-200 text-[11px] font-medium"
                  >
                    Under Review
                  </button>
                  <button
                    onClick={() => updateSubmissionStatus(sub.id, 'shortlisted')}
                    className="px-2.5 py-1 rounded-md bg-purple-50 border border-purple-300 text-purple-800 hover:bg-purple-100 text-[11px] font-medium"
                  >
                    Shortlist Finalist
                  </button>
                  <button
                    onClick={() => updateSubmissionStatus(sub.id, 'winner')}
                    className="px-2.5 py-1 rounded-md bg-amber-600 text-white hover:bg-amber-500 font-semibold text-[11px]"
                  >
                    Accolade Winner
                  </button>
                  <button
                    onClick={() => updateSubmissionStatus(sub.id, 'disqualified')}
                    className="px-2.5 py-1 rounded-md bg-red-50 border border-red-300 text-red-800 hover:bg-red-100 text-[11px] font-medium"
                  >
                    Disqualify
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="p-8 text-center rounded-2xl bg-white border border-slate-200 text-slate-500 text-xs">
            No submissions found for the selected filters.
          </div>
        )}
      </div>
    </div>
  );
}
