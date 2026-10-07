'use client';

import React, { useState } from 'react';
import { Competition, CategoryType, CompetitionStatus, FormField, MediumType } from '@/lib/types';
import { X, Trash2, AlertCircle } from 'lucide-react';

interface FormEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  competitionToEdit?: Competition | null;
  onSave: (comp: Omit<Competition, 'id'>) => void | Promise<void>;
}

const controlClassName = 'w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600';
const labelClassName = 'mb-1.5 block text-sm font-medium text-slate-700';

export function CompetitionFormEditorModal({
  isOpen,
  onClose,
  competitionToEdit,
  onSave,
}: FormEditorModalProps) {
  const isEditing = Boolean(competitionToEdit);

  const [title, setTitle] = useState(competitionToEdit?.title || '');
  const [category, setCategory] = useState<CategoryType>(
    competitionToEdit?.category || 'Short Film & Cinematography'
  );
  const [medium, setMedium] = useState<MediumType>(competitionToEdit?.medium || 'None');
  const [description, setDescription] = useState(competitionToEdit?.description || '');
  const [eligibility, setEligibility] = useState(competitionToEdit?.eligibility || 'Grades 9 - 13');
  const [deadline, setDeadline] = useState(competitionToEdit?.deadline || '2026-11-25');
  const [maxEntries, setMaxEntries] = useState(competitionToEdit?.maxEntriesPerSchool || 2);
  const [status, setStatus] = useState<CompetitionStatus>(competitionToEdit?.status || 'open');
  const [prizePool, setPrizePool] = useState(competitionToEdit?.prizePool || 'Challenge Trophy & Certificates');
  const [guidelinesText, setGuidelinesText] = useState(
    competitionToEdit ? competitionToEdit.guidelines.join('\n') : 'Original creative work only.\nGoogle Drive link with viewer permissions.'
  );
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a competition title.');
      return;
    }

    const guidelines = guidelinesText
      .split('\n')
      .map((g) => g.trim())
      .filter(Boolean);

    const compData: Omit<Competition, 'id'> = {
      title: title.trim(),
      category,
      medium,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: description.trim(),
      eligibility: eligibility.trim(),
      ...(competitionToEdit?.ageCategory ? { ageCategory: competitionToEdit.ageCategory } : {}),
      deadline,
      maxEntriesPerSchool: Number(maxEntries),
      status,
      prizePool: prizePool.trim(),
      guidelines,
    };

    setIsSaving(true);
    setError(null);
    try {
      await onSave(compData);
      onClose();
    } catch (saveError: unknown) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save the competition.');
    } finally {
      setIsSaving(false);
    }
  };

  const categories: CategoryType[] = [
    'Short Film & Cinematography',
    'Photography',
    'News Reading & Announcing',
    'Graphic Design & Digital Art',
    'Radio Play & Audio Production',
    'Live Media Reporting',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/50 p-3 sm:p-6">
      <div className="relative my-4 w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xl">
        <button
          onClick={onClose}
          aria-label="Close competition editor"
          className="absolute right-4 top-4 rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
        >
          <X size={18} />
        </button>

        <h2 className="pr-10 text-xl font-semibold text-slate-900">
          {isEditing ? 'Edit Competition Form' : 'Create New Competition Track'}
        </h2>
        <p className="mb-5 mt-1 text-sm text-slate-600">
          Add the competition details and any questions for students.
        </p>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="max-h-[70vh] space-y-4 overflow-y-auto pr-2">
          <div>
            <label className={labelClassName}>Competition Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. CineCraft: Mobile Short Film Challenge"
              className={controlClassName}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className={labelClassName}>Category Track *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryType)}
                className={controlClassName}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClassName}>Medium *</label>
              <select
                value={medium}
                onChange={(e) => setMedium(e.target.value as MediumType)}
                className={controlClassName}
              >
                <option value="None">All / None</option>
                <option value="Sinhala">Sinhala</option>
                <option value="English">English</option>
              </select>
            </div>

            <div>
              <label className={labelClassName}>Status *</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CompetitionStatus)}
                className={controlClassName}
              >
                <option value="open">Submissions Open</option>
                <option value="judging">Under Adjudication</option>
                <option value="closed">Closed</option>
                <option value="upcoming">Upcoming</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelClassName}>Description *</label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short overview of the contest..."
              className={`${controlClassName} resize-y`}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className={labelClassName}>Eligibility *</label>
              <input
                type="text"
                required
                value={eligibility}
                onChange={(e) => setEligibility(e.target.value)}
                placeholder="e.g. Grades 9 - 13"
                className={controlClassName}
              />
            </div>

            <div>
              <label className={labelClassName}>Deadline Date *</label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className={controlClassName}
              />
            </div>

            <div>
              <label className={labelClassName}>Max Entries / School</label>
              <input
                type="number"
                min={1}
                max={10}
                value={maxEntries}
                onChange={(e) => setMaxEntries(Number(e.target.value))}
                className={controlClassName}
              />
            </div>
          </div>

          <div>
            <label className={labelClassName}>Awards / Prize Pool</label>
            <input
              type="text"
              value={prizePool}
              onChange={(e) => setPrizePool(e.target.value)}
              placeholder="e.g. LKR 100,000 + Gold Medal"
              className={controlClassName}
            />
          </div>

          <div>
            <label className={labelClassName}>Guidelines & Rules (one rule per line)</label>
            <textarea
              rows={3}
              value={guidelinesText}
              onChange={(e) => setGuidelinesText(e.target.value)}
              className={`${controlClassName} font-mono text-sm`}
            />
          </div>

          <div className="border-t border-slate-200 pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full rounded-lg bg-amber-600 py-3 text-sm font-semibold text-white hover:bg-amber-700 disabled:cursor-wait disabled:opacity-60"
            >
              {isSaving ? 'Saving...' : isEditing ? 'Save Form Changes' : 'Publish Competition Track'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
