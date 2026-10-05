'use client';

import React, { useState } from 'react';
import { useMediaStore } from '@/lib/store';
import type { Competition, NewSubmissionInput, RegisteredSchool } from '@/lib/types';
import { calculateAge, validateSubmissionInput } from '@/lib/validation';
import {
  X,
  AlertCircle,
  CheckCircle2,
  Film,
  User,
  Calendar,
  Phone,
  Globe,
  FileText,
  Info,
  Mic,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  competition: Competition;
  school: RegisteredSchool;
  onSubmitted?: () => void | Promise<void>;
}

// ── Grade → typical age range lookup ─────────────────────────────────────────
const GRADE_AGE_MAP: Record<string, { min: number; max: number }> = {
  'Grade 6':  { min: 10, max: 13 },
  'Grade 7':  { min: 11, max: 14 },
  'Grade 8':  { min: 12, max: 15 },
  'Grade 9':  { min: 13, max: 16 },
  'Grade 10': { min: 14, max: 17 },
  'Grade 11': { min: 15, max: 18 },
  'Grade 12': { min: 16, max: 19 },
  'Grade 13': { min: 17, max: 20 },
};

const ALL_GRADES = ['Grade 6','Grade 7','Grade 8','Grade 9','Grade 10','Grade 11','Grade 12','Grade 13'];

