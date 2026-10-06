'use client';

import React from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  items: Array<{
    id: string;
    label: string;
    icon: string;
    badge?: number | string;
  }>;
}

export default function Sidebar({ activeTab, setActiveTab, items }: SidebarProps) {
  return (
    <aside className="w-full md:w-64 bg-white border-r border-blue-100 flex flex-col p-4 shrink-0 shadow-sm">
      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-3">
        Navigation
      </div>
      <nav className="space-y-1">
        {items.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    isActive
                      ? 'bg-blue-800 text-blue-100'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
