'use client';

import React, { useState } from 'react';
import { useMediaStore } from '@/lib/store';
import { Competition, RegisteredSchool } from '@/lib/types';
import {
  X,
  Link as LinkIcon,
  AlertCircle,
  CheckCircle2,
  Film,
} from 'lucide-react';

interface EntrySubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  competition: Competition;
  school: RegisteredSchool;
  onSubmitted?: () => void;
}

export function EntrySubmissionModal({
  isOpen,
  onClose,
  competition,
  school,
  onSubmitted,
}: EntrySubmissionModalProps) {
  const { submitEntry } = useMediaStore();

  const [studentName, setStudentName] = useState('');
  const [studentGrade, setStudentGrade] = useState('Grade 12');
  const [studentContact, setStudentContact] = useState('');
  const [entryTitle, setEntryTitle] = useState('');
  const [submissionLink, setSubmissionLink] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [customValues, setCustomValues] = useState<Record<string, string>>({});
  const [certified, setCertified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCustomChange = (fieldId: string, value: string) => {
    setCustomValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!entryTitle.trim()) {
      setError('Please provide the title of your competition project.');
      return;
    }
    if (!studentName.trim()) {
      setError('Please provide the primary student contestant / director name.');
      return;
    }
    if (!submissionLink.trim() || (!submissionLink.startsWith('http://') && !submissionLink.startsWith('https://'))) {
      setError('Please provide a valid accessible URL (Google Drive, YouTube, Vimeo, OneDrive).');
      return;
    }
    if (!synopsis.trim()) {
      setError('Please write a brief synopsis or description of your work.');
      return;
    }
    if (!certified) {
      setError('You must check the certification declaration box to submit.');
      return;
    }

    for (const field of competition.customFields) {
      if (field.required && !customValues[field.id]?.trim()) {
        setError(`Please fill in required field: ${field.label}`);
        return;
      }
    }

    try {
      submitEntry({
        competitionId: competition.id,
        competitionTitle: competition.title,
        schoolId: school.id,
        schoolName: school.name,
        category: competition.category,
        studentName: studentName.trim(),
        studentGrade,
        studentContact: studentContact.trim(),
        entryTitle: entryTitle.trim(),
        submissionLink: submissionLink.trim(),
        synopsis: synopsis.trim(),
        customValues,
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        if (onSubmitted) onSubmitted();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err?.message || 'Failed to submit entry.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 my-8 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-mono uppercase mb-2">
            <Film size={13} /> {competition.category}
          </div>
          <h2 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">
            {competition.title}
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-light">
            Submitting on behalf of: <span className="text-amber-800 font-semibold">{school.name}</span>
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-6 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 mb-6 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
            <CheckCircle2 size={15} className="shrink-0" />
            <span>Submission received and registered in jury docket!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          {/* Entry Title */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Entry / Artwork / Project Title *
            </label>
            <input
              type="text"
              required
              value={entryTitle}
              onChange={(e) => setEntryTitle(e.target.value)}
              placeholder="e.g. Whispers of the Galle Fort / Sound of Rain"
              className="w-full px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-amber-500 focus:bg-white"
            />
          </div>

          {/* Student Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Lead Student Contestant / Director *
              </label>
              <input
                type="text"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Full student name"
                className="w-full px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-amber-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Grade / Class *
              </label>
              <select
                value={studentGrade}
                onChange={(e) => setStudentGrade(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-amber-500 focus:bg-white"
              >
                {['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11 (O/L)', 'Grade 12 (A/L)', 'Grade 13 (A/L)'].map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Contestant Contact Phone (Optional)
            </label>
            <input
              type="tel"
              value={studentContact}
              onChange={(e) => setStudentContact(e.target.value)}
              placeholder="+94 7X XXX XXXX"
              className="w-full px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-amber-500 focus:bg-white"
            />
          </div>

          {/* Submission URL */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Cloud Submission Link (Google Drive / YouTube / Vimeo) *
            </label>
            <div className="relative">
              <input
                type="url"
                required
                value={submissionLink}
                onChange={(e) => setSubmissionLink(e.target.value)}
                placeholder="https://drive.google.com/drive/folders/... or https://youtu.be/..."
                className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-amber-500 focus:bg-white"
              />
              <LinkIcon size={15} className="absolute left-3 top-3 text-slate-400" />
            </div>
            <p className="text-[10px] text-amber-700 mt-1">
              Ensure Google Drive sharing permission is set to "Anyone with the link can view".
            </p>
          </div>

          {/* Synopsis */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Synopsis & Description (100 - 200 Words) *
            </label>
            <textarea
              required
              rows={3}
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              placeholder="Provide context, storyline synopsis, or artistic statement..."
              className="w-full px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-amber-500 focus:bg-white resize-none"
            />
          </div>

          {/* Dynamic Competition Custom Fields */}
          {competition.customFields && competition.customFields.length > 0 && (
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <p className="text-xs font-mono uppercase tracking-wider text-amber-700 font-semibold">
                Category-Specific Parameters:
              </p>
              {competition.customFields.map((field) => (
                <div key={field.id}>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {field.label} {field.required && '*'}
                  </label>
                  {field.type === 'select' ? (
                    <select
                      value={customValues[field.id] || ''}
                      onChange={(e) => handleCustomChange(field.id, e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-amber-500 focus:bg-white"
                    >
                      <option value="">Select option...</option>
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      rows={2}
                      value={customValues[field.id] || ''}
                      onChange={(e) => handleCustomChange(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-amber-500 focus:bg-white resize-none"
                    />
                  ) : (
                    <input
                      type={field.type}
                      value={customValues[field.id] || ''}
                      onChange={(e) => handleCustomChange(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-amber-500 focus:bg-white"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Declaration Checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={certified}
                onChange={(e) => setCertified(e.target.checked)}
                className="mt-1 accent-amber-600 rounded"
              />
              <span className="text-[11px] text-slate-600 leading-normal">
                I hereby declare that this entry represents the original work of student(s) at {school.name}. We confirm that the cloud link is public and complies with Agradhi Media Unit competition bylaws.
              </span>
            </label>
          </div>

          {/* Action */}
          <div className="pt-3">
            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-sm"
            >
              Confirm Official Entry Submission
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