function getMediumBadge(medium: string) {
  if (medium === 'Sinhala') return { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200', label: 'Sinhala Medium' };
  if (medium === 'English') return { bg: 'bg-violet-100', text: 'text-violet-800', border: 'border-violet-200', label: 'English Medium' };
  return { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', label: 'Any Medium' };
}

const inputCls = 'w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:bg-white transition-all placeholder:text-slate-400';
const labelCls = 'block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide';

export function EntrySubmissionModal({ isOpen, onClose, competition, school, onSubmitted }: Props) {
  const { competitions, submissions, submitEntry } = useMediaStore();

  const [form, setForm] = useState({
    studentName: '',
    studentGrade: ALL_GRADES[5], // Grade 11 default
    studentBirthday: '',
    studentContact: '',
    entryTitle: '',
    submissionLink: '',
    synopsis: '',
  });
  const [customValues, setCustomValues] = useState<Record<string, string>>({});
  const [certified, setCertified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Derived state
  const calculatedAge = calculateAge(form.studentBirthday);
  const expectedAgeRange = form.studentGrade ? GRADE_AGE_MAP[form.studentGrade] : null;
  const ageWarning = calculatedAge !== null && expectedAgeRange
    ? (calculatedAge < expectedAgeRange.min - 2 || calculatedAge > expectedAgeRange.max + 2)
      ? `Age ${calculatedAge} seems unusual for ${form.studentGrade}. Expected ${expectedAgeRange.min}–${expectedAgeRange.max}.`
      : null
    : null;

  const ageEligibilityError =
    calculatedAge !== null && competition.ageCategory
      ? (calculatedAge < competition.ageCategory.minAge || calculatedAge > competition.ageCategory.maxAge)
        ? `Student age ${calculatedAge} is outside this competition's eligibility (${competition.ageCategory.minAge}–${competition.ageCategory.maxAge} years).`
        : null
      : null;

  // Filter grades to eligible ones based on competition ageCategory
  const eligibleGrades = competition.ageCategory
    ? ALL_GRADES.filter((g) => competition.ageCategory!.grades.includes(g))
    : ALL_GRADES;

  const synopsisWords = form.synopsis.trim() ? form.synopsis.trim().split(/\s+/).length : 0;
  const medium = competition.medium;

  const set = <K extends keyof typeof form>(k: K, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleCustomChange = (fieldId: string, value: string) =>
    setCustomValues((prev) => ({ ...prev, [fieldId]: value }));

  const submissionInput: NewSubmissionInput = {
    competitionId: competition.id,
    competitionTitle: competition.title,
    competitionMedium: competition.medium,
    schoolId: school.id,
    schoolName: school.name,
    category: competition.category,
    studentName: form.studentName.trim(),
    studentGrade: form.studentGrade,
    studentBirthday: form.studentBirthday,
    studentContact: form.studentContact.trim(),
    entryTitle: form.entryTitle.trim(),
    submissionLink: form.submissionLink.trim(),
    synopsis: form.synopsis.trim(),
    customValues,
  };

  const validate = (): string | null => {
    if (competition.status !== 'open') return 'This competition is no longer accepting entries.';
    if (school.status !== 'active') return 'Your school account is not active and cannot submit entries.';
    const entryCount = submissions.filter(
      (entry) => entry.competitionId === competition.id && entry.schoolId === school.id
    ).length;
    if (entryCount >= competition.maxEntriesPerSchool) {
      return `Your school has reached the entry limit (${competition.maxEntriesPerSchool}) for this competition.`;
    }
    const dataErrors = validateSubmissionInput(submissionInput, competitions);
    if (Object.keys(dataErrors).length > 0) return Object.values(dataErrors)[0];
    if (!certified) return 'You must check the certification declaration.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setSubmitting(true);
    let entrySaved = false;
    try {
      await submitEntry({
        ...submissionInput,
      });
      entrySaved = true;
      setSuccess(true);
      try {
        await onSubmitted?.();
      } catch (refreshError: unknown) {
        console.error('[entry submission] Entry saved but dashboard refresh failed.', refreshError);
        setError('Your entry was saved, but the dashboard could not refresh. Reopen the entries tab to view it.');
      }
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1800);
    } catch (err: unknown) {
      if (!entrySaved) {
        setError(err instanceof Error ? err.message : 'Submission failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const mediumBadge = getMediumBadge(medium);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl my-4">
        
        {/* ── Header ── */}
        <div className="sticky top-0 z-10 bg-white rounded-t-3xl border-b border-slate-100 px-6 pt-6 pb-4">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all"
          >
            <X size={18} />
          </button>

          {/* Competition badge */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${mediumBadge.bg} ${mediumBadge.text} ${mediumBadge.border}`}>
              <Mic size={10} />
              {mediumBadge.label}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-mono">
              <Film size={10} />
              {competition.category}
            </span>
          </div>

          <h2 className="text-xl font-bold text-slate-900 pr-10 leading-tight">{competition.title}</h2>
          <p className="text-xs text-slate-500 mt-1">
            For: <span className="font-semibold text-amber-700">{school.name}</span>
            {competition.ageCategory && (
              <span className="ml-2 text-slate-400">
                · Eligible ages: {competition.ageCategory.minAge}–{competition.ageCategory.maxAge} yrs
              </span>
            )}
          </p>
        </div>

        {/* ── Alerts ── */}
        <div className="px-6 pt-4">
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2.5 p-3.5 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>Entry submitted and registered in the jury docket!</span>
            </div>
          )}
        </div>

        {/* ── Form ── */}
        <form noValidate onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">

          {/* ── Section: Entry Details ── */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 mb-3 pb-1.5 border-b border-amber-100">
              📝 Entry Details
            </p>
            <label className={labelCls}>Entry / Project Title *</label>
            <input
              type="text"
              required
              minLength={2}
              maxLength={160}
              value={form.entryTitle}
              onChange={(e) => set('entryTitle', e.target.value)}
              placeholder="e.g. Whispers of the Galle Fort / Sound of Rain"
              className={inputCls}
            />
          </div>

          {/* ── Section: Student Details ── */}
          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 pb-1.5 border-b border-amber-100">
              👤 Student Information
            </p>

            {/* Name */}
            <div>
              <label className={labelCls}>Full Name *</label>
              <div className="relative">
                <User size={14} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={100}
                  value={form.studentName}
                  onChange={(e) => set('studentName', e.target.value)}
                  placeholder="Full student name (as in school records)"
                  className={`${inputCls} pl-9`}
                />
              </div>
            </div>

            {/* Grade & Birthday row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Grade / Class *</label>
                <select
                  required
                  value={form.studentGrade}
                  onChange={(e) => set('studentGrade', e.target.value)}
                  className={inputCls}
                >
                  {eligibleGrades.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>Date of Birth *</label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="date"
                    required
                    value={form.studentBirthday}
                    onChange={(e) => set('studentBirthday', e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className={`${inputCls} pl-9`}
                  />
                </div>
              </div>
            </div>

            {/* Age display card */}
            {form.studentBirthday && (
              <div className={`flex items-center gap-3 p-3 rounded-xl border text-sm ${
                ageEligibilityError
                  ? 'bg-red-50 border-red-200'
                  : ageWarning
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-emerald-50 border-emerald-200'
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-black shrink-0 ${
                  ageEligibilityError ? 'bg-red-100 text-red-700' :
                  ageWarning ? 'bg-amber-100 text-amber-700' :
                  'bg-emerald-100 text-emerald-700'
                }`}>
                  {calculatedAge ?? '?'}
                </div>
                <div>
                  <p className={`font-semibold text-xs ${
                    ageEligibilityError ? 'text-red-800' : ageWarning ? 'text-amber-800' : 'text-emerald-800'
                  }`}>
                    {ageEligibilityError
                      ? `⛔ Age ${calculatedAge} — Not Eligible`
                      : ageWarning
                      ? `⚠️ Age ${calculatedAge} — Please verify`
                      : `✓ Age ${calculatedAge} — Eligible`
                    }
                  </p>
                  <p className={`text-[11px] mt-0.5 ${
                    ageEligibilityError ? 'text-red-600' : ageWarning ? 'text-amber-600' : 'text-emerald-600'
                  }`}>
                    {ageEligibilityError || ageWarning || `Within eligible range for ${competition.ageCategory?.label ?? 'this competition'}`}
                  </p>
                </div>
              </div>
            )}

            {/* Contact */}
            <div>
              <label className={labelCls}>Student Contact Phone *</label>
              <div className="relative">
                <Phone size={14} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="tel"
                  required
                  maxLength={20}
                  value={form.studentContact}
                  onChange={(e) => set('studentContact', e.target.value)}
                  placeholder="+94 77 123 4567"
                  className={`${inputCls} pl-9`}
                />
              </div>
            </div>
          </div>

          {/* ── Section: Submission ── */}
          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 pb-1.5 border-b border-amber-100">
              🔗 Submission Details
            </p>

            {/* Medium auto-filled (read-only) */}
            {medium !== 'None' && (
              <div>
                <label className={labelCls}>Competition Medium (Auto-filled)</label>
                <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${mediumBadge.bg} ${mediumBadge.border}`}>
                  <Mic size={14} className={mediumBadge.text} />
                  <span className={`text-sm font-semibold ${mediumBadge.text}`}>{medium} Medium</span>
                  <span className="ml-auto text-[10px] text-slate-400 font-mono">auto</span>
                </div>
              </div>
            )}

            {/* Submission link */}
            <div>
              <label className={labelCls}>Cloud Submission Link *</label>
              <div className="relative">
                <Globe size={14} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="url"
                  required
                  maxLength={2048}
                  value={form.submissionLink}
                  onChange={(e) => set('submissionLink', e.target.value)}
                  placeholder="https://drive.google.com/... or https://youtu.be/..."
                  className={`${inputCls} pl-9`}
                />
              </div>
              <p className="mt-1.5 text-[11px] text-amber-700 flex items-center gap-1">
                <Info size={10} />
                Google Drive: set sharing to &quot;Anyone with the link can view&quot;
              </p>
            </div>

            {/* Synopsis */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={labelCls.replace('mb-1.5', '')}>Synopsis & Description *</label>
                <span className={`text-[11px] font-mono ${synopsisWords < 20 ? 'text-red-500' : 'text-emerald-600'}`}>
                  {synopsisWords} / 20+ words
                </span>
              </div>
              <div className="relative">
                <FileText size={14} className="absolute left-3.5 top-3 text-slate-400" />
                <textarea
                  rows={4}
                  required
                  maxLength={10000}
                  value={form.synopsis}
                  onChange={(e) => set('synopsis', e.target.value)}
                  placeholder="Provide context, storyline synopsis, or artistic statement (min. 20 words)..."
                  className={`${inputCls} pl-9 resize-none`}
                />
              </div>
            </div>
          </div>

          {/* ── Section: Competition-specific fields ── */}
          {competition.customFields && competition.customFields.length > 0 && (
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 pb-1.5 border-b border-amber-100">
                ⚙️ Category-Specific Fields
              </p>
              {competition.customFields.map((field) => (
                <div key={field.id}>
                  <label className={labelCls}>
                    {field.label} {field.required && '*'}
                  </label>
                  {field.type === 'select' ? (
                    <select
                      required={field.required}
                      value={customValues[field.id] || ''}
                      onChange={(e) => handleCustomChange(field.id, e.target.value)}
                      className={inputCls}
                    >
                      <option value="">— Select option —</option>
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      rows={3}
                      required={field.required}
                      maxLength={2000}
                      value={customValues[field.id] || ''}
                      onChange={(e) => handleCustomChange(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      className={`${inputCls} resize-none`}
                    />
                  ) : (
                    <input
                      type={field.type}
                      required={field.required}
                      maxLength={field.type === 'number' ? undefined : 2000}
                      value={customValues[field.id] || ''}
                      onChange={(e) => handleCustomChange(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      className={inputCls}
                    />
                  )}
                  {field.helperText && (
                    <p className="text-[11px] text-slate-500 mt-1">{field.helperText}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── Declaration ── */}
          <div className="pt-1">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative mt-0.5">
                <input
                  type="checkbox"
                  checked={certified}
                  onChange={(e) => setCertified(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                  certified ? 'bg-amber-600 border-amber-600' : 'border-slate-300 bg-white group-hover:border-amber-400'
                }`}>
                  {certified && <CheckCircle2 size={12} className="text-white" />}
                </div>
              </div>
              <span className="text-[12px] text-slate-600 leading-relaxed">
                I hereby declare that this entry represents the <strong>original work</strong> of student(s) at{' '}
                <span className="text-amber-700 font-semibold">{school.name}</span>. I confirm that all provided
                information is accurate, the cloud link is public, and this submission complies with{' '}
                <strong>Agradhi Media Unit 2026</strong> competition bylaws.
              </span>
            </label>
          </div>

          {/* ── Submit button ── */}
          <button
            type="submit"
            disabled={submitting || success || !!ageEligibilityError}
            className="w-full py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-sm transition-all shadow-sm hover:shadow-md disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting…
              </>
            ) : success ? (
              <><CheckCircle2 size={16} /> Submitted!</>
            ) : (
              'Confirm Official Entry Submission'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
