'use client';

import React, { useState } from 'react';
import { useMediaStore } from '@/lib/store';
import { CheckCircle2, AlertCircle, ChevronRight, ChevronLeft, User, Trophy, BookOpen } from 'lucide-react';

const COMPETITION_CATEGORIES = [
  { id: 'news-presenting-s', label: 'News Presenting', stream: 'Sinhala' },
  { id: 'news-presenting-e', label: 'News Presenting', stream: 'English' },
  { id: 'news-editing-s', label: 'News Editing', stream: 'Sinhala' },
  { id: 'news-editing-e', label: 'News Editing', stream: 'English' },
  { id: 'radio-script-s', label: 'Radio Script Writing', stream: 'Sinhala' },
  { id: 'radio-script-e', label: 'Radio Script Writing', stream: 'English' },
  { id: 'radio-presenting-s', label: 'Radio Presenting', stream: 'Sinhala' },
  { id: 'radio-presenting-e', label: 'Radio Presenting', stream: 'English' },
  { id: 'programme-presenting-s', label: 'Programme Presenting', stream: 'Sinhala' },
  { id: 'programme-presenting-e', label: 'Programme Presenting', stream: 'English' },
  { id: 'dubbing-s', label: 'Dubbing', stream: 'Sinhala' },
  { id: 'dubbing-e', label: 'Dubbing', stream: 'English' },
  { id: 'photography', label: 'Photography', stream: '' },
  { id: 'announcing', label: 'Announcing', stream: '' },
  { id: 'radio-operator', label: 'Radio Operator', stream: '' },
];

const STEPS = [
  { num: 1, label: 'Your Info', icon: User },
  { num: 2, label: 'Competition', icon: Trophy },
  { num: 3, label: 'Confirm', icon: BookOpen },
];

const input = 'w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-base focus:outline-none focus:border-amber-500 focus:bg-white transition-colors';
const label = 'block text-sm font-semibold text-slate-700 mb-2';

