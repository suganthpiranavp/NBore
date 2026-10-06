'use client';

import React from 'react';
import ManagerDashboard from '../manager/ManagerDashboard';
import { User } from '../../lib/types';

interface ManagerViewProps {
  managerUser: User;
  onLogout: () => void;
}

/**
 * /components/dashboards/ManagerView.tsx
 * Dedicated Manager Dashboard with Vehicle Lock & Digital Chit Form (White & Blue Theme)
 */
export default function ManagerView({ managerUser, onLogout }: ManagerViewProps) {
  return <ManagerDashboard managerUser={managerUser} onLogout={onLogout} />;
}
