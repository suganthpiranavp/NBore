'use client';

import React from 'react';
import { User } from '../lib/types';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  title?: string;
}

export default function Navbar({
  user,
  onLogout,
  title = 'Borewell Fleet Portal',
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-blue-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <span className="text-xl">⛏️</span>
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>{title}</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                v2.0
              </span>
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block">
              Daily Drilling Management & Fleet Telemetry
            </p>
          </div>
        </div>

        {/* User Badge & Logout */}
        <div className="flex items-center gap-3">
          {user && (
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-slate-800">{user.name}</span>
              <span className="text-[11px] font-medium text-blue-600 uppercase tracking-wider">
                {user.role} {user.assigned_vehicle_id ? `• Rig #${user.assigned_vehicle_id}` : ''}
              </span>
            </div>
          )}

          <button
            id="nav-logout-btn"
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition"
            title="Log out of system"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
