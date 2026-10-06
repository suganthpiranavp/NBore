'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageContainer from '../../../components/layout/PageContainer';
import ManagerEntryForm from '../../../components/forms/ManagerEntryForm';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { User } from '../../../lib/types';
import { AlertCircle, Lock, Truck } from 'lucide-react';

export default function ManagerEntryPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('borewell_user');
      if (!stored) {
        router.replace('/login');
        return;
      }
      try {
        const u = JSON.parse(stored);
        if (u.role !== 'MANAGER' && u.role !== 'ADMIN') {
          router.replace('/login');
          return;
        }
        setCurrentUser(u);
      } catch (e) {
        router.replace('/login');
        return;
      } finally {
        setIsLoading(false);
      }
    }
  }, [router]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('borewell_user');
      localStorage.removeItem('borewell_token');
    }
    router.push('/login');
  };

  if (isLoading) {
    return (
      <LoadingSpinner
        label="Loading Vehicle Rig Portal..."
        sublabel="Locking vehicle credentials and pricing slabs..."
      />
    );
  }

  if (!currentUser) return null;

  return (
    <PageContainer
      user={currentUser}
      onLogout={handleLogout}
      title="Daily Drilling Log Chit"
      subtitle="Digital log entry pre-configured for your assigned bore vehicle"
      role="MANAGER"
    >
      {/* Check if vehicle is assigned */}
      {!currentUser.assigned_vehicle_id && currentUser.role === 'MANAGER' ? (
        <div className="p-8 bg-amber-50 border border-amber-200 rounded-3xl text-center max-w-lg mx-auto space-y-4">
          <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-amber-900">No Bore Vehicle Assigned</h3>
            <p className="text-xs text-amber-700 mt-1">
              Your manager profile is currently set as Floating / Reserve. Please contact an Administrator to assign you to one of the 3 active fleet rigs (NBW 6656, SNBW 4748, or NBW 4656).
            </p>
          </div>
        </div>
      ) : (
        <ManagerEntryForm managerUser={currentUser} />
      )}
    </PageContainer>
  );
}