export function StudentEntryForm() {
  const { schools } = useMediaStore();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    studentName: '',
    grade: '',
    level: '',
    phone: '',
    schoolId: '',
    categoryId: '',
    notes: '',
  });

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const selectedCat = COMPETITION_CATEGORIES.find((c) => c.id === form.categoryId);
  const selectedSchool = schools.find((s) => s.id === form.schoolId);

  const validate = (): boolean => {
    setError(null);
    if (step === 1) {
      if (!form.studentName.trim()) { setError('Please enter your full name.'); return false; }
      if (!form.grade.trim()) { setError('Please enter your grade.'); return false; }
      if (!form.schoolId) { setError('Please select your school.'); return false; }
    }
    if (step === 2) {
      if (!form.categoryId) { setError('Please select a competition category.'); return false; }
    }
    return true;
  };

  const next = () => { if (validate()) setStep((s) => Math.min(s + 1, STEPS.length)); };
  const back = () => { setError(null); setStep((s) => Math.max(s - 1, 1)); };

  const submit = () => {
    if (!validate()) return;
    // In a real app, this would call submitEntry from the store
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={40} className="text-emerald-600" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">Application Submitted!</h2>
        <p className="text-slate-500 max-w-sm mx-auto mb-2">
          Your entry for <strong className="text-slate-700">{selectedCat?.label}{selectedCat?.stream ? ` (${selectedCat.stream})` : ''}</strong> has been received.
        </p>
        <p className="text-sm text-slate-400">
          Your school's Teacher-in-Charge will be notified and can track your entry status.
        </p>
        <div className="mt-8 p-4 rounded-xl bg-amber-50 border border-amber-200 max-w-sm mx-auto text-sm text-amber-800">
          <strong>Entry Reference:</strong> AMU-{Date.now().toString(36).toUpperCase().slice(-6)}
        </div>
        <button onClick={() => { setSubmitted(false); setStep(1); setForm({ studentName: '', grade: '', level: '', phone: '', schoolId: '', categoryId: '', notes: '' }); }}
          className="mt-6 px-6 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors">
          Submit Another Entry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Step indicators */}
      <div className="flex items-center justify-between mb-8 max-w-sm mx-auto">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const done = step > s.num;
          const active = step === s.num;
          return (
            <React.Fragment key={s.num}>
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all ${
                  done ? 'bg-amber-600 border-amber-600 text-white' :
                  active ? 'bg-white border-amber-600 text-amber-600 shadow-md' :
                  'bg-white border-slate-200 text-slate-300'
                }`}>
                  {done ? <CheckCircle2 size={18} /> : <Icon size={18} />}
                </div>
                <span className={`text-xs font-semibold ${active ? 'text-amber-700' : done ? 'text-slate-500' : 'text-slate-300'}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-3 mb-5 ${step > s.num ? 'bg-amber-500' : 'bg-slate-200'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-4 mb-5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle size={16} className="shrink-0" /> {error}
        </div>
      )}

      {/* ── STEP 1: Student Info ── */}
      {step === 1 && (
        <div className="space-y-5">
          <div className="mb-2">
            <h2 className="text-xl font-bold text-slate-800">Your Details</h2>
            <p className="text-sm text-slate-500 mt-1">Tell us about yourself. Fill in clearly.</p>
          </div>

          <div>
            <label className={label}>Your Full Name *</label>
            <input className={input} value={form.studentName} onChange={(e) => set('studentName', e.target.value)} placeholder="e.g. Kasun Madushan Perera" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>Grade *</label>
              <select className={input} value={form.grade} onChange={(e) => set('grade', e.target.value)}>
                <option value="">Select Grade</option>
                {Array.from({ length: 8 }, (_, i) => i + 6).map((g) => (
                  <option key={g} value={`Grade ${g}`}>Grade {g}</option>
                ))}
                <option value="Grade 13">Grade 13 (A/L)</option>
              </select>
            </div>
            <div>
              <label className={label}>Level</label>
              <select className={input} value={form.level} onChange={(e) => set('level', e.target.value)}>
                <option value="">Select</option>
                <option value="O/L">O/L Stream</option>
                <option value="A/L">A/L Stream</option>
              </select>
            </div>
          </div>

          <div>
            <label className={label}>Your School *</label>
            <select className={input} value={form.schoolId} onChange={(e) => set('schoolId', e.target.value)}>
              <option value="">— Select your school —</option>
              {schools.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.district})</option>
              ))}
            </select>
            {schools.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">Your school is not registered yet. Ask your teacher to register first.</p>
            )}
          </div>

          <div>
            <label className={label}>Your Phone Number</label>
            <input className={input} type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+94 7X XXX XXXX" />
          </div>
        </div>
      )}

      {/* ── STEP 2: Competition ── */}
      {step === 2 && (
        <div className="space-y-5">
          <div className="mb-2">
            <h2 className="text-xl font-bold text-slate-800">Choose Your Competition</h2>
            <p className="text-sm text-slate-500 mt-1">Select what you want to enter and give your work a title.</p>
          </div>

          <div>
            <label className={label}>Competition Category *</label>
            <div className="grid grid-cols-1 gap-2">
              {COMPETITION_CATEGORIES.map((cat) => (
                <label
                  key={cat.id}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                    form.categoryId === cat.id
                      ? 'bg-amber-50 border-amber-500 text-amber-800'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-amber-300'
                  }`}
                >
                  <input
                    type="radio" name="category" value={cat.id} checked={form.categoryId === cat.id}
                    onChange={() => set('categoryId', cat.id)} className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    form.categoryId === cat.id ? 'border-amber-600 bg-amber-600' : 'border-slate-300'
                  }`}>
                    {form.categoryId === cat.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <span className="font-semibold text-sm">{cat.label}</span>
                  {cat.stream && (
                    <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${
                      form.categoryId === cat.id ? 'bg-amber-200 text-amber-900' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {cat.stream[0]}
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className={label}>Additional Notes</label>
            <textarea className={`${input} resize-none h-20 text-sm`} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Anything else we should know..." />
          </div>
        </div>
      )}

      {/* ── STEP 3: Confirm ── */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="mb-2">
            <h2 className="text-xl font-bold text-slate-800">Check & Submit</h2>
            <p className="text-sm text-slate-500 mt-1">Please review your details before submitting.</p>
          </div>

          <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
            <ConfirmRow label="Name" value={form.studentName} />
            <ConfirmRow label="Grade" value={`${form.grade}${form.level ? ` · ${form.level}` : ''}`} />
            <ConfirmRow label="School" value={selectedSchool?.name || '—'} />
            {form.phone && <ConfirmRow label="Phone" value={form.phone} />}
            <ConfirmRow label="Competition" value={`${selectedCat?.label || '—'}${selectedCat?.stream ? ` (${selectedCat.stream})` : ''}`} />
          </div>

          <p className="text-xs text-slate-400 leading-relaxed p-3 bg-amber-50 rounded-xl border border-amber-100">
            By submitting, you confirm that this is your own original work and you are currently enrolled in the school shown above.
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className={`flex items-center mt-8 ${step > 1 ? 'justify-between' : 'justify-end'}`}>
        {step > 1 && (
          <button onClick={back} className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors">
            <ChevronLeft size={16} /> Back
          </button>
        )}
        {step < STEPS.length ? (
          <button onClick={next} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-base transition-colors shadow-sm">
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button onClick={submit} className="flex items-center gap-2 px-7 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-base transition-colors border-b-2 border-amber-600">
            <CheckCircle2 size={16} /> Submit Entry
          </button>
        )}
      </div>
    </div>
  );
}

function ConfirmRow({ label: l, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center px-4 py-3 border-b border-slate-200 last:border-0 gap-3">
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide shrink-0">{l}</span>
      <span className="text-sm text-slate-800 font-medium text-right break-all">{value}</span>
    </div>
  );
}
