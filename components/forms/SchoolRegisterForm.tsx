'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMediaStore } from '@/lib/store';
import { SRI_LANKA_PROVINCES } from '@/lib/constants';
import { validateSchoolRegistration } from '@/lib/validation';
import {
  Building2,
  User,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Info,
  Eye,
  EyeOff,
  ShieldCheck,
  Check,
} from 'lucide-react';

const PROVINCE_DISTRICTS: Record<string, string[]> = {
  'Western Province': ['Colombo', 'Gampaha', 'Kalutara'],
  'Central Province': ['Kandy', 'Matale', 'Nuwara Eliya'],
  'Southern Province': ['Galle', 'Matara', 'Hambantota'],
  'Northern Province': ['Jaffna', 'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu'],
  'Eastern Province': ['Batticaloa', 'Ampara', 'Trincomalee'],
  'North Western Province': ['Kurunegala', 'Puttalam'],
  'North Central Province': ['Anuradhapura', 'Polonnaruwa'],
  'Uva Province': ['Badulla', 'Monaragala'],
  'Sabaragamuwa Province': ['Ratnapura', 'Kegalle'],
};

const STEPS = [
  { num: 1, label: 'School Details', icon: Building2 },
  { num: 2, label: 'Teacher in Charge', icon: User },
  { num: 3, label: 'Portal Security', icon: KeyRound },
];

const inputCls =
  'w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20 transition-all shadow-xs';
const labelCls = 'block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5';

