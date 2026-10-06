'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginPage from '../components/auth/LoginPage';
import AdminDashboard from '../components/dashboards/AdminFeed';
import ManagerDashboard from '../components/dashboards/ManagerView';
import LoadingSpinner from '../components/LoadingSpinner';
import { User } from '../lib/types';

/**
 * ==============================================================================
 * Root App Page (/app/page.tsx)
 * Resolves the infinite loading bug with:
 * 1. Immediate client-side hydration guard
 * 2. 1000ms safety timeout fallback (never hangs indefinitely)
 * 3. Session recovery try/catch with console telemetry
 * 4. User-friendly error fallback screen with retry button
 * 5. Strict White and Blue design theme
 * ==============================================================================
 */

export default function RootPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    console.log('[Portal Init] 🚀 Initializing Borewell Fleet Portal session...');
    let isMounted = true;

    // Safety timeout: Never allow the app to hang on the loading spinner for more than 1.2 seconds
    const safetyTimer = setTimeout(() => {
      if (isMounted && isInitializing) {
        console.warn('[Portal Init] ⏱️ Safety timeout reached (1200ms). Forcing initialization completion.');
        setIsInitializing(false);
      }
    }, 1200);

    const checkSession = async () => {
      try {
        if (typeof window === 'undefined') {
          console.log('[Portal Init] SSR rendering context; waiting for client hydration.');
          return;
        }

        console.log('[Portal Init] Inspecting local storage for active authentication tokens...');
        const savedUserStr = localStorage.getItem('borewell_user');

        if (savedUserStr) {
          try {
            const parsedUser: User = JSON.parse(savedUserStr);
            if (parsedUser && parsedUser.id && parsedUser.role) {
              console.log(`[Portal Init] ✅ Restored active session for user: ${parsedUser.username} (${parsedUser.role})`);
              if (isMounted) setCurrentUser(parsedUser);
            } else {
              console.warn('[Portal Init] ⚠️ Invalid session payload format found. Clearing storage.');
              localStorage.removeItem('borewell_user');
            }
          } catch (parseError: any) {
            console.error('[Portal Init] ❌ Failed to parse stored user JSON:', parseError.message);
            localStorage.removeItem('borewell_user');
          }
        } else {
          console.log('[Portal Init] ℹ️ No stored session found. Defaulting to login state.');
        }
      } catch (err: any) {
        console.error('[Portal Init] ❌ Unexpected error during session initialization:', err);
        if (isMounted) {
          setInitError(err?.message || 'Unexpected initialization failure');
        }
      } finally {
        if (isMounted) {
          clearTimeout(safetyTimer);
          setIsInitializing(false);
          console.log('[Portal Init] ✨ Initialization phase completed successfully.');
        }
      }
    };

    checkSession();

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
    };
  }, []);

  const handleLoginSuccess = (user: User) => {
    console.log(`[Portal Auth] Login successful for: ${user.username} (${user.role})`);
    setCurrentUser(user);
    if (typeof window !== 'undefined') {
      localStorage.setItem('borewell_user', JSON.stringify(user));
    }
  };

  const handleLogout = () => {
    console.log('[Portal Auth] Logging out user and clearing local state...');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('borewell_user');
      localStorage.removeItem('borewell_token');
    }
    setCurrentUser(null);
  };

  const handleRetry = () => {
    console.log('[Portal] Retrying session initialization...');
    setInitError(null);
    setIsInitializing(true);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('borewell_user');
    }
    setTimeout(() => setIsInitializing(false), 500);
  };

  // 1. Loading State (White & Blue themed, guaranteed not to hang)
  if (isInitializing) {
    return (
      <LoadingSpinner
        label="⚙️ Loading Borewell Fleet Portal..."
        sublabel="Connecting to database, verifying session, and mounting fleet telemetry..."
      />
    );
  }

  // 2. Error Fallback State (if database or backend initialization threw an unhandled exception)
  if (initError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white border border-rose-200 rounded-2xl p-8 shadow-xl max-w-md w-full text-center space-y-4">
          <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold border border-rose-100">
            ⚠️
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Initialization Issue</h2>
            <p className="text-xs text-rose-600 mt-1 font-mono bg-rose-50 p-2 rounded-lg border border-rose-200">
              {initError}
            </p>
            <p className="text-xs text-slate-500 mt-2">
              The portal encountered an error while resolving the user session or database state.
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleRetry}
              className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition"
            >
              Retry
            </button>
            <button
              onClick={() => {
                setInitError(null);
                setCurrentUser(null);
              }}
              className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-500/20 transition"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Not Logged In -> Show Unified Role-Based Login Screen
  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // 4. Role: ADMIN -> Show Admin Dashboard
  if (currentUser.role === 'ADMIN') {
    return <AdminDashboard adminUser={currentUser} onLogout={handleLogout} />;
  }

  // 5. Role: MANAGER -> Show Manager Dashboard with Vehicle Lock & Digital Chit Form
  return <ManagerDashboard managerUser={currentUser} onLogout={handleLogout} />;
}
