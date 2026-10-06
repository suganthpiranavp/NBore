'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '../components/LoadingSpinner';
import LoginPage from './(auth)/login/page';
import { User } from '../lib/types';

export default function RootPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    // Safety timeout: Never allow root to hang for > 1s
    const safetyTimer = setTimeout(() => {
      if (isMounted && isInitializing) {
        setIsInitializing(false);
      }
    }, 1000);

    try {
      if (typeof window !== 'undefined') {
        const savedUserStr = localStorage.getItem('borewell_user');
        if (savedUserStr) {
          const parsedUser: User = JSON.parse(savedUserStr);
          if (parsedUser && parsedUser.id && parsedUser.role) {
            if (isMounted) {
              setCurrentUser(parsedUser);
              if (parsedUser.role === 'ADMIN') {
                router.replace('/admin/dashboard');
                return;
              } else {
                router.replace('/manager/entry');
                return;
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn('Session parse error:', e);
    } finally {
      if (isMounted) {
        clearTimeout(safetyTimer);
        setIsInitializing(false);
      }
    }

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
    };
  }, [router, isInitializing]);

  if (isInitializing) {
    return (
      <LoadingSpinner
        label="Nithya Borewells Fleet Portal"
        sublabel="Authorizing session and loading fleet telemetry..."
      />
    );
  }

  // Not logged in -> Render login page
  return <LoginPage />;
}
