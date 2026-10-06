'use client';

import React from 'react';
import AdminDashboard from '../admin/AdminDashboard';
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
  return <AdminDashboard adminUser={adminUser} onLogout={onLogout} />;
}
