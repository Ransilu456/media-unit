'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMediaStore } from '@/lib/store';
import { SRI_LANKA_PROVINCES } from '@/lib/constants';
import { validateSchoolRegistration } from '@/lib/validation';
import { Building2, User, KeyRound, CheckCircle2, AlertCircle, ChevronRight, ChevronLeft, Info } from 'lucide-react';

const STEPS = [
  { num: 1, label: 'School', icon: Building2 },
  { num: 2, label: 'Teacher', icon: User },
  { num: 3, label: 'Account', icon: KeyRound },
];

const input = 'w-full px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-colors';
const label = 'block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5';

export function SchoolRegisterForm() {
  const router = useRouter();
  const { registerSchool } = useMediaStore();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    schoolName: '',
    province: SRI_LANKA_PROVINCES[0],
    district: '',
    registrationNumber: '',
    teacherName: '',
    teacherPhone: '',
    teacherAddress: '',
    presidentName: '',
    presidentPhone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const registrationData = () => ({
    name: form.schoolName.trim(),
    registrationNumber: form.registrationNumber.trim(),
    province: form.province,
    district: form.district.trim(),
    teacherInCharge: form.teacherName.trim(),
    teacherPhone: form.teacherPhone.trim(),
    mediaPresident: form.presidentName.trim(),
    presidentPhone: form.presidentPhone.trim(),
    email: form.email.trim(),
    password: form.password,
  });

  const validate = (): boolean => {
    setError(null);
    const registrationErrors = validateSchoolRegistration(registrationData());
    if (step === 1) {
      const error = registrationErrors.name || registrationErrors.district || registrationErrors.province;
      if (error) { setError(error); return false; }
    }
    if (step === 2) {
      const error = registrationErrors.teacherInCharge
        || registrationErrors.teacherPhone
        || registrationErrors.mediaPresident
        || registrationErrors.presidentPhone;
      if (error) { setError(error); return false; }
    }
    if (step === 3) {
      const error = registrationErrors.email || registrationErrors.password;
      if (error) { setError(error); return false; }
      if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return false; }
    }
    return true;
  };

  const next = () => { if (validate()) setStep((s) => Math.min(s + 1, STEPS.length)); };
  const back = () => { setError(null); setStep((s) => Math.max(s - 1, 1)); };

  const submit = async () => {
    if (!validate()) return;
    try {
      await registerSchool(registrationData());
      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Header */}
      <div className="text-center mb-7">
        <div className="w-14 h-14 mx-auto mb-3 bg-slate-900 rounded-full border-2 border-amber-500 p-1 flex items-center justify-center shadow">
          <Image src="/Agradhi.png" alt="Agradhi" width={44} height={44} className="object-contain" />
        </div>
        <h1 className="text-xl font-serif font-bold text-slate-900">Register Your School</h1>
        <p className="text-xs text-slate-500 mt-1">Agradhi Media Competitions 2026</p>
      </div>

      {/* Student notice */}
      <div className="flex items-start gap-2.5 p-3 mb-5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs">
        <Info size={14} className="shrink-0 mt-0.5" />
        <span>
          <strong>Are you a student?</strong> You don&apos;t need to register here.{' '}
          <Link href="/apply" className="underline font-semibold hover:text-blue-900">View competition entry process →</Link>
        </span>
      </div>

      {/* Step indicators */}
      <div className="flex items-center justify-between mb-7 px-4">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const done = step > s.num;
          const active = step === s.num;
          return (
            <React.Fragment key={s.num}>
              <div className="flex flex-col items-center gap-1">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all text-sm ${
                  done ? 'bg-amber-600 border-amber-600 text-white' :
                  active ? 'bg-white border-amber-600 text-amber-600' :
                  'bg-white border-slate-200 text-slate-400'
                }`}>
                  {done ? <CheckCircle2 size={15} /> : <Icon size={15} />}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wide ${active ? 'text-amber-700' : done ? 'text-slate-500' : 'text-slate-300'}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-2 ${step > s.num ? 'bg-amber-500' : 'bg-slate-200'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-7">

        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
            <AlertCircle size={13} className="shrink-0" /> {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
            <CheckCircle2 size={13} className="shrink-0" /> Registration successful! Taking you to your dashboard...
          </div>
        )}

        {/* ── STEP 1: School Info ── */}
        {step === 1 && (
          <div className="space-y-4">
            <StepHeader title="School Information" desc="Enter the official name and location of your school." />
            <div>
              <label className={label}>School Name *</label>
              <input className={input} required minLength={2} maxLength={120} value={form.schoolName} onChange={(e) => set('schoolName', e.target.value)} placeholder="e.g. Nalanda College, Colombo" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={label}>Province *</label>
                <select className={input} required value={form.province} onChange={(e) => set('province', e.target.value)}>
                  {SRI_LANKA_PROVINCES.map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className={label}>District / Town *</label>
                <input className={input} required minLength={2} maxLength={100} value={form.district} onChange={(e) => set('district', e.target.value)} placeholder="e.g. Colombo" />
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: Teacher Info ── */}
        {step === 2 && (
          <div className="space-y-4">
            <StepHeader title="Teacher-in-Charge" desc="The teacher who manages this school's media delegation. They will receive all official communication." />
            <div>
              <label className={label}>Full Name *</label>
              <input className={input} required minLength={2} maxLength={100} value={form.teacherName} onChange={(e) => set('teacherName', e.target.value)} placeholder="e.g. Mr. K. A. Jayasekara" />
            </div>
            <div>
              <label className={label}>Contact Mobile *</label>
              <input className={input} type="tel" required maxLength={20} value={form.teacherPhone} onChange={(e) => set('teacherPhone', e.target.value)} placeholder="+94 7X XXX XXXX" />
            </div>
            <div>
              <label className={label}>School Address</label>
              <textarea className={`${input} resize-none h-16`} value={form.teacherAddress} onChange={(e) => set('teacherAddress', e.target.value)} placeholder="School mailing address" />
            </div>
            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Student Media President</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={label}>President Name</label>
                  <input className={input} maxLength={100} value={form.presidentName} onChange={(e) => set('presidentName', e.target.value)} placeholder="e.g. Kasun Perera" />
                </div>
                <div>
                  <label className={label}>President Mobile</label>
                  <input className={input} type="tel" maxLength={20} value={form.presidentPhone} onChange={(e) => set('presidentPhone', e.target.value)} placeholder="+94 7X XXX XXXX" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3: Account ── */}
        {step === 3 && (
          <div className="space-y-4">
            <StepHeader title="Portal Login Account" desc="Create your school's login credentials for the teacher dashboard." />
            <div>
              <label className={label}>Official Email *</label>
              <input className={input} type="email" required maxLength={254} value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="media@yourschool.lk" />
            </div>
            <div>
              <label className={label}>Password *</label>
              <input className={input} type="password" minLength={12} value={form.password} onChange={(e) => set('password', e.target.value)} placeholder="Min. 12 characters" />
            </div>
            <div>
              <label className={label}>Confirm Password *</label>
              <input className={input} type="password" minLength={12} value={form.confirmPassword} onChange={(e) => set('confirmPassword', e.target.value)} placeholder="Repeat password" />
            </div>
            <p className="text-xs text-slate-400 bg-slate-50 rounded-xl p-3 border border-slate-100">
              After registration, you can log in and <strong className="text-slate-600">add your students&apos; competition entries</strong> from your dashboard.
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className={`flex items-center mt-6 pt-5 border-t border-slate-100 ${step > 1 ? 'justify-between' : 'justify-end'}`}>
          {step > 1 && (
            <button onClick={back} className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">
              <ChevronLeft size={14} /> Back
            </button>
          )}
          {step < STEPS.length ? (
            <button onClick={next} className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold transition-colors">
              Continue <ChevronRight size={14} />
            </button>
          ) : (
            <button onClick={submit} className="flex items-center gap-1.5 px-6 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors border-b-2 border-amber-600">
              <CheckCircle2 size={14} /> Complete Registration
            </button>
          )}
        </div>
      </div>

      <p className="text-center text-xs text-slate-400 mt-5">
        Already registered?{' '}
        <Link href="/login" className="text-amber-700 font-semibold hover:underline">Sign in to your portal →</Link>
      </p>
    </div>
  );
}

function StepHeader({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-base font-bold text-slate-800">{title}</h2>
      <p className="text-xs text-slate-500 mt-1 font-light">{desc}</p>
    </div>
  );
}