export function SchoolRegisterForm() {
  const router = useRouter();
  const { registerSchool } = useMediaStore();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    schoolName: '',
    province: SRI_LANKA_PROVINCES[0],
    district: PROVINCE_DISTRICTS[SRI_LANKA_PROVINCES[0]]?.[0] || 'Colombo',
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

  const availableDistricts = useMemo(() => {
    return PROVINCE_DISTRICTS[form.province] || [];
  }, [form.province]);

  const handleProvinceChange = (newProvince: string) => {
    const districts = PROVINCE_DISTRICTS[newProvince] || [];
    setForm((f) => ({
      ...f,
      province: newProvince,
      district: districts[0] || '',
    }));
  };

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
      const err = registrationErrors.name || registrationErrors.district || registrationErrors.province;
      if (err) {
        setError(err);
        return false;
      }
    }
    if (step === 2) {
      const err = registrationErrors.teacherInCharge || registrationErrors.teacherPhone || registrationErrors.mediaPresident || registrationErrors.presidentPhone;
      if (err) {
        setError(err);
        return false;
      }
    }
    if (step === 3) {
      const err = registrationErrors.email || registrationErrors.password;
      if (err) {
        setError(err);
        return false;
      }
      if (form.password !== form.confirmPassword) {
        setError('Passwords do not match. Please re-enter.');
        return false;
      }
    }
    return true;
  };

  const next = () => {
    if (validate()) setStep((s) => Math.min(s + 1, STEPS.length));
  };
  const back = () => {
    setError(null);
    setStep((s) => Math.max(s - 1, 1));
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await registerSchool(registrationData());
      setSuccess(true);
      setTimeout(() => router.replace('/dashboard'), 1400);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please check your data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-14 h-14 mx-auto mb-3 bg-slate-950 rounded-xl border border-slate-700 p-2 flex items-center justify-center shadow-xs">
          <Image src="/Agradhi.png" alt="Agradhi" width={44} height={44} className="object-contain" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Register Your School</h1>
        <p className="text-xs text-slate-500 mt-1">Official Delegation Portal · Agradhi Media Assembly 2026</p>
      </div>

      <div className="flex items-start gap-3 p-3.5 mb-6 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs">
        <Info size={16} className="shrink-0 mt-0.5 text-amber-700" />
        <div className="leading-relaxed">
          <strong>Are you a student competitor?</strong> Students do not register accounts directly. Your teacher-in-charge or school media club registers the school once, then submits all student entries.{' '}
          <Link href="/competitions" className="underline font-bold hover:text-amber-950">
            Browse open competition tracks →
          </Link>
        </div>
      </div>

      <div className="flex items-center justify-between mb-8 px-4">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const done = step > s.num;
          const active = step === s.num;
          return (
            <React.Fragment key={s.num}>
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all font-bold text-xs ${
                    done
                      ? 'bg-amber-600 border-amber-600 text-white'
                      : active
                      ? 'bg-white border-amber-600 text-amber-700 font-bold'
                      : 'bg-white border-slate-200 text-slate-400'
                  }`}
                >
                  {done ? <Check size={16} /> : <Icon size={16} />}
                </div>
                <span
                  className={`text-[11px] font-bold uppercase tracking-wider ${
                    active ? 'text-amber-800' : done ? 'text-slate-600' : 'text-slate-400'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-3 transition-colors ${
                    step > s.num ? 'bg-amber-600' : 'bg-slate-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Main Card */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 sm:p-8">
        {error && (
          <div className="flex items-start gap-2.5 p-3.5 mb-5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs animate-in fade-in-50">
            <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2.5 p-4 mb-5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold animate-in fade-in-50">
            <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
            <span>School registered successfully! Taking you to your dashboard...</span>
          </div>
        )}

        {/* School Information */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-base font-bold text-slate-900">1. School Information</h2>
              <p className="text-xs text-slate-500">Enter the official recognized name and location of the school.</p>
            </div>

            <div>
              <label className={labelCls}>School Official Name *</label>
              <input
                type="text"
                required
                value={form.schoolName}
                onChange={(e) => set('schoolName', e.target.value)}
                placeholder="e.g. Saranath College"
                className={inputCls}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Province *</label>
                <select
                  value={form.province}
                  onChange={(e) => handleProvinceChange(e.target.value)}
                  className={inputCls}
                >
                  {SRI_LANKA_PROVINCES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>District *</label>
                <select
                  value={form.district}
                  onChange={(e) => set('district', e.target.value)}
                  className={inputCls}
                >
                  {availableDistricts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Teacher & President Information */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-base font-bold text-slate-900">2. Teacher-in-Charge & Media Unit</h2>
              <p className="text-xs text-slate-500">Contact details for communications, verification, and awards.</p>
            </div>

            <div>
              <label className={labelCls}>Teacher-in-Charge Full Name *</label>
              <input
                type="text"
                required
                value={form.teacherName}
                onChange={(e) => set('teacherName', e.target.value)}
                placeholder="e.g. Mrs. Chandrika Jayawardena"
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Teacher Contact Phone *</label>
              <input
                type="tel"
                required
                value={form.teacherPhone}
                onChange={(e) => set('teacherPhone', e.target.value)}
                placeholder="e.g. 077 123 4567"
                className={inputCls}
              />
            </div>

            <div className="pt-2 border-t border-slate-100">
              <label className={labelCls}>Media Club President </label>
              <input
                type="text"
                required
                value={form.presidentName}
                onChange={(e) => set('presidentName', e.target.value)}
                placeholder="e.g. Senura Perera"
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>President Contact Phone </label>
              <input
                type="tel"
                required
                value={form.presidentPhone}
                onChange={(e) => set('presidentPhone', e.target.value)}
                placeholder="e.g. 071 987 6543"
                className={inputCls}
              />
            </div>
          </div>
        )}

        {/* Portal Login Credentials */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-base font-bold text-slate-900">3. Portal Login Credentials</h2>
              <p className="text-xs text-slate-500">These credentials will be used to log into the school dashboard.</p>
            </div>

            <div>
              <label className={labelCls}>Official School Contact Email *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="e.g. media@yourschool.sch.lk"
                className={inputCls}
              />
              <p className="mt-1 text-[11px] text-slate-400">All submissions updates and certificates will be sent here.</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={labelCls.replace('mb-1.5', '')}>Create Portal Password *</label>
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
                >
                  {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                  <span>{showPassword ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={12}
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                placeholder="12 or more characters"
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Confirm Password *</label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={12}
                value={form.confirmPassword}
                onChange={(e) => set('confirmPassword', e.target.value)}
                placeholder="Re-enter your password"
                className={inputCls}
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
              Upon registration, a unique <strong>Agradhi Delegation Badge Code</strong> (e.g. AMU-SCL-022) will be generated for your school.
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 pt-6 mt-6 border-t border-slate-100">
          {step > 1 ? (
            <button
              type="button"
              onClick={back}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft size={16} /> Back
            </button>
          ) : (
            <Link
              href="/login"
              className="text-xs font-semibold text-slate-500 hover:text-amber-700 transition-colors"
            >
              Already registered? Sign in →
            </Link>
          )}

          {step < STEPS.length ? (
            <button
              type="button"
              onClick={next}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-sm"
            >
              Next Step <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              disabled={loading || success}
              onClick={submit}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors shadow-xs disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  Complete Registration
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
