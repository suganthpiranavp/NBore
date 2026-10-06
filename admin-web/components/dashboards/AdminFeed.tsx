'use client';

import React, { useState, useEffect } from 'react';
import PageContainer from '../layout/PageContainer';
import AdminFeedTable from './AdminFeedTable';
import LoadingSpinner from '../LoadingSpinner';
import { DailyEntryInterface } from '../../models/DailyEntry';
import { User } from '../../lib/types';

interface AdminFeedProps {
  adminUser: User;
  onLogout: () => void;
}

/**
 * /components/dashboards/AdminFeed.tsx
 * Admin Feed & Fleet Overview Component (White & Blue Theme)
 */
export default function AdminFeed({ adminUser, onLogout }: AdminFeedProps) {
  const [entries, setEntries] = useState<DailyEntryInterface[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEntries = async () => {
    try {
      const res = await fetch('/api/entries');
      const json = await res.json();
      if (json.success) {
        setEntries(json.data || []);
      }
    } catch (err) {
      console.error('Error fetching entries:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  if (isLoading) {
    return <LoadingSpinner label="Loading Global Live Feed..." sublabel="Connecting to fleet rigs..." />;
  }

  return (
    <PageContainer
      user={adminUser}
      onLogout={onLogout}
      title="Global Fleet Feed & Operations"
      subtitle="Real-time centralized entry stream across all 3 active bore rigs"
      role="ADMIN"
    >
      <AdminFeedTable entries={entries} onRefresh={fetchEntries} />
    </PageContainer>
  );
}
