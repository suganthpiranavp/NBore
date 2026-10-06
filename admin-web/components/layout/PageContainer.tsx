'use client';

import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { User } from '../../lib/types';

interface PageContainerProps {
  user: User | null;
  onLogout: () => void;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  role?: 'ADMIN' | 'MANAGER';
}

export default function PageContainer({
  user,
  onLogout,
  title,
  subtitle,
  actions,
  children,
  role = 'ADMIN',
}: PageContainerProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar user={user} onLogout={onLogout} />

      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar role={role} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {(title || actions) && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                {title && <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{title}</h1>}
                {subtitle && <p className="text-xs sm:text-sm text-slate-500 mt-1">{subtitle}</p>}
              </div>
              {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  );
}
