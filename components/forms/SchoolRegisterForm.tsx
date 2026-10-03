'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMediaStore } from '@/lib/store';
import { SRI_LANKA_PROVINCES } from '@/lib/constants';
import { Building2, User, CheckCircle2, AlertCircle } from 'lucide-react';

export function SchoolRegisterForm() {
  const router = useRouter();
  const { registerSchool } = useMediaStore();

  const [formData, setFormData] = useState({
    name: '',
    registrationNumber: '',
    province: SRI_LANKA_PROVINCES[0],
    district: 'Colombo',
    teacherInCharge: '',
    teacherPhone: '',
    mediaPresident: '',
    presidentPhone: '',
    email: '',
    password: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('Please provide the official school name.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please provide a valid official email address.');
      return;
    }
    if (!formData.teacherInCharge.trim() || !formData.teacherPhone.trim()) {
      setError('Teacher-in-Charge details are required for institutional verification.');
      return;
    }
    if (!formData.password || formData.password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    try {
      registerSchool({
        name: formData.name.trim(),
        registrationNumber: formData.registrationNumber.trim() || `SCH-${Date.now().toString(36).toUpperCase()}`,
        province: formData.province,
        district: formData.district.trim(),
        teacherInCharge: formData.teacherInCharge.trim(),
        teacherPhone: formData.teacherPhone.trim(),
        mediaPresident: formData.mediaPresident.trim(),
        presidentPhone: formData.presidentPhone.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1200);
    } catch (err: any) {
      setError(err?.message || 'Failed to complete registration.');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-xl">
      {/* Header with Agradhi Logo */}
      <div className="text-center mb-8">
        <div className="relative w-16 h-16 mx-auto mb-3 bg-slate-900 rounded-full border-2 border-amber-500 p-1 flex items-center justify-center shadow-md">
          <Image
            src="/Agradhi.png"
            alt="Agradhi Media Unit"
            width={52}
            height={52}
            className="object-contain"
          />
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
          Outer School Delegation Registration
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-md mx-auto font-light">
          Register your school media circle for the 2026 Inter-School Competitions. Official credentials will grant access to the submission portal.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 mb-6 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 p-4 mb-6 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>Registration successful! Launching your School Dashboard...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* School Information */}
        <div className="space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-wider text-amber-700 font-semibold border-b border-slate-100 pb-2 flex items-center gap-2">
            <Building2 size={14} /> School Credentials
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Official School Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Nalanda College, Colombo or St. Anthony's College"
                className="w-full px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Province *
              </label>
              <select
                value={formData.province}
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-amber-500 focus:bg-white"
              >
                {SRI_LANKA_PROVINCES.map((prov) => (
                  <option key={prov} value={prov}>
                    {prov}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                District / Town *
              </label>
              <input
                type="text"
                required
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                placeholder="e.g. Colombo, Kandy, Galle"
                className="w-full px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-amber-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                School Registration No. (Optional)
              </label>
              <input
                type="text"
                value={formData.registrationNumber}
                onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                placeholder="e.g. NCMC/2026/019"
                className="w-full px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-amber-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Portal Access Password *
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Create secret password"
                className="w-full px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-amber-500 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Teacher-in-Charge */}
        <div className="space-y-4 pt-2">
          <h3 className="text-xs font-mono uppercase tracking-wider text-amber-700 font-semibold border-b border-slate-100 pb-2 flex items-center gap-2">
            <User size={14} /> Teacher-in-Charge (Verification)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Teacher-in-Charge Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.teacherInCharge}
                onChange={(e) => setFormData({ ...formData, teacherInCharge: e.target.value })}
                placeholder="e.g. Mr. K. A. Jayasekara"
                className="w-full px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-amber-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Teacher Contact Mobile *
              </label>
              <input
                type="tel"
                required
                value={formData.teacherPhone}
                onChange={(e) => setFormData({ ...formData, teacherPhone: e.target.value })}
                placeholder="+94 7X XXX XXXX"
                className="w-full px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-amber-500 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Student Media President */}
        <div className="space-y-4 pt-2">
          <h3 className="text-xs font-mono uppercase tracking-wider text-amber-700 font-semibold border-b border-slate-100 pb-2 flex items-center gap-2">
            <User size={14} /> School Media Unit President / Coordinator
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                President / Secretary Name *
              </label>
              <input
                type="text"
                required
                value={formData.mediaPresident}
                onChange={(e) => setFormData({ ...formData, mediaPresident: e.target.value })}
                placeholder="e.g. Kasun Samarasinghe"
                className="w-full px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-amber-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Student President Contact Mobile *
              </label>
              <input
                type="tel"
                required
                value={formData.presidentPhone}
                onChange={(e) => setFormData({ ...formData, presidentPhone: e.target.value })}
                placeholder="+94 7X XXX XXXX"
                className="w-full px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-amber-500 focus:bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Official Media Unit Email (Login Username) *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="media@yourschool.sch.lk or president.media@gmail.com"
                className="w-full px-4 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-amber-500 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            className="w-full py-3.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs sm:text-sm tracking-wide shadow-md shadow-amber-900/20 transition-all"
          >
            Submit Official Registration & Enter Portal
          </button>
        </div>
      </form>
    </div>
  );
}
