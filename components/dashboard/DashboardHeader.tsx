'use client';

import React from 'react';
import { Search } from 'lucide-react';

interface DashboardHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: { id: string; label: string; icon: React.ElementType }[];
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
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-5 border-b border-slate-200 mb-6">
      <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <Icon size={15} className={isActive ? 'text-white' : 'text-slate-500'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto justify-end">
        {onSearchChange && <div className="relative flex-1 md:w-64">
          <Search size={14} className="absolute left-3.5 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            placeholder="Search..."
            className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 transition-colors"
          />
        </div>}

        <div className="w-9 h-9 rounded-lg border border-slate-200 bg-slate-100 text-slate-700 shrink-0 flex items-center justify-center text-sm font-semibold">
          {userBadge.slice(0, 1).toUpperCase()}
        </div>
      </div>
    </div>
  );
}
