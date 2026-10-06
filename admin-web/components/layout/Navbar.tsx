'use client';

import React from 'react';
import { LogOut, ShieldCheck, Truck } from 'lucide-react';
import { User } from '../../lib/types';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  title?: string;
}

export default function Navbar({
  user,
  onLogout,
  title = 'Nithya Borewells Fleet Portal',
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-blue-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 font-black text-xl">
            ⛏️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                Nithya Borewells
              </span>
              <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                v2.4 Fleet
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Centralized Drilling Operations & Telemetry Platform
            </p>
          </div>
        </div>

        {/* User Badge & Actions */}
        <div className="flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                {user.role === 'ADMIN' ? (
                  <ShieldCheck className="w-4 h-4 text-blue-700" />
                ) : (
                  <Truck className="w-4 h-4 text-blue-700" />
                )}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900 leading-tight">
                  {user.name}
                </span>
                <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">
                  {user.role} {user.vehicle_number ? `• ${user.vehicle_number}` : ''}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={onLogout}
            id="nav-logout-action"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition duration-150"
            title="Sign out of portal"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
