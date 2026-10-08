'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMediaStore } from '@/lib/store';
import { useAuth } from '@/contexts/AuthContext';
import { isFirebaseConnectionError } from '@/lib/firestoreErrors';
import {
  GraduationCap,
  ShieldCheck,
  Mail,
  Lock,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  Clock,
  ShieldX,
} from 'lucide-react';

interface LoginFormProps {
  initialTab?: 'school' | 'admin';
}

export function LoginForm({ initialTab = 'school' }: LoginFormProps) {
  const router = useRouter();
  const { loginSchool, loginAdmin } = useMediaStore();
  const { rateLimited, cooldownRemaining, recordFailedAttempt, recordSuccess } =
    useAuth();

  const [activeTab, setActiveTab] = useState<'school' | 'admin'>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Format mm:ss countdown
  const formatCooldown = (secs: number): string => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rateLimited) return;
    setError(null);
    setLoading(true);

    try {
      if (activeTab === 'school') {
        const school = await loginSchool(email.trim(), password);
        if (school) {
          await recordSuccess('school');
          router.replace('/dashboard');
        } else {
          const isNowLimited = recordFailedAttempt();
          if (!isNowLimited) {
            setError('Invalid school email or password. Please verify and retry.');
          }
        }
      } else {
        const ok = await loginAdmin(email.trim(), password);
        if (ok) {
          await recordSuccess('admin');
          router.replace('/admin');
        } else {
          const isNowLimited = recordFailedAttempt();
          if (!isNowLimited) {
            setError('Invalid admin credentials.');
          }
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed. Please check credentials.';
      const isAccountStatusMessage = /awaiting approval|account is suspended|account is banned/i.test(message);
      const isConnectionFailure = isFirebaseConnectionError(err);
      const isNowLimited = isAccountStatusMessage || isConnectionFailure ? false : recordFailedAttempt();
      if (!isNowLimited) {
        setError(isConnectionFailure
          ? 'Unable to connect right now. Check your internet connection and retry.'
          : message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto auth-form-wrapper">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 mx-auto mb-3 bg-slate-950 rounded-xl border border-slate-700 p-2 flex items-center justify-center shadow-xs auth-form-logo">
          <Image src="/Agradhi.png" alt="Agradhi" width={44} height={44} className="object-contain" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {activeTab === 'school' ? 'Welcome back' : 'Welcome back'}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {activeTab === 'school' ? 'Sign in to your school portal' : 'Sign in to the admin dashboard'}
        </p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 gap-1.5 p-1.5 rounded-2xl bg-slate-100 border border-slate-200 mb-6">
        <button
          type="button"
          onClick={() => { setActiveTab('school'); setError(null); }}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'school'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <GraduationCap size={15} />
          <span>School account</span>
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('admin'); setError(null); }}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'admin'
              ? 'bg-slate-950 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <ShieldCheck size={15} />
          <span>Admin account</span>
        </button>
      </div>

      {/* Card */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 sm:p-8 auth-form-card">

        {/* ── Rate-limit banner ── */}
        {rateLimited && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-center">
            <div className="flex items-center justify-center gap-2 text-red-700 font-bold text-sm mb-1">
              <ShieldX size={18} />
              <span>Too Many Failed Attempts</span>
            </div>
            <p className="text-xs text-red-600 leading-relaxed mb-3">
              For your account&apos;s security, sign-in has been temporarily disabled. Please wait before trying again.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-100 border border-red-200">
              <Clock size={14} className="text-red-600" />
              <span className="text-red-800 font-mono font-bold text-sm tabular-nums">
                {formatCooldown(cooldownRemaining)}
              </span>
              <span className="text-red-600 text-xs">remaining</span>
            </div>
            <p className="text-[11px] text-red-500 mt-3">
              If you&apos;ve forgotten your credentials, please contact your Agradhi coordinator.
            </p>
          </div>
        )}

        {/* ── Error banner ── */}
        {!rateLimited && error && (
          <div className="flex items-start gap-2.5 p-3.5 mb-5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs">
            <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form noValidate onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              {activeTab === 'school' ? 'Email address' : 'Admin email'}
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="login-email"
                type="email"
                required
                disabled={rateLimited}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={activeTab === 'school' ? 'teacher@school.sch.lk' : 'admin@agradhi.lk'}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1"
              >
                {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                <span>{showPassword ? 'Hide' : 'Show'}</span>
              </button>
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                disabled={rateLimited}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <button
            type="submit"
            id="login-submit"
            disabled={loading || rateLimited}
            className={`w-full py-3 rounded-xl text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              activeTab === 'school'
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-slate-950 hover:bg-slate-800'
            }`}
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </>
            ) : rateLimited ? (
              <>
                <Clock size={14} />
                Sign-in Temporarily Disabled
              </>
            ) : (
              <>
                <span>Sign in to {activeTab === 'school' ? 'School Dashboard' : 'Admin Panel'}</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>


        {/* Register link */}
        {activeTab === 'school' && (
          <div className="mt-4 text-center">
            <Link
              href="/register"
              className="text-xs font-semibold text-slate-600 hover:text-amber-700 transition-colors"
            >
              Don&apos;t have a school account yet? <strong>Register now →</strong>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
