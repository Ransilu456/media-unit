'use client';

import React, { useState } from 'react';
import type {
  AgeCategory,
  CategoryType,
  Competition,
  CompetitionStatus,
  FormField,
  MediumType,
} from '@/lib/types';
import { AlertCircle, Plus, Trash2, X } from 'lucide-react';
import { CompetitionPreviewPanel } from './CompetitionPreviewPanel';

interface FormEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  competitionToEdit?: Competition | null;
  onSave: (comp: Omit<Competition, 'id'>) => void | Promise<void>;
  startInPreview?: boolean;
}

const controlClassName =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600';
const labelClassName = 'mb-1.5 block text-sm font-medium text-slate-700';
const grades = ['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'Grade 13'];

function makeSlug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function createField(): FormField {
  return {
    id: `field-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    label: '',
    type: 'text',
    required: false,
    placeholder: 'Enter your answer',
    helperText: '',
  };
}

export function CompetitionFormEditorModal({
  isOpen,
  onClose,
  competitionToEdit,
  onSave,
  startInPreview = false,
}: FormEditorModalProps) {
  const isEditing = Boolean(competitionToEdit);
  const [view, setView] = useState<'edit' | 'preview'>(startInPreview ? 'preview' : 'edit');
  const [title, setTitle] = useState(competitionToEdit?.title ?? '');
  const [slug, setSlug] = useState(competitionToEdit?.slug ?? '');
  const [slugEdited, setSlugEdited] = useState(false);
  const [category, setCategory] = useState<CategoryType>(
    competitionToEdit?.category ?? 'Short Film & Cinematography'
  );
  const [medium, setMedium] = useState<MediumType>(competitionToEdit?.medium ?? 'None');
  const [description, setDescription] = useState(competitionToEdit?.description ?? '');
  const [eligibility, setEligibility] = useState(competitionToEdit?.eligibility ?? 'Grades 9 - 13');
  const [deadline, setDeadline] = useState(competitionToEdit?.deadline ?? '2026-11-25');
  const [maxEntries, setMaxEntries] = useState(competitionToEdit?.maxEntriesPerSchool ?? 2);
  const [status, setStatus] = useState<CompetitionStatus>(competitionToEdit?.status ?? 'open');
  const [prizePool, setPrizePool] = useState(
    competitionToEdit?.prizePool ?? 'Challenge Trophy & Certificates'
  );
  const [guidelinesText, setGuidelinesText] = useState(
    competitionToEdit
      ? competitionToEdit.guidelines.join('\n')
      : 'Original creative work only.\nGoogle Drive link with viewer permissions.'
  );
  const [customFields, setCustomFields] = useState<FormField[]>(
    (competitionToEdit?.customFields ?? []).map((field) => ({
      ...field,
      placeholder: field.placeholder || 'Enter your answer',
      options: field.options ? [...field.options] : undefined,
    }))
  );
  const [ageCategory, setAgeCategory] = useState<AgeCategory | null>(
    competitionToEdit?.ageCategory
      ? { ...competitionToEdit.ageCategory, grades: [...competitionToEdit.ageCategory.grades] }
      : null
  );
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const updateField = (id: string, updates: Partial<FormField>) => {
    setCustomFields((current) =>
      current.map((field) => (field.id === id ? { ...field, ...updates } : field))
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (ageCategory && ageCategory.grades.length === 0) {
      setError('Select at least one eligible grade.');
      return;
    }
    if (customFields.some((field) => !field.label.trim() || !field.placeholder?.trim())) {
      setError('Every custom form question needs a label and a placeholder.');
      return;
    }
    if (customFields.some((field) => field.type === 'select' && !field.options?.length)) {
      setError('Add at least one option to each dropdown question.');
      return;
    }

    const guidelines = guidelinesText.split('\n').map((line) => line.trim()).filter(Boolean);
    const competitionData: Omit<Competition, 'id'> = {
      title: title.trim(),
      category,
      medium,
      slug: slug.trim(),
      description: description.trim(),
      eligibility: eligibility.trim(),
      ...(ageCategory ? { ageCategory } : {}),
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
      await onSave(competitionData);
      onClose();
    } catch (saveError: unknown) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save the competition.');
    } finally {
      setIsSaving(false);
    }
  };

  const previewCompetition: Omit<Competition, 'id'> = {
    title,
    category,
    medium,
    slug,
    description,
    eligibility,
    ...(ageCategory ? { ageCategory } : {}),
    deadline,
    maxEntriesPerSchool: Number(maxEntries),
    status,
    prizePool,
    guidelines: guidelinesText.split('\n').map((line) => line.trim()).filter(Boolean),
    customFields,
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
      <div className="relative my-4 w-full max-w-4xl rounded-xl border border-slate-200 bg-white p-5 shadow-xl sm:p-6">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close competition editor"
          className="absolute right-4 top-4 rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
        >
          <X size={18} />
        </button>

        <h2 className="pr-10 text-xl font-semibold text-slate-900">
          {isEditing ? 'Edit Competition' : 'Create Competition'}
        </h2>
        <p className="mb-4 mt-1 text-sm text-slate-600">
          Manage the competition details and the questions students see when submitting an entry.
        </p>

        <div className="mb-5 flex gap-2 border-b border-slate-200">
          <button
            type="button"
            aria-pressed={view === 'edit'}
            onClick={() => setView('edit')}
            className={`border-b-2 px-3 py-2 text-sm font-medium ${
              view === 'edit' ? 'border-amber-600 text-amber-800' : 'border-transparent text-slate-500'
            }`}
          >
            Edit details
          </button>
          <button
            type="button"
            aria-pressed={view === 'preview'}
            onClick={() => setView('preview')}
            className={`border-b-2 px-3 py-2 text-sm font-medium ${
              view === 'preview' ? 'border-amber-600 text-amber-800' : 'border-transparent text-slate-500'
            }`}
          >
            Preview
          </button>
        </div>

        {error && (
          <div role="alert" className="mb-4 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        {view === 'preview' ? (
          <div className="max-h-[70vh] overflow-y-auto pr-1">
            <CompetitionPreviewPanel competition={previewCompetition} />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-h-[70vh] space-y-5 overflow-y-auto pr-2">
            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900">Competition details</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="competition-title" className={labelClassName}>Competition title *</label>
                  <input
                    id="competition-title"
                    type="text"
                    required
                    maxLength={160}
                    value={title}
                    onChange={(event) => {
                      setTitle(event.target.value);
                      if (!slugEdited) setSlug(makeSlug(event.target.value));
                    }}
                    placeholder="e.g. CineCraft: Mobile Short Film Challenge"
                    className={controlClassName}
                  />
                </div>
                <div>
                  <label htmlFor="competition-slug" className={labelClassName}>Competition URL slug *</label>
                  <input
                    id="competition-slug"
                    type="text"
                    required
                    maxLength={180}
                    pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                    value={slug}
                    onChange={(event) => {
                      setSlug(makeSlug(event.target.value));
                      setSlugEdited(true);
                    }}
                    placeholder="e.g. mobile-short-film-challenge"
                    className={controlClassName}
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label htmlFor="competition-category" className={labelClassName}>Category track *</label>
                  <select id="competition-category" value={category} onChange={(event) => setCategory(event.target.value as CategoryType)} className={controlClassName}>
                    {categories.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="competition-medium" className={labelClassName}>Medium *</label>
                  <select id="competition-medium" value={medium} onChange={(event) => setMedium(event.target.value as MediumType)} className={controlClassName}>
                    <option value="None">All / None</option>
                    <option value="Sinhala">Sinhala</option>
                    <option value="English">English</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="competition-status" className={labelClassName}>Status *</label>
                  <select id="competition-status" value={status} onChange={(event) => setStatus(event.target.value as CompetitionStatus)} className={controlClassName}>
                    <option value="open">Submissions open</option>
                    <option value="judging">Under adjudication</option>
                    <option value="closed">Closed</option>
                    <option value="upcoming">Upcoming</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="competition-description" className={labelClassName}>Description *</label>
                <textarea
                  id="competition-description"
                  rows={3}
                  required
                  maxLength={2000}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Describe the competition and what students are expected to create."
                  className={`${controlClassName} resize-y`}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label htmlFor="competition-eligibility" className={labelClassName}>Eligibility *</label>
                  <input id="competition-eligibility" type="text" required maxLength={200} value={eligibility} onChange={(event) => setEligibility(event.target.value)} placeholder="e.g. Grades 9–13" className={controlClassName} />
                </div>
                <div>
                  <label htmlFor="competition-deadline" className={labelClassName}>Deadline date *</label>
                  <input id="competition-deadline" type="date" required value={deadline} onChange={(event) => setDeadline(event.target.value)} className={controlClassName} />
                </div>
                <div>
                  <label htmlFor="competition-max-entries" className={labelClassName}>Max entries / school *</label>
                  <input id="competition-max-entries" type="number" min={1} max={10} required value={maxEntries} onChange={(event) => setMaxEntries(Number(event.target.value))} placeholder="e.g. 2" className={controlClassName} />
                </div>
                <div>
                  <label htmlFor="competition-prizes" className={labelClassName}>Awards / prize pool *</label>
                  <input id="competition-prizes" type="text" required maxLength={200} value={prizePool} onChange={(event) => setPrizePool(event.target.value)} placeholder="e.g. Trophy and certificates" className={controlClassName} />
                </div>
              </div>
            </section>

            <section className="space-y-3 rounded-xl border border-slate-200 p-4">
              <label className="flex items-start gap-2 text-sm font-semibold text-slate-900">
                <input
                  type="checkbox"
                  checked={Boolean(ageCategory)}
                  onChange={(event) => setAgeCategory(event.target.checked
                    ? { label: 'Eligible students', minAge: 5, maxAge: 25, grades: [...grades] }
                    : null)}
                  className="mt-0.5 accent-amber-600"
                />
                Set age and grade eligibility
              </label>
              {ageCategory && (
                <>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <label htmlFor="age-label" className={labelClassName}>Eligibility label *</label>
                      <input id="age-label" required maxLength={100} value={ageCategory.label} onChange={(event) => setAgeCategory({ ...ageCategory, label: event.target.value })} placeholder="e.g. Junior category" className={controlClassName} />
                    </div>
                    <div>
                      <label htmlFor="minimum-age" className={labelClassName}>Minimum age *</label>
                      <input id="minimum-age" type="number" min={5} max={25} required value={ageCategory.minAge} onChange={(event) => setAgeCategory({ ...ageCategory, minAge: Number(event.target.value) })} placeholder="e.g. 12" className={controlClassName} />
                    </div>
                    <div>
                      <label htmlFor="maximum-age" className={labelClassName}>Maximum age *</label>
                      <input id="maximum-age" type="number" min={5} max={25} required value={ageCategory.maxAge} onChange={(event) => setAgeCategory({ ...ageCategory, maxAge: Number(event.target.value) })} placeholder="e.g. 18" className={controlClassName} />
                    </div>
                  </div>
                  <fieldset>
                    <legend className={labelClassName}>Eligible grades *</legend>
                    <div className="flex flex-wrap gap-2">
                      {grades.map((grade) => (
                        <label key={grade} className="flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs text-slate-700">
                          <input
                            type="checkbox"
                            checked={ageCategory.grades.includes(grade)}
                            onChange={(event) => setAgeCategory({
                              ...ageCategory,
                              grades: event.target.checked
                                ? [...ageCategory.grades, grade]
                                : ageCategory.grades.filter((item) => item !== grade),
                            })}
                            className="accent-amber-600"
                          />
                          {grade}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </>
              )}
            </section>

            <section className="space-y-2">
              <label htmlFor="competition-guidelines" className={labelClassName}>Guidelines & rules (one per line)</label>
              <textarea
                id="competition-guidelines"
                rows={4}
                value={guidelinesText}
                onChange={(event) => setGuidelinesText(event.target.value)}
                placeholder={'Original creative work only.\nInclude a shareable link to the final work.'}
                className={`${controlClassName} resize-y`}
              />
            </section>

            <section className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Student entry questions</h3>
                  <p className="mt-1 text-xs text-slate-500">Add up to 20 questions. Each question can have its own placeholder.</p>
                </div>
                <button
                  type="button"
                  disabled={customFields.length >= 20}
                  onClick={() => setCustomFields((current) => [...current, createField()])}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus size={14} /> Add question
                </button>
              </div>

              {customFields.length === 0 ? (
                <p className="rounded-lg border border-dashed border-slate-300 p-4 text-xs text-slate-500">
                  No extra questions. Students will see the standard entry form.
                </p>
              ) : (
                <div className="space-y-3">
                  {customFields.map((field, index) => (
                    <fieldset key={field.id} className="space-y-3 rounded-xl border border-slate-200 p-4">
                      <div className="flex items-center justify-between">
                        <legend className="text-xs font-semibold text-slate-700">Question {index + 1}</legend>
                        <button
                          type="button"
                          onClick={() => setCustomFields((current) => current.filter((item) => item.id !== field.id))}
                          aria-label={`Remove question ${index + 1}`}
                          className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label htmlFor={`field-label-${field.id}`} className={labelClassName}>Question label *</label>
                          <input id={`field-label-${field.id}`} required maxLength={120} value={field.label} onChange={(event) => updateField(field.id, { label: event.target.value })} placeholder="e.g. What inspired this project?" className={controlClassName} />
                        </div>
                        <div>
                          <label htmlFor={`field-type-${field.id}`} className={labelClassName}>Answer type *</label>
                          <select id={`field-type-${field.id}`} value={field.type} onChange={(event) => updateField(field.id, { type: event.target.value as FormField['type'] })} className={controlClassName}>
                            <option value="text">Short answer</option>
                            <option value="textarea">Long answer</option>
                            <option value="url">Link</option>
                            <option value="number">Number</option>
                            <option value="select">Dropdown</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label htmlFor={`field-placeholder-${field.id}`} className={labelClassName}>Placeholder *</label>
                          <input id={`field-placeholder-${field.id}`} required maxLength={200} value={field.placeholder ?? ''} onChange={(event) => updateField(field.id, { placeholder: event.target.value })} placeholder="e.g. Describe your idea in a few words" className={controlClassName} />
                        </div>
                        <div>
                          <label htmlFor={`field-help-${field.id}`} className={labelClassName}>Helper text (optional)</label>
                          <input id={`field-help-${field.id}`} maxLength={500} value={field.helperText ?? ''} onChange={(event) => updateField(field.id, { helperText: event.target.value })} placeholder="Add instructions shown below the question" className={controlClassName} />
                        </div>
                      </div>
                      {field.type === 'select' && (
                        <div>
                          <label htmlFor={`field-options-${field.id}`} className={labelClassName}>Dropdown options (one per line) *</label>
                          <textarea
                            id={`field-options-${field.id}`}
                            required
                            rows={3}
                            value={(field.options ?? []).join('\n')}
                            onChange={(event) => updateField(field.id, {
                              options: event.target.value.split('\n').map((item) => item.trim()).filter(Boolean),
                            })}
                            placeholder={'Option one\nOption two'}
                            className={`${controlClassName} resize-y`}
                          />
                        </div>
                      )}
                      <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                        <input type="checkbox" checked={field.required} onChange={(event) => updateField(field.id, { required: event.target.checked })} className="accent-amber-600" />
                        Required question
                      </label>
                    </fieldset>
                  ))}
                </div>
              )}
            </section>

            <div className="border-t border-slate-200 pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full rounded-lg bg-amber-600 py-3 text-sm font-semibold text-white hover:bg-amber-700 disabled:cursor-wait disabled:opacity-60"
              >
                {isSaving ? 'Saving...' : isEditing ? 'Save competition changes' : 'Publish competition'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
