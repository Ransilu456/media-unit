'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useMediaStore } from '@/lib/store';
import type { Competition, NewSubmissionInput, RegisteredSchool } from '@/lib/types';
import { calculateAge, gradeFromAge, validateSubmissionInput } from '@/lib/validation';
import { getCompetitionMedium } from '@/lib/competitionUtils';
import {
  X,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Info,
  Trophy,
  Link as LinkIcon,
  FileText,
  User,
  ShieldCheck,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  competition: Competition;
  school: RegisteredSchool;
  onSubmitted?: () => void | Promise<void>;
}

const CONFIRMATION_WARNING = 'Please confirm that the details are correct before you send this entry.';

const inputCls =
  'min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-xs transition focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20';
const labelCls = 'mb-1.5 block text-[11px] font-semibold tracking-wide text-slate-700';

export function EntrySubmissionModal({
  isOpen,
  onClose,
  competition: initialCompetition,
  school,
  onSubmitted,
}: Props) {
  const { competitions, submissions, submitEntry } = useMediaStore();
  const formRef = useRef<HTMLFormElement>(null);

  const [selectedCompId, setSelectedCompId] = useState(initialCompetition.id);
  const [currentStep, setCurrentStep] = useState(0);

  const activeCompetition = useMemo(() => {
    return competitions.find((c) => c.id === selectedCompId) || initialCompetition;
  }, [competitions, selectedCompId, initialCompetition]);

  const competitionMedium = getCompetitionMedium(activeCompetition);

  const [form, setForm] = useState({
    studentName: '',
    studentBirthday: '',
    studentContact: '',
    entryTitle: '',
    submissionLink: '',
    synopsis: '',
  });
  const [customValues, setCustomValues] = useState<Record<string, string>>(() =>
    Object.fromEntries((initialCompetition.customFields ?? []).map((field) => [field.id, '']))
  );
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [certified, setCertified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setSelectedCompId(initialCompetition.id);
    setCurrentStep(0);
  }, [initialCompetition.id]);

  useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !submitting) onClose();
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [isOpen, onClose, submitting]);

  useEffect(() => {
    if (formRef.current) formRef.current.scrollTop = 0;
  }, [currentStep]);

  useEffect(() => {
    setCustomValues((current) =>
      Object.fromEntries(
        (activeCompetition.customFields ?? []).map((field) => [field.id, current[field.id] ?? ''])
      )
    );
  }, [selectedCompId, activeCompetition.customFields]);

  const calculatedAge = useMemo(() => {
    return calculateAge(form.studentBirthday);
  }, [form.studentBirthday]);
  const calculatedGrade = calculatedAge === null ? null : gradeFromAge(calculatedAge);

  // Strict Competition Age Eligibility Check
  const ageEligibilityError = useMemo(() => {
    if (calculatedAge === null || !activeCompetition.ageCategory) return null;
    const { minAge, maxAge } = activeCompetition.ageCategory;
    if (calculatedAge < minAge || calculatedAge > maxAge) {
      return `This competition is for students aged ${minAge} to ${maxAge}. The student is ${calculatedAge}.`;
    }
    return null;
  }, [calculatedAge, activeCompetition]);

  const synopsisWords = useMemo(() => {
    return form.synopsis.trim() ? form.synopsis.trim().split(/\s+/).length : 0;
  }, [form.synopsis]);

  const set = <K extends keyof typeof form>(k: K, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setTouched((current) => ({ ...current, [k]: true }));
  };

  const setCustomValue = (id: string, value: string) => {
    setCustomValues((current) => ({ ...current, [id]: value }));
    setTouched((current) => ({ ...current, [`customValues.${id}`]: true }));
  };

  const submissionInput: NewSubmissionInput = {
    competitionId: activeCompetition.id,
    competitionTitle: activeCompetition.title,
    competitionMedium,
    schoolId: school.id,
    schoolName: school.name,
    category: activeCompetition.category,
    studentName: form.studentName.trim(),
    studentGrade: calculatedGrade ?? '',
    studentBirthday: form.studentBirthday,
    studentContact: form.studentContact.trim(),
    entryTitle: form.entryTitle.trim(),
    submissionLink: form.submissionLink.trim(),
    synopsis: form.synopsis.trim(),
    customValues,
  };

  const fieldError = (field: string): string | undefined => {
    if (!touched[field]) return undefined;
    return validateSubmissionInput(submissionInput, competitions)[field];
  };
  const markStepTouched = () => {
    const fields = currentStep === 0
      ? ['competitionId', 'studentName', 'studentBirthday', 'studentGrade', 'studentContact']
      : currentStep === 1
        ? ['entryTitle', 'submissionLink', 'synopsis', ...(activeCompetition.customFields ?? []).map((item) => `customValues.${item.id}`)]
        : [];
    setTouched((current) => ({
      ...current,
      ...Object.fromEntries(fields.map((field) => [field, true])),
    }));
  };

  const continueForm = () => {
    setError(null);
    markStepTouched();
    if (!formRef.current?.reportValidity()) return;

    if (currentStep === 0) {
      if (activeCompetition.status !== 'open') {
        setError('This competition is closed. Choose an open competition to continue.');
        return;
      }
      if (school.status !== 'active') {
        setError('Your school account is waiting for approval. You can send entries after it is approved.');
        return;
      }
      const activeSchoolSubmissions = submissions.filter(
        (entry) => entry.competitionId === activeCompetition.id
          && entry.schoolId === school.id
          && entry.status !== 'disqualified'
      );
      if (activeSchoolSubmissions.length >= activeCompetition.maxEntriesPerSchool) {
        setError(`Your school has used all ${activeCompetition.maxEntriesPerSchool} entries for this competition.`);
        return;
      }
      if (ageEligibilityError) {
        setError(ageEligibilityError);
        return;
      }
    }

    if (currentStep === 1 && (synopsisWords < 20 || synopsisWords > 1000)) {
      setError('Please describe the work in 20 to 1,000 words.');
      return;
    }

    setCurrentStep((step) => Math.min(2, step + 1));
  };

  const validate = (): string | null => {
    if (activeCompetition.status !== 'open') {
      return 'This competition is closed.';
    }
    if (school.status !== 'active') {
      return 'Your school account is not active yet. Please contact the Agradhi team.';
    }

    const activeSchoolSubmissions = submissions.filter(
      (e) =>
        e.competitionId === activeCompetition.id &&
        e.schoolId === school.id &&
        e.status !== 'disqualified'
    );
    if (activeSchoolSubmissions.length >= activeCompetition.maxEntriesPerSchool) {
      return `Your school has reached the limit of ${activeCompetition.maxEntriesPerSchool} entries for this competition.`;
    }

    if (ageEligibilityError) {
      return ageEligibilityError;
    }

    const dataErrors = validateSubmissionInput(submissionInput, competitions);
    if (Object.keys(dataErrors).length > 0) {
      return Object.values(dataErrors)[0];
    }

    if (!certified) return CONFIRMATION_WARNING;

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    let entrySaved = false;
    try {
      await submitEntry(submissionInput);
      entrySaved = true;
      setSuccess(true);
      try {
        await onSubmitted?.();
      } catch (refreshErr) {
        console.error('[entry submission] Entry saved, refresh note:', refreshErr);
      }
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err: unknown) {
      if (!entrySaved) {
        setError(err instanceof Error ? err.message : 'Submission failed. Please check your data and retry.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/60 p-0 backdrop-blur-sm sm:p-5">
      <div role="dialog" aria-modal="true" aria-labelledby="entry-dialog-title" className="relative my-0 flex min-h-dvh w-full max-w-3xl flex-col overflow-hidden bg-white shadow-2xl sm:my-4 sm:min-h-0 sm:max-h-[calc(100dvh-2rem)] sm:rounded-[28px] sm:border sm:border-white/70">
        <div className="sticky top-0 z-20 border-b border-slate-100 bg-white/95 px-4 py-4 backdrop-blur sm:px-7">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-900">
                <Trophy size={18} />
              </div>
              <div className="min-w-0">
                <h2 id="entry-dialog-title" className="truncate text-base font-bold leading-tight text-slate-950 sm:text-lg">Submit a student entry</h2>
                <p className="mt-1 truncate text-[11px] text-slate-500">{school.name}</p>
              </div>
            </div>
            <button type="button" onClick={onClose} aria-label="Close dialog" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">
              <X size={19} />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2" aria-label="Entry form progress">
            {['Student', 'Work', 'Review'].map((label, index) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  if (index < currentStep) {
                    setError(null);
                    setCurrentStep(index);
                  }
                }}
                aria-current={currentStep === index ? 'step' : undefined}
                className="group min-w-0 text-left"
              >
                <span className={`mb-2 block h-1 rounded-full transition-colors ${index <= currentStep ? 'bg-amber-500' : 'bg-slate-100'}`} />
                <span className={`flex items-center gap-1.5 text-[10px] font-bold sm:text-xs ${index === currentStep ? 'text-slate-900' : index < currentStep ? 'text-amber-800' : 'text-slate-400'}`}>
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] ${index < currentStep ? 'bg-emerald-100 text-emerald-800' : index === currentStep ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {index < currentStep ? <CheckCircle2 size={12} /> : index + 1}
                  </span>
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Status Alerts */}
        <div className="px-4 pt-4 sm:px-7">
          {error && (
            <div
              role={error === CONFIRMATION_WARNING ? 'status' : 'alert'}
              className={`mb-4 flex items-start gap-2.5 rounded-xl border p-3.5 text-xs animate-in fade-in-50 ${
                error === CONFIRMATION_WARNING
                  ? 'border-amber-200 bg-amber-50 text-amber-900'
                  : 'border-red-200 bg-red-50 text-red-800'
              }`}
            >
              {error === CONFIRMATION_WARNING
                ? <Info size={16} className="mt-0.5 shrink-0 text-amber-700" />
                : <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-600" />}
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div role="status" className="mb-4 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800 animate-in fade-in-50">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
              <span className="font-semibold">Entry sent. The review team will check it.</span>
            </div>
          )}
        </div>

        {/* Submission Form */}
        <form ref={formRef} noValidate onSubmit={handleSubmit} className="flex-1 space-y-5 overflow-y-auto px-4 pb-5 sm:px-7 sm:pb-7">
          
          {currentStep === 0 && (
          <>
          {/* Competition and language */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Trophy size={14} className="text-amber-600" />
                <span>1. Choose a competition</span>
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Up to {activeCompetition.maxEntriesPerSchool} entries from your school
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className={labelCls}>Competition *</label>
                <select
                  required
                  value={selectedCompId}
                  onChange={(e) => {
                    setSelectedCompId(e.target.value);
                    setTouched((current) => ({ ...current, competitionId: true }));
                    setError(null);
                  }}
                  aria-invalid={Boolean(fieldError('competitionId'))}
                  className={inputCls}
                >
                  <option value="" disabled>Choose a competition</option>
                  {competitions.map((c) => {
                    const entriesUsed = submissions.filter((entry) =>
                      entry.competitionId === c.id
                      && entry.schoolId === school.id
                      && entry.status !== 'disqualified'
                    ).length;
                    const full = entriesUsed >= c.maxEntriesPerSchool;
                    return (
                      <option key={c.id} value={c.id} disabled={c.status !== 'open' || full}>
                        {c.title} · {c.status !== 'open' ? 'Closed' : full ? 'Entry limit reached' : c.category}
                      </option>
                    );
                  })}
                </select>
                {fieldError('competitionId') && <p className="mt-1 text-xs text-red-700">{fieldError('competitionId')}</p>}
              </div>

              <div>
                <label className={labelCls}>Language</label>
                <div className="flex items-center h-10.5 px-3.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs text-slate-800">
                  {competitionMedium === 'Sinhala' && (
                    <span className="inline-flex items-center gap-1 text-orange-700">
                      <span className="w-2 h-2 rounded-full bg-orange-600" /> Sinhala
                    </span>
                  )}
                  {competitionMedium === 'English' && (
                    <span className="inline-flex items-center gap-1 text-orange-700">
                      <span className="w-2 h-2 rounded-full bg-orange-600" /> English
                    </span>
                  )}
                  {competitionMedium === 'Sinhala & English' && (
                    <span className="inline-flex items-center gap-1 text-orange-700">
                      <span className="w-2 h-2 rounded-full bg-orange-600" /> Sinhala & English
                    </span>
                  )}
                  {(competitionMedium === 'None' || !competitionMedium) && (
                    <span className="inline-flex items-center gap-1 text-emerald-700">
                      <span className="w-2 h-2 rounded-full bg-emerald-600" /> Any language
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Track Metadata Pill */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 pt-1">
              <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200">
                Category: <strong>{activeCompetition.category}</strong>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200">
                Who can enter: <strong>{activeCompetition.eligibility}</strong>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200">
                Deadline: <strong>{activeCompetition.deadline}</strong>
              </span>
            </div>
          </div>

          {/* Student details */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-4">
            <div className="border-b border-slate-200/80 pb-2.5">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <User size={14} className="text-amber-600" />
                <span>2. About the student</span>
              </span>
            </div>

            {/* Student Full Name */}
            <div>
              <label className={labelCls}>Student name *</label>
              <input
                type="text"
                required
                minLength={2}
                maxLength={100}
                value={form.studentName}
                onChange={(e) => set('studentName', e.target.value)}
                aria-invalid={Boolean(fieldError('studentName'))}
                placeholder="Enter the student’s full name"
                className={inputCls}
              />
              {fieldError('studentName') && <p className="mt-1 text-xs text-red-700">{fieldError('studentName')}</p>}
            </div>

            {/* Birthday and Grade row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className={labelCls}>Date of birth *</label>
                <input
                  type="date"
                  required
                  value={form.studentBirthday}
                  onChange={(e) => set('studentBirthday', e.target.value)}
                  aria-invalid={Boolean(fieldError('studentBirthday'))}
                  max={new Date().toISOString().split('T')[0]}
                  className={inputCls}
                />
                {fieldError('studentBirthday') && <p className="mt-1 text-xs text-red-700">{fieldError('studentBirthday')}</p>}
              </div>

              <div>
                <label htmlFor="student-age" className={labelCls}>Age (automatic)</label>
                <input
                  id="student-age"
                  type="text"
                  readOnly
                  aria-live="polite"
                  value={calculatedAge === null ? '' : `${calculatedAge} years`}
                  placeholder="Calculated from date of birth"
                  className={`${inputCls} bg-slate-100 text-slate-700`}
                />
              </div>

              <div>
                <label htmlFor="student-grade" className={labelCls}>Grade (automatic) *</label>
                <input
                  id="student-grade"
                  type="text"
                  required
                  readOnly
                  value={calculatedGrade ?? ''}
                  placeholder="Calculated from date of birth"
                  aria-invalid={Boolean(fieldError('studentGrade'))}
                  className={`${inputCls} bg-slate-100 text-slate-700`}
                />
                {fieldError('studentGrade') && <p className="mt-1 text-xs text-red-700">{fieldError('studentGrade')}</p>}
              </div>
            </div>

            {/* Real-Time Age Feedback Card */}
            {form.studentBirthday && (
              <div
                className={`rounded-xl border p-3.5 transition-all ${
                  ageEligibilityError
                    ? 'border-red-300 bg-red-50 text-red-900'
                    : 'border-emerald-300 bg-emerald-50 text-emerald-900'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs">
                  {ageEligibilityError ? (
                    <AlertCircle size={15} className="text-red-600 shrink-0" />
                  ) : (
                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                  )}

                  <span>
                    Student age: <strong>{calculatedAge} years old</strong>
                  </span>
                  
                  <span
                    className={`ml-auto px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      ageEligibilityError
                        ? 'bg-red-200 text-red-800'
                        : 'bg-emerald-200 text-emerald-800'
                    }`}
                  >
                    {ageEligibilityError ? 'Age not accepted' : 'Age accepted'}
                  </span>
                </div>

                <p className="mt-1 text-xs leading-relaxed text-slate-700">
                  {ageEligibilityError ||
                    `This competition accepts students in the ${activeCompetition.ageCategory?.label ?? 'selected age group'}.`}
                </p>
              </div>
            )}

            {/* Student Contact Phone */}
            <div>
              <label className={labelCls}>Student or parent phone number *</label>
              <input
                type="tel"
                required
                inputMode="numeric"
                maxLength={20}
                pattern="[0-9]{10}"
                value={form.studentContact}
                onChange={(e) => set('studentContact', e.target.value)}
                aria-invalid={Boolean(fieldError('studentContact'))}
                placeholder="0771234567"
                className={inputCls}
              />
              {fieldError('studentContact') && <p className="mt-1 text-xs text-red-700">{fieldError('studentContact')}</p>}
            </div>
          </div>
          </>
          )}

          {/* Entry details */}
          {currentStep === 1 && (
          <>
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-4">
            <div className="border-b border-slate-200/80 pb-2.5">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <FileText size={14} className="text-amber-600" />
                <span>3. About the student’s work</span>
              </span>
            </div>

            {/* Entry Title */}
            <div>
              <label className={labelCls}>Name of the work *</label>
              <input
                type="text"
                required
                minLength={2}
                maxLength={160}
                value={form.entryTitle}
                onChange={(e) => set('entryTitle', e.target.value)}
                aria-invalid={Boolean(fieldError('entryTitle'))}
                placeholder="Give the work a short name"
                className={inputCls}
              />
              {fieldError('entryTitle') && <p className="mt-1 text-xs text-red-700">{fieldError('entryTitle')}</p>}
            </div>

            {/* Link to work */}
            <div>
              <label className={labelCls}>Link to the work (Google Drive, YouTube, or OneDrive) *</label>
              <div className="relative">
                <LinkIcon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="url"
                  required
                  maxLength={2048}
                  value={form.submissionLink}
                  onChange={(e) => set('submissionLink', e.target.value)}
                  aria-invalid={Boolean(fieldError('submissionLink'))}
                  placeholder="https://drive.google.com/... or https://youtu.be/..."
                  className={`${inputCls} pl-10`}
                />
              </div>
              {fieldError('submissionLink') && <p className="mt-1 text-xs text-red-700">{fieldError('submissionLink')}</p>}
              <p className="mt-1.5 text-[11px] text-slate-500">
                Make sure anyone with the link can open and watch the work.
              </p>
            </div>

            {/* Short description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={labelCls.replace('mb-1.5', '')}>Tell us about the work *</label>
                <span
                  className={`text-[11px] font-bold ${
                    synopsisWords < 20 || synopsisWords > 1000 ? 'text-amber-700' : 'text-emerald-700'
                  }`}
                >
                  {synopsisWords} words (20 to 1,000 required) {synopsisWords < 20 || synopsisWords > 1000 ? '' : '✓'}
                </span>
              </div>
              <textarea
                rows={3}
                required
                maxLength={5000}
                value={form.synopsis}
                onChange={(e) => set('synopsis', e.target.value)}
                aria-invalid={Boolean(fieldError('synopsis'))}
                placeholder="What is the work about? What does the student want to show?"
                className={`${inputCls} resize-y`}
              />
              {fieldError('synopsis') && <p className="mt-1 text-xs text-red-700">{fieldError('synopsis')}</p>}
            </div>


          </div>

          {(activeCompetition.customFields ?? []).length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-4">
              <div className="border-b border-slate-200/80 pb-2.5">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  A few more questions
                </span>
              </div>
              {(activeCompetition.customFields ?? []).map((field) => (
                <div key={field.id}>
                  <label htmlFor={`custom-${field.id}`} className={labelCls}>
                    {field.label}{field.required ? ' *' : ''}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      id={`custom-${field.id}`}
                      required={field.required}
                      maxLength={2000}
                      rows={3}
                      value={customValues[field.id] ?? ''}
                      onChange={(event) => setCustomValue(field.id, event.target.value)}
                      aria-invalid={Boolean(fieldError(`customValues.${field.id}`))}
                      placeholder={field.placeholder || 'Enter your answer'}
                      className={`${inputCls} resize-y`}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      id={`custom-${field.id}`}
                      required={field.required}
                      value={customValues[field.id] ?? ''}
                      onChange={(event) => setCustomValue(field.id, event.target.value)}
                      aria-invalid={Boolean(fieldError(`customValues.${field.id}`))}
                      className={inputCls}
                    >
                      <option value="" disabled={field.required}>{field.placeholder || 'Choose an option'}</option>
                      {(field.options ?? []).map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={`custom-${field.id}`}
                      type={field.type}
                      required={field.required}
                      maxLength={2000}
                      value={customValues[field.id] ?? ''}
                      onChange={(event) => setCustomValue(field.id, event.target.value)}
                      aria-invalid={Boolean(fieldError(`customValues.${field.id}`))}
                      placeholder={field.placeholder || 'Enter your answer'}
                      className={inputCls}
                    />
                  )}
                  {fieldError(`customValues.${field.id}`) && <p className="mt-1 text-xs text-red-700">{fieldError(`customValues.${field.id}`)}</p>}
                  {field.helperText && (
                    <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">{field.helperText}</p>
                  )}
                </div>
              ))}
            </div>
          )}
          </>
          )}

          {currentStep === 2 && (
          <>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-800">Final check</p>
                <h3 className="mt-1 text-base font-bold text-slate-950">Review the entry</h3>
                <p className="mt-1 text-xs text-slate-500">Check these details before sending.</p>
              </div>
              <Trophy size={19} className="text-amber-700" />
            </div>
            <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                ['Competition', activeCompetition.title],
                ['Category', activeCompetition.category],
                ['Student', form.studentName || 'Not added'],
                ['Grade', calculatedGrade || 'Not available'],
                ['Work title', form.entryTitle || 'Not added'],
                ['Language', competitionMedium === 'None' ? 'Any language' : competitionMedium],
                ['School', school.name],
              ].map(([label, value]) => (
                <div key={label} className="min-w-0 rounded-xl bg-slate-50 px-3.5 py-3">
                  <dt className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{label}</dt>
                  <dd className="mt-1 truncate text-xs font-semibold text-slate-800">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-3 rounded-xl bg-slate-50 px-3.5 py-3">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Work description</p>
              <p className="mt-1 line-clamp-3 text-xs leading-5 text-slate-700">{form.synopsis || 'Not added'}</p>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 px-3.5 py-3">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Work link</span>
              {form.submissionLink ? (
                <a href={form.submissionLink} target="_blank" rel="noreferrer" className="max-w-full truncate text-xs font-semibold text-amber-800 underline underline-offset-2">
                  Check the link
                </a>
              ) : (
                <span className="text-xs text-slate-500">Not added</span>
              )}
            </div>
            <button type="button" onClick={() => setCurrentStep(0)} className="mt-4 text-xs font-semibold text-amber-800 underline-offset-4 hover:underline">
              Change student or competition details
            </button>
            <button type="button" onClick={() => setCurrentStep(1)} className="ml-4 text-xs font-semibold text-amber-800 underline-offset-4 hover:underline">
              Change work details
            </button>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
            <label className="flex items-start gap-3 cursor-pointer text-xs text-slate-700 leading-relaxed">
              <input
                type="checkbox"
                required
                checked={certified}
                onChange={(e) => setCertified(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500 shrink-0"
              />
              <span>
                I confirm this is the student’s own work. I checked the student’s details and date of birth, and this entry follows the competition rules.
              </span>
            </label>
          </div>
          </>
          )}

          {/* Submit Action */}
          <div className="sticky bottom-0 -mx-4 flex items-center gap-3 border-t border-slate-100 bg-white/95 px-4 py-3 backdrop-blur sm:-mx-7 sm:px-7">
            <button
              type="button"
              onClick={() => {
                if (currentStep === 0) {
                  onClose();
                } else {
                  setError(null);
                  setCurrentStep((step) => step - 1);
                }
              }}
              className="min-h-11 flex-1 rounded-xl border border-slate-200 bg-white py-3 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50"
            >
              {currentStep === 0 ? 'Cancel' : 'Back'}
            </button>

            {currentStep < 2 ? (
              <button type="button" onClick={continueForm} className="inline-flex min-h-11 flex-[1.5] items-center justify-center gap-2 rounded-xl bg-sara-navy px-4 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800">
                Continue <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting || success}
                className="inline-flex min-h-11 flex-[1.5] items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Sending entry...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle2 size={16} />
                    Entry sent
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    Send entry
                  </>
                )}
              </button>
            )}
          </div>

        </form>
      </div>
    </div>
  );
}
