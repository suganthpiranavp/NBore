'use client';

import React from 'react';
import ManagerEntryForm from '../forms/ManagerEntryForm';
import PageContainer from '../layout/PageContainer';
import { User } from '../../lib/types';

interface ManagerViewProps {
  managerUser: User;
  onLogout: () => void;
}

/**
 * /components/dashboards/ManagerView.tsx
 * Dedicated Manager Dashboard with Vehicle Lock & 22-Field Digital Chit Form
 */
export default function ManagerView({ managerUser, onLogout }: ManagerViewProps) {
  return (
    <PageContainer
      user={managerUser}
      onLogout={onLogout}
      title="Daily Drilling Log Chit"
      subtitle="Digital log entry pre-configured for your assigned bore vehicle"
      role="MANAGER"
    >
      <ManagerEntryForm managerUser={managerUser} />
    </PageContainer>
  );
}
