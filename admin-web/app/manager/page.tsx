'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ManagerView from '../../components/dashboards/ManagerView';
import LoadingSpinner from '../../components/LoadingSpinner';
import { User } from '../../lib/types';

export default function ManagerPage() {
  const router = useRouter();
  const [managerUser, setManagerUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    console.log('[Manager Route] Checking manager authorization state...');
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('borewell_user');
        if (!stored) {
          console.warn('[Manager Route] No session found. Redirecting to /login');
          router.replace('/login');
          return;
        }

        const user: User = JSON.parse(stored);
        if (user.role !== 'MANAGER' && user.role !== 'ADMIN') {
          console.warn('[Manager Route] Invalid role detected. Redirecting to /login');
          router.replace('/login');
          return;
        }

        setManagerUser(user);
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error('[Manager Route] Failed to parse auth session:', err);
      setErrorMessage('Failed to read your session credentials.');
      setIsLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    console.log('[Manager Route] Logging out...');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('borewell_user');
      localStorage.removeItem('borewell_token');
    }
    router.push('/login');
  };

  if (isLoading) {
    return (
      <LoadingSpinner
        label="Loading Manager Portal..."
        sublabel="Verifying vehicle assignment and permissions..."
      />
    );
  }

  if (errorMessage || !managerUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white border border-rose-200 rounded-2xl p-8 shadow-xl max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
            ⚠️
          </div>
          <h2 className="text-lg font-bold text-slate-900">Access Restricted</h2>
          <p className="text-sm text-slate-600">
            {errorMessage || 'You must be logged in as a Vehicle Manager to view this portal.'}
          </p>
          <button
            onClick={() => router.push('/login')}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return <ManagerView managerUser={managerUser} onLogout={handleLogout} />;
}
