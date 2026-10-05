'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMediaStore } from '@/lib/store';
import { GraduationCap, ShieldCheck, Mail, Lock, AlertCircle, Info } from 'lucide-react';

interface LoginFormProps {
  initialTab?: 'school' | 'admin';
}

export function LoginForm({ initialTab = 'school' }: LoginFormProps) {
  const router = useRouter();
  const { loginSchool, loginAdmin } = useMediaStore();
  const [activeTab, setActiveTab] = useState<'school' | 'admin'>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSchoolSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const school = await loginSchool(email.trim(), password);
      if (school) {
        router.push('/dashboard');
      } else {
        setError('Email or password is incorrect. Please check and try again.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const ok = await loginAdmin(email.trim(), password);
      if (ok) {
        router.push('/admin');
      } else {
        setError('Invalid admin credentials.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Logo */}
      <div className="text-center mb-7">
        <div className="w-14 h-14 mx-auto mb-3 bg-slate-900 rounded-full border-2 border-amber-500 p-1 flex items-center justify-center shadow">
          <Image src="/Agradhi.png" alt="Agradhi" width={44} height={44} className="object-contain" />
        </div>
        <h1 className="text-xl font-serif font-bold text-slate-900">Staff Portal Login</h1>
        <p className="text-xs text-slate-500 mt-1">For School Teachers & Agradhi Executive Staff only</p>
      </div>

      {/* Student notice */}
      <div className="flex items-start gap-2.5 p-3 mb-5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs">
        <Info size={14} className="shrink-0 mt-0.5" />
        <span>
          <strong>Are you a student?</strong> Ask your teacher-in-charge to submit your entry using the school account.{' '}
          <Link href="/apply" className="underline font-semibold hover:text-blue-900">
            View open competitions →
          </Link>
        </span>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-100 mb-5">
        <button
          onClick={() => { setActiveTab('school'); setError(null); }}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'school' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <GraduationCap size={13} /> School Teacher
        </button>
        <button
          onClick={() => { setActiveTab('admin'); setError(null); }}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'admin' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <ShieldCheck size={13} /> Admin Board
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
          <AlertCircle size={13} className="shrink-0" />
          {error}
        </div>
      )}

      {/* School form */}
      {activeTab === 'school' ? (
        <form onSubmit={handleSchoolSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">School Email</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="media@school.lk"
                className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
              />
            </div>
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm transition-all disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign In to School Portal'}
          </button>


        </form>
      ) : (
        <form onSubmit={handleAdminSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Admin Email</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="Configured admin email"
                className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-slate-600 focus:bg-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-slate-600 focus:bg-white"
              />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-all disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Access Admin Console'}
          </button>
        </form>
      )}

      <p className="text-center text-xs text-slate-400 mt-6">
        New school?{' '}
        <Link href="/register" className="text-amber-700 font-semibold hover:underline">
          Register your school →
        </Link>
      </p>
    </div>
  );
}
