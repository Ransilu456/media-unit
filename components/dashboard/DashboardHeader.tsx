'use client';

import React from 'react';
import Image from 'next/image';
import { Search, Mic, Video, Bell, Layers, FileText, Trophy, School, BarChart3 } from 'lucide-react';

interface DashboardHeaderProps {
  activeTab: string;
  onTabChange: (tab: any) => void;
  tabs: { id: string; label: string; icon: any }[];
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  userBadge?: string;
}

export function DashboardHeader({
  activeTab,
  onTabChange,
  tabs,
  searchQuery = '',
  onSearchChange,
  userBadge = 'A',
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800/80 mb-8">
      {/* Tab Navigation Pill Bar */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#090d1a] border border-slate-800 overflow-x-auto w-full md:w-auto scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-white' : 'text-slate-400'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Top Search & Actions */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-end">
        {/* Search Bar with Mic */}
        <div className="relative flex-1 md:w-64">
          <Search size={14} className="absolute left-3.5 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            placeholder="Search portal, categories, schools..."
            className="w-full pl-9 pr-9 py-2 rounded-xl bg-[#0e1428] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <Mic size={14} className="absolute right-3.5 top-2.5 text-slate-500 hover:text-cyan-400 cursor-pointer transition-colors" />
        </div>

        {/* Video Meet / Conference Icon */}
        <button
          title="Video Conference & Live Sessions"
          className="p-2.5 rounded-xl bg-[#0e1428] border border-slate-800 text-slate-400 hover:text-cyan-300 hover:border-slate-700 transition-colors"
        >
          <Video size={16} />
        </button>

        {/* Notification Bell */}
        <button
          title="Notifications"
          className="relative p-2.5 rounded-xl bg-[#0e1428] border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
        >
          <Bell size={16} />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        </button>

        {/* User Logo Avatar */}
        <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-blue-500/40 p-[1px] bg-gradient-to-br from-blue-500 to-purple-600 shrink-0">
          <div className="w-full h-full rounded-[10px] bg-[#0c1328] flex items-center justify-center">
            <Image
              src="/Agradhi.png"
              alt="Agradhi Media Unit"
              width={34}
              height={34}
              className="object-cover rounded-[9px]"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
