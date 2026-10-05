'use client';

import React, { useState, useEffect } from 'react';
import AdminLogin from '../components/AdminLogin';
import AdminDashboard from '../components/AdminDashboard';

export default function Page() {
  const [adminUser, setAdminUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Check local storage for persistent session
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('borewell_admin_user');
      if (savedUser) {
        try {
          setAdminUser(JSON.parse(savedUser));
        } catch (e) {
          localStorage.removeItem('borewell_admin_user');
        }
      }
      setIsInitializing(false);
    }
  }, []);

  const handleLoginSuccess = (user) => {
    setAdminUser(user);
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('borewell_admin_user');
      localStorage.removeItem('borewell_admin_token');
    }
    setAdminUser(null);
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex items-center gap-3">
          <span className="animate-spin text-2xl">⚙️</span>
          <span className="text-sm font-mono text-slate-400">Loading Borewell Fleet Portal...</span>
        </div>
      </div>
    );
  }

  if (!adminUser) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  return <AdminDashboard adminUser={adminUser} onLogout={handleLogout} />;
}
