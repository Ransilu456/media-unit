'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMediaStore } from '@/lib/store';
import { MEDIA_UNIT_INFO, PROVINCE_DISTRICTS, SRI_LANKA_PROVINCES } from '@/lib/constants';
import { validateSchoolRegistration } from '@/lib/validation';
import { auth } from '@/lib/firebase';
import { requestDeviceNotificationPermission } from '@/lib/browserNotifications';
import { signOut } from 'firebase/auth';
import { Building2, User, KeyRound, CheckCircle2, AlertCircle, ChevronRight, ChevronLeft, Info, Eye, EyeOff, ShieldCheck, Check, Mail } from 'lucide-react';

const STEPS = [
  { num: 1, label: 'School', icon: Building2 },
  { num: 2, label: 'Contacts', icon: User },
  { num: 3, label: 'Login', icon: KeyRound },
];

const inputCls =
  'w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20 transition-all shadow-xs';
const labelCls = 'block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5';

export function SchoolRegisterForm() {
  const router = useRouter();
  const { registerSchool } = useMediaStore();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<'success' | 'error' | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pushPermission, setPushPermission] = useState<'granted' | 'denied' | 'default' | 'unsupported' | null>(null);
  const [pushSetupLoading, setPushSetupLoading] = useState(false);

  const [form, setForm] = useState({
    schoolName: '',
    province: SRI_LANKA_PROVINCES[0],
    district: PROVINCE_DISTRICTS[SRI_LANKA_PROVINCES[0]]?.[0] || 'Colombo',
    teacherName: '',
    teacherPhone: '',
    presidentName: '',
    presidentPhone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [touched, setTouched] = useState<Partial<Record<keyof typeof form, boolean>>>({});

  const availableDistricts = useMemo(() => {
    return PROVINCE_DISTRICTS[form.province] || [];
  }, [form.province]);
  const passwordRequirements = [
    { label: 'At least 6 characters', met: form.password.length >= 6 },
    { label: 'An uppercase and a lowercase letter', met: /[A-Z]/.test(form.password) && /[a-z]/.test(form.password) },
    { label: 'At least one number', met: /\d/.test(form.password) },
    { label: 'At least one symbol', met: /[^A-Za-z0-9]/.test(form.password) },
  ];
  const passwordStrength = passwordRequirements.filter((requirement) => requirement.met).length;

  const handleEnableApprovalAlerts = async () => {
    setPushSetupLoading(true);
    const permission = await requestDeviceNotificationPermission();
    setPushPermission(permission);
    setPushSetupLoading(false);
    await signOut(auth).catch(() => undefined);
  };

  const handleContinueToSignIn = async () => {
    await signOut(auth).catch(() => undefined);
    router.push('/login');
  };

  const handleProvinceChange = (newProvince: string) => {
    const districts = PROVINCE_DISTRICTS[newProvince] || [];
    setForm((f) => ({
      ...f,
      province: newProvince,
      district: districts[0] || '',
    }));
  };

  const set = (k: keyof typeof form, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setTouched((current) => ({ ...current, [k]: true }));
    setError(null);
  };

  const registrationData = () => ({
    name: form.schoolName.trim(),
    province: form.province,
    district: form.district.trim(),
    teacherInCharge: form.teacherName.trim(),
    teacherPhone: form.teacherPhone.trim(),
    mediaPresident: form.presidentName.trim(),
    presidentPhone: form.presidentPhone.trim(),
    email: form.email.trim(),
    password: form.password,
  });

  const registrationFieldNames: Partial<Record<keyof typeof form, string>> = {
    schoolName: 'name',
    teacherName: 'teacherInCharge',
    presidentName: 'mediaPresident',
  };
  const fieldError = (field: keyof typeof form): string | undefined => {
    if (!touched[field]) return undefined;
    if (field === 'confirmPassword') {
      return form.password !== form.confirmPassword
        ? 'Passwords do not match.'
        : undefined;
    }
    const validationField = registrationFieldNames[field] ?? field;
    return validateSchoolRegistration(registrationData())[validationField];
  };
  const markStepTouched = () => {
    const fieldsByStep: Record<number, (keyof typeof form)[]> = {
      1: ['schoolName', 'province', 'district'],
      2: ['teacherName', 'teacherPhone', 'presidentName', 'presidentPhone'],
      3: ['email', 'password', 'confirmPassword'],
    };
    setTouched((current) => ({
      ...current,
      ...Object.fromEntries((fieldsByStep[step] ?? []).map((field) => [field, true])),
    }));
  };

  const validate = (): boolean => {
    setError(null);
    markStepTouched();
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
      setSubmissionResult('success');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please check your data.');
      setSubmissionResult('error');
    } finally {
      setLoading(false);
    }
  };

  if (submissionResult) {
    const registrationSucceeded = submissionResult === 'success';

    return (
      <div className="w-full max-w-xl mx-auto">
        <section
          aria-live="polite"
          className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8"
          role={registrationSucceeded ? 'status' : 'alert'}
        >
          <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl ${registrationSucceeded ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
            {registrationSucceeded ? <CheckCircle2 size={28} /> : <AlertCircle size={28} />}
          </div>
          <p className={`text-xs font-bold uppercase tracking-wider ${registrationSucceeded ? 'text-emerald-700' : 'text-rose-700'}`}>
            {registrationSucceeded ? 'Registration submitted' : 'Registration not completed'}
          </p>
          <h1 className="mt-2 text-2xl font-extrabold text-slate-900">
            {registrationSucceeded ? 'Your school is awaiting approval' : 'We could not complete registration'}
          </h1>

          {registrationSucceeded ? (
            <>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
                The Agradhi administrator will review your school details, usually within 24 hours.
                You can sign in with your registered email and password after your school is approved.
              </p>
              <p className="mt-4 text-sm text-slate-600">
                If you have not received an update after 24 hours, contact{' '}
                <a className="font-semibold text-slate-900 underline" href={`mailto:${MEDIA_UNIT_INFO.email}`}>
                  {MEDIA_UNIT_INFO.email}
                </a>
                .
              </p>
              <div className="mx-auto mt-6 max-w-md rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-left">
                <h2 className="text-sm font-bold text-slate-900">Get an approval alert</h2>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  Enable a notification on this device so we can let you know when your school is approved, even if this site is closed.
                </p>
                {pushPermission === null ? (
                  <button
                    type="button"
                    onClick={handleEnableApprovalAlerts}
                    disabled={pushSetupLoading}
                    className="mt-3 rounded-lg bg-amber-700 px-4 py-2 text-xs font-bold text-white hover:bg-amber-800 disabled:opacity-60"
                  >
                    {pushSetupLoading ? 'Setting up alerts...' : 'Enable approval alert'}
                  </button>
                ) : (
                  <p className="mt-3 text-xs font-semibold text-emerald-800">Approval alerts are enabled on this device.</p>
                )}
                {pushPermission === 'denied' && (
                  <p className="mt-2 text-xs text-rose-800">Notifications are blocked in your browser settings.</p>
                )}
                {pushPermission === 'default' && (
                  <p className="mt-2 text-xs text-amber-800">Push setup was not completed. You can try again from the school portal after signing in.</p>
                )}
                {pushPermission === 'unsupported' && (
                  <p className="mt-2 text-xs text-slate-600">This browser does not support device notifications.</p>
                )}
              </div>
              <button
                type="button"
                onClick={handleContinueToSignIn}
                className="mt-4 inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800"
              >
                Continue to sign in
              </button>
            </>
          ) : (
            <>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
                Your form details are still here. Review the message below, then retry or sign in if this email is already registered.
              </p>
              <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-left text-sm leading-6 text-rose-900">
                {error}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSubmissionResult(null);
                    setError(null);
                  }}
                  className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800"
                >
                  Review and try again
                </button>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  Go to sign in
                </Link>
              </div>
              <p className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-500">
                <Mail size={14} />
                <a className="underline" href={`mailto:${MEDIA_UNIT_INFO.email}`}>
                  {MEDIA_UNIT_INFO.email}
                </a>
              </p>
            </>
          )}
        </section>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto auth-register-form">
      <div className="text-center mb-8">
        <div className="w-14 h-14 mx-auto mb-3 bg-slate-950 rounded-xl border border-slate-700 p-2 flex items-center justify-center shadow-xs">
          <Image src="/icons/icon-192.png" alt="Agradhi" width={44} height={44} unoptimized className="object-contain" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Register your school</h1>
        <p className="text-xs text-slate-500 mt-1">Three short steps to create a school account.</p>
      </div>

      <div className="flex items-start gap-3 p-3.5 mb-6 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs">
        <Info size={16} className="shrink-0 mt-0.5 text-amber-700" />
        <div className="leading-relaxed">
          <strong>Are you a student?</strong> Ask your teacher to register the school and submit your entry. Students do not need their own account.{' '}
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
                maxLength={120}
                value={form.schoolName}
                onChange={(e) => set('schoolName', e.target.value)}
                onBlur={() => setTouched((current) => ({ ...current, schoolName: true }))}
                aria-invalid={Boolean(fieldError('schoolName'))}
                placeholder="e.g. Saranath College"
                className={inputCls}
              />
              {fieldError('schoolName') && <p className="mt-1 text-xs text-red-700">{fieldError('schoolName')}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Province *</label>
                <select
                  value={form.province}
                  onChange={(e) => {
                    handleProvinceChange(e.target.value);
                    setTouched((current) => ({ ...current, province: true, district: true }));
                  }}
                  aria-invalid={Boolean(fieldError('province'))}
                  className={inputCls}
                >
                  {SRI_LANKA_PROVINCES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                {fieldError('province') && <p className="mt-1 text-xs text-red-700">{fieldError('province')}</p>}
              </div>

              <div>
                <label className={labelCls}>District *</label>
                <select
                  value={form.district}
                  onChange={(e) => set('district', e.target.value)}
                  aria-invalid={Boolean(fieldError('district'))}
                  className={inputCls}
                >
                  {availableDistricts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                {fieldError('district') && <p className="mt-1 text-xs text-red-700">{fieldError('district')}</p>}
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
                maxLength={100}
                value={form.teacherName}
                onChange={(e) => set('teacherName', e.target.value)}
                onBlur={() => setTouched((current) => ({ ...current, teacherName: true }))}
                aria-invalid={Boolean(fieldError('teacherName'))}
                placeholder="e.g. Mrs. Chandrika Jayawardena"
                className={inputCls}
              />
              {fieldError('teacherName') && <p className="mt-1 text-xs text-red-700">{fieldError('teacherName')}</p>}
            </div>

            <div>
              <label className={labelCls}>Teacher Contact Phone *</label>
              <input
                type="tel"
                required
                inputMode="numeric"
                maxLength={20}
                pattern="[0-9]{10}"
                value={form.teacherPhone}
                onChange={(e) => set('teacherPhone', e.target.value)}
                onBlur={() => setTouched((current) => ({ ...current, teacherPhone: true }))}
                aria-invalid={Boolean(fieldError('teacherPhone'))}
                placeholder="0771234567"
                className={inputCls}
              />
              {fieldError('teacherPhone') && <p className="mt-1 text-xs text-red-700">{fieldError('teacherPhone')}</p>}
            </div>

            <div className="pt-2 border-t border-slate-100">
              <label className={labelCls}>Media Club President </label>
              <input
                type="text"
                required
                maxLength={100}
                value={form.presidentName}
                onChange={(e) => set('presidentName', e.target.value)}
                onBlur={() => setTouched((current) => ({ ...current, presidentName: true }))}
                aria-invalid={Boolean(fieldError('presidentName'))}
                placeholder="e.g. Senura Perera"
                className={inputCls}
              />
              {fieldError('presidentName') && <p className="mt-1 text-xs text-red-700">{fieldError('presidentName')}</p>}
            </div>

            <div>
              <label className={labelCls}>President Contact Phone </label>
              <input
                type="tel"
                required
                inputMode="numeric"
                maxLength={20}
                pattern="[0-9]{10}"
                value={form.presidentPhone}
                onChange={(e) => set('presidentPhone', e.target.value)}
                onBlur={() => setTouched((current) => ({ ...current, presidentPhone: true }))}
                aria-invalid={Boolean(fieldError('presidentPhone'))}
                placeholder="0719876543"
                className={inputCls}
              />
              {fieldError('presidentPhone') && <p className="mt-1 text-xs text-red-700">{fieldError('presidentPhone')}</p>}
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
                maxLength={254}
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                onBlur={() => setTouched((current) => ({ ...current, email: true }))}
                aria-invalid={Boolean(fieldError('email'))}
                placeholder="e.g. media@yourschool.sch.lk"
                className={inputCls}
              />
              {fieldError('email') && <p className="mt-1 text-xs text-red-700">{fieldError('email')}</p>}
              <p className="mt-1 text-[11px] text-slate-400">Use an email address the school can be contacted at. The Agradhi administrator will review your registration before activation.</p>
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
                minLength={6}
                maxLength={128}
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                onBlur={() => setTouched((current) => ({ ...current, password: true }))}
                aria-invalid={Boolean(fieldError('password'))}
                placeholder="At least 6 characters"
                className={inputCls}
              />
              {fieldError('password') && <p className="mt-1 text-xs text-red-700">{fieldError('password')}</p>}
              <div className="mt-2" aria-live="polite">
                <div className="flex gap-1" aria-label={`Password strength ${passwordStrength} of 4`}>
                  {passwordRequirements.map((requirement, index) => (
                    <span
                      key={requirement.label}
                      className={`h-1.5 flex-1 rounded-full ${index < passwordStrength ? 'bg-emerald-500' : 'bg-slate-200'}`}
                    />
                  ))}
                </div>
                <ul className="mt-2 grid grid-cols-1 gap-1 text-[11px] text-slate-500 sm:grid-cols-2">
                  {passwordRequirements.map((requirement) => (
                    <li key={requirement.label} className={`flex items-center gap-1.5 ${requirement.met ? 'text-emerald-700' : ''}`}>
                      <Check size={12} className={requirement.met ? '' : 'text-slate-300'} />
                      {requirement.label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <label className={labelCls}>Confirm Password *</label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                maxLength={128}
                value={form.confirmPassword}
                onChange={(e) => set('confirmPassword', e.target.value)}
                onBlur={() => setTouched((current) => ({ ...current, confirmPassword: true }))}
                aria-invalid={Boolean(fieldError('confirmPassword'))}
                placeholder="Re-enter your password"
                className={inputCls}
              />
              {fieldError('confirmPassword') && <p className="mt-1 text-xs text-red-700">{fieldError('confirmPassword')}</p>}
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
              disabled={loading}
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
