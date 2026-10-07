'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useMediaStore } from '@/lib/store';
import type { Competition, NewSubmissionInput, RegisteredSchool } from '@/lib/types';
import { calculateAge, validateSubmissionInput } from '@/lib/validation';
import {
  X,
  AlertCircle,
  CheckCircle2,
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

const ALL_GRADES = [
  'Grade 6',
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Grade 10',
  'Grade 11',
  'Grade 12',
  'Grade 13',
];

const inputCls =
  'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all shadow-xs';
const labelCls = 'mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600';

export function EntrySubmissionModal({
  isOpen,
  onClose,
  competition: initialCompetition,
  school,
  onSubmitted,
}: Props) {
  const { competitions, submissions, submitEntry } = useMediaStore();

  const [selectedCompId, setSelectedCompId] = useState(initialCompetition.id);

  const activeCompetition = useMemo(() => {
    return competitions.find((c) => c.id === selectedCompId) || initialCompetition;
  }, [competitions, selectedCompId, initialCompetition]);

  const competitionMedium = activeCompetition.medium;

  const [form, setForm] = useState({
    studentName: '',
    studentGrade: ALL_GRADES[4], 
    studentBirthday: '',
    studentContact: '',
    entryTitle: '',
    submissionLink: '',
    synopsis: '',
  });

  const [certified, setCertified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setSelectedCompId(initialCompetition.id);
  }, [initialCompetition.id]);

  const calculatedAge = useMemo(() => {
    return calculateAge(form.studentBirthday);
  }, [form.studentBirthday]);

  // Strict Competition Age Eligibility Check
  const ageEligibilityError = useMemo(() => {
    if (calculatedAge === null || !activeCompetition.ageCategory) return null;
    const { minAge, maxAge } = activeCompetition.ageCategory;
    if (calculatedAge < minAge) {
      return `Student is ${calculatedAge} years old, but this track requires minimum age ${minAge}. (Eligibility: ${activeCompetition.eligibility}).`;
    }
    if (calculatedAge > maxAge) {
      return `Student is ${calculatedAge} years old, but this track allows maximum age ${maxAge}. (Eligibility: ${activeCompetition.eligibility}).`;
    }
    return null;
  }, [calculatedAge, activeCompetition]);

  const eligibleGrades = useMemo(() => {
    if (activeCompetition.ageCategory?.grades && activeCompetition.ageCategory.grades.length > 0) {
      return ALL_GRADES.filter((g) => activeCompetition.ageCategory!.grades.includes(g));
    }
    return ALL_GRADES;
  }, [activeCompetition]);

  useEffect(() => {
    if (eligibleGrades.length > 0 && !eligibleGrades.includes(form.studentGrade)) {
      setForm((f) => ({ ...f, studentGrade: eligibleGrades[0] }));
    }
  }, [eligibleGrades, form.studentGrade]);

  const synopsisWords = useMemo(() => {
    return form.synopsis.trim() ? form.synopsis.trim().split(/\s+/).length : 0;
  }, [form.synopsis]);

  const set = <K extends keyof typeof form>(k: K, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
  };

  const submissionInput: NewSubmissionInput = {
    competitionId: activeCompetition.id,
    competitionTitle: activeCompetition.title,
    competitionMedium: activeCompetition.medium,
    schoolId: school.id,
    schoolName: school.name,
    category: activeCompetition.category,
    studentName: form.studentName.trim(),
    studentGrade: form.studentGrade,
    studentBirthday: form.studentBirthday,
    studentContact: form.studentContact.trim(),
    entryTitle: form.entryTitle.trim(),
    submissionLink: form.submissionLink.trim(),
    synopsis: form.synopsis.trim(),
  };

  const validate = (): string | null => {
    if (activeCompetition.status !== 'open') {
      return 'This competition track is currently closed for submissions.';
    }
    if (school.status !== 'active') {
      return 'Your school profile is not active. Please contact Agradhi Administration.';
    }

    const schoolSubmissions = submissions.filter(
      (e) => e.competitionId === activeCompetition.id && e.schoolId === school.id
    );
    if (schoolSubmissions.length >= activeCompetition.maxEntriesPerSchool) {
      return `Your school has reached the maximum quota of ${activeCompetition.maxEntriesPerSchool} entries for this track.`;
    }

    if (ageEligibilityError) {
      return ageEligibilityError;
    }

    const dataErrors = validateSubmissionInput(submissionInput, competitions);
    if (Object.keys(dataErrors).length > 0) {
      return Object.values(dataErrors)[0];
    }

    if (!certified) {
      return 'Please confirm the school certification declaration before submitting.';
    }

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
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/60 p-3 sm:p-6">
      <div className="relative my-6 w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
        
        {/* Header*/}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center">
              <Trophy size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight">Official Student Entry Submission</h2>
              <p className="text-[11px] text-slate-400">Agradhi Media Assembly 2026 · {school.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-1.5 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Status Alerts */}
        <div className="px-6 pt-4">
          {error && (
            <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-800 animate-in fade-in-50">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800 animate-in fade-in-50">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
              <span className="font-semibold">Student entry successfully registered and submitted for review!</span>
            </div>
          )}
        </div>

        {/* Submission Form */}
        <form noValidate onSubmit={handleSubmit} className="space-y-6 px-6 pb-6">
          
          {/* SECTION 1: Competition & Automatic Medium */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Trophy size={14} className="text-amber-600" />
                <span>1. Select Competition Track</span>
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Quota: {activeCompetition.maxEntriesPerSchool} entries per school
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className={labelCls}>Competition Track *</label>
                <select
                  value={selectedCompId}
                  onChange={(e) => setSelectedCompId(e.target.value)}
                  className={inputCls}
                >
                  {competitions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Automatically Filled & Locked Medium */}
              <div>
                <label className={labelCls}>Medium (Auto-Filled)</label>
                <div className="flex items-center h-[42px] px-3.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs text-slate-800">
                  {competitionMedium === 'Sinhala' && (
                    <span className="inline-flex items-center gap-1 text-blue-700">
                      <span className="w-2 h-2 rounded-full bg-blue-600" /> Sinhala Medium
                    </span>
                  )}
                  {competitionMedium === 'English' && (
                    <span className="inline-flex items-center gap-1 text-purple-700">
                      <span className="w-2 h-2 rounded-full bg-purple-600" /> English Medium
                    </span>
                  )}
                  {(competitionMedium === 'None' || !competitionMedium) && (
                    <span className="inline-flex items-center gap-1 text-emerald-700">
                      <span className="w-2 h-2 rounded-full bg-emerald-600" /> Open / Non-verbal
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
                Eligibility: <strong>{activeCompetition.eligibility}</strong>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200">
                Deadline: <strong>{activeCompetition.deadline}</strong>
              </span>
            </div>
          </div>

          {/* SECTION 2: Student Details & Real-Time Age Verification */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-4">
            <div className="border-b border-slate-200/80 pb-2.5">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <User size={14} className="text-amber-600" />
                <span>2. Student Information & Age Verification</span>
              </span>
            </div>

            {/* Student Full Name */}
            <div>
              <label className={labelCls}>Student Full Name *</label>
              <input
                type="text"
                required
                minLength={2}
                maxLength={100}
                value={form.studentName}
                onChange={(e) => set('studentName', e.target.value)}
                placeholder="Full student name (e.g. Kasun Kavinda Perera)"
                className={inputCls}
              />
            </div>

            {/* Birthday and Grade row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Student Date of Birth *</label>
                <input
                  type="date"
                  required
                  value={form.studentBirthday}
                  onChange={(e) => set('studentBirthday', e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Current Grade / Class *</label>
                <select
                  required
                  value={form.studentGrade}
                  onChange={(e) => set('studentGrade', e.target.value)}
                  className={inputCls}
                >
                  {eligibleGrades.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
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
                    Calculated Student Age: <strong>{calculatedAge} years old</strong>
                  </span>
                  
                  <span
                    className={`ml-auto px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      ageEligibilityError
                        ? 'bg-red-200 text-red-800'
                        : 'bg-emerald-200 text-emerald-800'
                    }`}
                  >
                    {ageEligibilityError ? 'Ineligible Age' : 'Eligible'}
                  </span>
                </div>

                <p className="mt-1 text-xs leading-relaxed text-slate-700">
                  {ageEligibilityError ||
                    `Student meets the age criteria for ${activeCompetition.ageCategory?.label ?? 'this competition'} (${activeCompetition.eligibility}).`}
                </p>
              </div>
            )}

            {/* Student Contact Phone */}
            <div>
              <label className={labelCls}>Student / Parent Contact Phone *</label>
              <input
                type="tel"
                required
                maxLength={20}
                value={form.studentContact}
                onChange={(e) => set('studentContact', e.target.value)}
                placeholder="e.g. 077 123 4567"
                className={inputCls}
              />
            </div>
          </div>

          {/* SECTION 3: Entry Details, Cloud Link & Synopsis */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-4">
            <div className="border-b border-slate-200/80 pb-2.5">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <FileText size={14} className="text-amber-600" />
                <span>3. Entry Title & Cloud Submission Link</span>
              </span>
            </div>

            {/* Entry Title */}
            <div>
              <label className={labelCls}>Entry / Project Title *</label>
              <input
                type="text"
                required
                minLength={2}
                maxLength={160}
                value={form.entryTitle}
                onChange={(e) => set('entryTitle', e.target.value)}
                placeholder="e.g. Whispers of the Galle Fort / Sound of Morning Rain"
                className={inputCls}
              />
            </div>

            {/* Submission Cloud Link */}
            <div>
              <label className={labelCls}>Cloud Submission Link (Google Drive / YouTube / OneDrive) *</label>
              <div className="relative">
                <LinkIcon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="url"
                  required
                  maxLength={2048}
                  value={form.submissionLink}
                  onChange={(e) => set('submissionLink', e.target.value)}
                  placeholder="https://drive.google.com/... or https://youtu.be/..."
                  className={`${inputCls} pl-10`}
                />
              </div>
              <p className="mt-1.5 text-[11px] text-slate-500">
                Google Drive links: Please set sharing permissions to &quot;Anyone with the link can view&quot;.
              </p>
            </div>

            {/* Synopsis / Description with Live Word Count Progress */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={labelCls.replace('mb-1.5', '')}>Synopsis / Concept Description *</label>
                <span
                  className={`text-[11px] font-bold ${
                    synopsisWords < 20 ? 'text-amber-700' : 'text-emerald-700'
                  }`}
                >
                  {synopsisWords} words {synopsisWords < 20 ? '(min. 20 words needed)' : '✓'}
                </span>
              </div>
              <textarea
                rows={3}
                required
                maxLength={5000}
                value={form.synopsis}
                onChange={(e) => set('synopsis', e.target.value)}
                placeholder="Describe the central idea, creative concept, or story behind this student entry..."
                className={`${inputCls} resize-y`}
              />
            </div>


          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
            <label className="flex items-start gap-3 cursor-pointer text-xs text-slate-700 leading-relaxed">
              <input
                type="checkbox"
                required
                checked={certified}
                onChange={(e) => setCertified(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500 shrink-0"
              />
              <span>
                I, as the registered representative for <strong>{school.name}</strong>, certify that this entry represents the original student work, verified birthdate, and complies with all Agradhi Media Assembly 2026 bylaws.
              </span>
            </label>
          </div>

          {/* Submit Action */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting || success || !!ageEligibilityError}
              className="flex-2 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Validating & Submitting...</span>
                </>
              ) : success ? (
                <>
                  <CheckCircle2 size={16} />
                  <span>Submitted Successfully!</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  <span>Submit Official Entry</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
