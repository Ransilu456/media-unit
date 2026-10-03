'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMediaStore } from '@/lib/store';
import { School, ShieldCheck, Mail, Lock, AlertCircle, Zap } from 'lucide-react';

interface LoginFormProps {
  initialTab?: 'school' | 'admin';
  onSuccess?: () => void;
}

export function LoginForm({ initialTab = 'school', onSuccess }: LoginFormProps) {
  const router = useRouter();
  const { loginSchool, loginAdmin, schools, setSession } = useMediaStore();

  const [activeTab, setActiveTab] = useState<'school' | 'admin'>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSchoolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const loggedSchool = loginSchool(email.trim(), password);
    if (loggedSchool) {
      if (onSuccess) onSuccess();
      router.push('/dashboard');
    } else {
      setError('Invalid school email or password. Please verify or use the quick demo school options below.');
    }
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const ok = loginAdmin(email.trim(), password);
    if (ok) {
      if (onSuccess) onSuccess();
      router.push('/admin');
    } else {
      setError('Invalid admin credentials. Use admin@saranath.lk / admin123 or click the Demo Admin button.');
    }
  };

  const handleDemoSchoolLogin = (schoolEmail: string) => {
    const school = schools.find((s) => s.email === schoolEmail);
    if (school) {
      setSession({ type: 'school', school });
      if (onSuccess) onSuccess();
      router.push('/dashboard');
    }
  };

  const handleDemoAdminLogin = () => {
    loginAdmin('admin@saranath.lk', 'admin123');
    if (onSuccess) onSuccess();
    router.push('/admin');
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 rounded-3xl bg-white border border-slate-200 shadow-xl">
      {/* Brand Logo */}
      <div className="text-center mb-6">
        <div className="relative w-16 h-16 mx-auto mb-3 bg-slate-900 rounded-full border-2 border-amber-500 p-1 flex items-center justify-center shadow-md">
          <Image
            src="/Agradhi.png"
            alt="Agradhi Media Unit"
            width={52}
            height={52}
            className="object-contain"
          />
        </div>
        <h2 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">
          Agradhi Portal Sign In
        </h2>
        <p className="text-xs text-slate-500 mt-1 font-light">
          Access your school delegation or admin dashboard
        </p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 border border-slate-200 mb-6">
        <button
          onClick={() => {
            setActiveTab('school');
            setError(null);
          }}
          className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'school'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <School size={14} />
          <span>School Delegation</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('admin');
            setError(null);
          }}
          className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'admin'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck size={14} />
          <span>Executive Admin</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 mb-6 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
          <AlertCircle size={15} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {activeTab === 'school' ? (
        <form onSubmit={handleSchoolSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              School Media Unit Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. media@ananda.sch.lk"
                className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-amber-500 focus:bg-white"
              />
              <Mail size={16} className="absolute left-3 top-3 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Access Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-amber-500 focus:bg-white"
              />
              <Lock size={16} className="absolute left-3 top-3 text-slate-400" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-sm"
          >
            Enter School Dashboard
          </button>

          {/* Quick Demo Switcher */}
          <div className="pt-5 border-t border-slate-100">
            <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-2.5 flex items-center gap-1">
              <Zap size={13} className="text-amber-600" /> 1-Click Demo Login:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {schools.slice(0, 4).map((s) => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => handleDemoSchoolLogin(s.email)}
                  className="p-2 rounded-lg bg-slate-50 border border-slate-200 hover:border-amber-400 text-left text-xs transition-colors"
                >
                  <p className="font-semibold text-slate-900 truncate">{s.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{s.district}</p>
                </button>
              ))}
            </div>
          </div>
        </form>
      ) : (
        <form onSubmit={handleAdminSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Admin Username or Email
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@saranath.lk"
                className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-slate-700 focus:bg-white"
              />
              <Mail size={16} className="absolute left-3 top-3 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Admin Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="admin123"
                className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-slate-700 focus:bg-white"
              />
              <Lock size={16} className="absolute left-3 top-3 text-slate-400" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm transition-all shadow-sm"
          >
            Access Executive Panel
          </button>

          <div className="pt-5 border-t border-slate-100">
            <button
              type="button"
              onClick={handleDemoAdminLogin}
              className="w-full py-2.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-400 text-xs font-semibold text-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              <Zap size={14} className="text-amber-600" />
              <span>1-Click Executive Admin Demo Access</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
