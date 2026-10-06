'use client';

import React, { useState, useEffect } from 'react';
import LoginPage from '../components/auth/LoginPage';
import AdminDashboard from '../components/admin/AdminDashboard';
import ManagerDashboard from '../components/manager/ManagerDashboard';

export default function Page() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Check local storage for persistent session
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('borewell_user');
      if (savedUser) {
        try {
          setCurrentUser(JSON.parse(savedUser));
        } catch (e) {
          localStorage.removeItem('borewell_user');
        }
      }
      setIsInitializing(false);
    }
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('borewell_user');
      localStorage.removeItem('borewell_token');
    }
    setCurrentUser(null);
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

  // Not logged in -> Show Unified Role-Based Login
  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Role: ADMIN -> Show Admin Dashboard
  if (currentUser.role === 'ADMIN') {
    return <AdminDashboard adminUser={currentUser} onLogout={handleLogout} />;
  }

  // Role: MANAGER -> Show Manager Dashboard
  return <ManagerDashboard managerUser={currentUser} onLogout={handleLogout} />;
}
