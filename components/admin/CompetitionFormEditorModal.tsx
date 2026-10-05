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

  const [customFields, setCustomFields] = useState<FormField[]>(
    competitionToEdit?.customFields || []
  );

  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState<FormField['type']>('text');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleAddField = () => {
    if (!newFieldLabel.trim()) return;
    const newField: FormField = {
      id: `field_${Date.now().toString(36)}`,
      label: newFieldLabel.trim(),
      type: newFieldType,
      required: true,
      placeholder: `Enter ${newFieldLabel.trim()}...`,
    };
    setCustomFields([...customFields, newField]);
    setNewFieldLabel('');
  };

  const handleRemoveField = (id: string) => {
    setCustomFields(customFields.filter((f) => f.id !== id));
  };

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
      customFields,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 my-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800"
        >
          <X size={18} />
        </button>

        <h2 className="text-2xl font-serif font-bold text-slate-900 mb-1">
          {isEditing ? 'Edit Competition Form' : 'Create New Competition Track'}
        </h2>
        <p className="text-xs text-slate-500 mb-6 font-light">
          Configure competition parameters, submission deadlines, and dynamic form questions.
        </p>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Competition Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. CineCraft: Mobile Short Film Challenge"
              className="w-full px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Category Track *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryType)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Medium *
              </label>
              <select
                value={medium}
                onChange={(e) => setMedium(e.target.value as MediumType)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
              >
                <option value="None">All / None</option>
                <option value="Sinhala">Sinhala</option>
                <option value="English">English</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Status *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CompetitionStatus)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
              >
                <option value="open">Submissions Open</option>
                <option value="judging">Under Adjudication</option>
                <option value="closed">Closed</option>
                <option value="upcoming">Upcoming</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Description *
            </label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short overview of the contest..."
              className="w-full px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Eligibility *
              </label>
              <input
                type="text"
                required
                value={eligibility}
                onChange={(e) => setEligibility(e.target.value)}
                placeholder="e.g. Grades 9 - 13"
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Deadline Date *
              </label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Max Entries / School
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={maxEntries}
                onChange={(e) => setMaxEntries(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Awards / Prize Pool
            </label>
            <input
              type="text"
              value={prizePool}
              onChange={(e) => setPrizePool(e.target.value)}
              placeholder="e.g. LKR 100,000 + Gold Medal"
              className="w-full px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Guidelines & Rules (One rule per line)
            </label>
            <textarea
              rows={3}
              value={guidelinesText}
              onChange={(e) => setGuidelinesText(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white font-mono text-xs"
            />
          </div>

          {/* Dynamic Form Custom Questions Builder */}
          <div className="pt-3 border-t border-slate-100">
            <h4 className="text-xs font-mono uppercase tracking-wider text-amber-700 font-semibold mb-2">
              Form Question Fields Builder ({customFields.length})
            </h4>

            <div className="space-y-2 mb-3">
              {customFields.map((field) => (
                <div
                  key={field.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                >
                  <div>
                    <span className="font-medium text-slate-900">{field.label}</span>
                    <span className="text-[10px] text-slate-500 ml-2">
                      ({field.type}, {field.required ? 'Required' : 'Optional'})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveField(field.id)}
                    className="text-slate-400 hover:text-red-600 p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row gap-2 items-center">
              <input
                type="text"
                value={newFieldLabel}
                onChange={(e) => setNewFieldLabel(e.target.value)}
                placeholder="Question label (e.g. Camera Sensor / Audio Format)"
                className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-900"
              />
              <select
                value={newFieldType}
                onChange={(e) => setNewFieldType(e.target.value as FormField['type'])}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-900"
              >
                <option value="text">Text</option>
                <option value="textarea">Long Text</option>
                <option value="url">URL Link</option>
                <option value="number">Number</option>
              </select>
              <button
                type="button"
                onClick={handleAddField}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold whitespace-nowrap"
              >
                + Add Field
              </button>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs sm:text-sm shadow-sm"
            >
              {isSaving ? 'Saving...' : isEditing ? 'Save Form Changes' : 'Publish Competition Track'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
