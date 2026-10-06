'use client';

import React, { useState } from 'react';
import { api } from '../../lib/api';
import { User } from '../../lib/types';
import { ShieldCheck, Truck, Lock, User as UserIcon, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

const DEMO_ADMINS = [
  { username: 'admin1', name: 'K. Rajesh', roleTitle: 'Managing Partner' },
  { username: 'admin2', name: 'S. Kumar', roleTitle: 'Fleet Director' },
  { username: 'admin3', name: 'M. Anitha', roleTitle: 'Finance Controller' },
  { username: 'admin4', name: 'V. Senthil', roleTitle: 'Operations Head' },
  { username: 'admin5', name: 'P. Karthik', roleTitle: 'Audit & Inventory' },
  { username: 'admin6', name: 'D. Ramesh', roleTitle: 'Admin Coordinator' },
];

const DEMO_MANAGERS = [
  { username: 'manager1', name: 'Saravanan', rig: 'Rig 1 (TN-28-AA-1001)' },
  { username: 'manager2', name: 'Murugan', rig: 'Rig 2 (TN-28-AA-1002)' },
  { username: 'manager3', name: 'Selvam', rig: 'Rig 3 (TN-28-AA-1003)' },
  { username: 'manager4', name: 'Ganesan', rig: 'Rig 4 (TN-28-AA-1004)' },
];

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [activeRole, setActiveRole] = useState<'ADMIN' | 'MANAGER'>('ADMIN');
  const [username, setUsername] = useState('admin1');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRoleTabChange = (role: 'ADMIN' | 'MANAGER') => {
    setActiveRole(role);
    setError(null);
    if (role === 'ADMIN') {
      setUsername('admin1');
    } else {
      setUsername('manager1');
    }
    setPassword('password123');
  };

  const handleDemoSelect = (u: string) => {
    setUsername(u);
    setPassword('password123');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please provide username/email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await api.login(username.trim(), password, activeRole);

      if (data.success && data.user) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('borewell_user', JSON.stringify(data.user));
          localStorage.setItem('borewell_token', data.token);
        }
        onLoginSuccess(data.user);
      } else {
        setError(data.message || 'Authentication failed. Please verify credentials.');
      }
    } catch (err: any) {
      setError(
        'Unable to connect to backend server. Ensure backend is running on port 5000.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/70 via-white to-blue-100/40 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Soft Blue Ambient Decorative Lights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[34rem] h-[34rem] bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header Brand */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10 mb-6">
        <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/25 text-3xl font-bold mb-3 text-white border border-blue-400">
          ⛏️
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-950 tracking-tight">
          Borewell Drilling Management
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Fleet oversight, vehicle locking, and daily drilling ledger portal
        </p>
      </div>

      {/* Main Card Container (Pure White & Blue) */}
      <div className="w-full max-w-lg relative z-10">
        <div className="bg-white border border-blue-100 rounded-2xl shadow-xl shadow-blue-900/5 p-6 sm:p-8">
          
          {/* Role Selection Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-blue-50/80 rounded-xl mb-6 border border-blue-200">
            <button
              type="button"
              onClick={() => handleRoleTabChange('ADMIN')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeRole === 'ADMIN'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-bold'
                  : 'text-slate-600 hover:text-blue-700 hover:bg-white/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Portal (6 Users)</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleTabChange('MANAGER')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeRole === 'MANAGER'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-bold'
                  : 'text-slate-600 hover:text-blue-700 hover:bg-white/60'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>Rig Manager (4 Users)</span>
            </button>
          </div>

          {/* Role Description Notice */}
          <div className="mb-6 px-3.5 py-2.5 rounded-xl bg-blue-50 border border-blue-200/80 text-xs text-blue-900 flex items-center gap-2.5">
            {activeRole === 'ADMIN' ? (
              <>
                <span className="text-blue-600 text-base">🛡️</span>
                <span>
                  <strong>Admin Mode:</strong> Global live feed across all rigs, fleet vehicle audit, and manager user management.
                </span>
              </>
            ) : (
              <>
                <span className="text-blue-600 text-base">🔒</span>
                <span>
                  <strong>Manager Mode:</strong> Locked to your assigned rig. Digital replica of physical drilling log chits.
                </span>
              </>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {activeRole === 'ADMIN' ? 'Admin Username or Email' : 'Manager Username or Email'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={activeRole === 'ADMIN' ? 'e.g. admin1' : 'e.g. manager1'}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-blue-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password (default: password123)"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-blue-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In as {activeRole === 'ADMIN' ? 'Admin' : 'Manager'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Switcher Section */}
          <div className="mt-8 pt-6 border-t border-blue-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                ⚡ 1-Click Demo Accounts ({activeRole === 'ADMIN' ? '6 Admins' : '4 Locked Managers'})
              </span>
              <span className="text-[11px] text-blue-600 font-mono font-semibold">Pass: password123</span>
            </div>

            {activeRole === 'ADMIN' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {DEMO_ADMINS.map((demo) => {
                  const isSelected = username === demo.username;
                  return (
                    <button
                      key={demo.username}
                      type="button"
                      onClick={() => handleDemoSelect(demo.username)}
                      className={`text-left p-2 rounded-xl border text-xs transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm font-bold'
                          : 'bg-blue-50/50 border-blue-200/80 text-slate-800 hover:border-blue-400 hover:bg-blue-100/50'
                      }`}
                    >
                      <div className={`font-mono text-[11px] ${isSelected ? 'text-blue-100' : 'text-blue-700'}`}>
                        @{demo.username}
                      </div>
                      <div className="truncate font-semibold">{demo.name}</div>
                      <div className={`text-[10px] truncate ${isSelected ? 'text-blue-200' : 'text-slate-500'}`}>
                        {demo.roleTitle}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {DEMO_MANAGERS.map((demo) => {
                  const isSelected = username === demo.username;
                  return (
                    <button
                      key={demo.username}
                      type="button"
                      onClick={() => handleDemoSelect(demo.username)}
                      className={`text-left p-2.5 rounded-xl border text-xs transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm font-bold'
                          : 'bg-blue-50/50 border-blue-200/80 text-slate-800 hover:border-blue-400 hover:bg-blue-100/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-mono text-[11px] ${isSelected ? 'text-blue-100' : 'text-blue-700'}`}>
                          @{demo.username}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                          isSelected ? 'bg-blue-700 text-white' : 'bg-blue-200 text-blue-900'
                        }`}>
                          Locked
                        </span>
                      </div>
                      <div className="font-semibold mt-0.5">{demo.name}</div>
                      <div className={`text-[11px] font-mono mt-0.5 truncate ${
                        isSelected ? 'text-blue-100' : 'text-blue-700 font-bold'
                      }`}>
                        {demo.rig}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <p className="mt-4 text-center text-xs text-slate-500">
          Borewell Fleet System • Professional White & Blue Design • Mobile & Desktop Responsive
        </p>
      </div>
    </div>
  );
}
