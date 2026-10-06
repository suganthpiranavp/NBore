'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageContainer from '../../../components/layout/PageContainer';
import Table, { Column } from '../../../components/common/Table';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';
import Modal from '../../../components/common/Modal';
import Input from '../../../components/common/Input';
import ManagerAssignmentModal from '../../../components/dashboards/ManagerAssignmentModal';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { UserInterface } from '../../../models/User';
import { VehicleInterface } from '../../../models/Vehicle';
import { User } from '../../../lib/types';
import { Truck, UserPlus, Lock, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminManagersPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [managers, setManagers] = useState<UserInterface[]>([]);
  const [vehicles, setVehicles] = useState<VehicleInterface[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [assigningManager, setAssigningManager] = useState<UserInterface | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    username: '',
    name: '',
    phone: '',
    email: '',
    assigned_vehicle_id: '',
  });
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const fetchData = async () => {
    try {
      const [mgrRes, vehRes] = await Promise.all([
        fetch('/api/users?role=MANAGER').then((r) => r.json()),
        fetch('/api/vehicles').then((r) => r.json()),
      ]);

      if (mgrRes.success) setManagers(mgrRes.data || []);
      if (vehRes.success) setVehicles(vehRes.data || []);
    } catch (err) {
      console.error('Error fetching managers/vehicles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('borewell_user');
      if (!stored) {
        router.replace('/login');
        return;
      }
      try {
        const u = JSON.parse(stored);
        if (u.role !== 'ADMIN') {
          router.replace('/manager/entry');
          return;
        }
        setCurrentUser(u);
      } catch (e) {
        router.replace('/login');
        return;
      }
    }

    fetchData();
  }, [router]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('borewell_user');
      localStorage.removeItem('borewell_token');
    }
    router.push('/login');
  };

  const handleCreateManager = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setCreateError(null);

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: createForm.username,
          name: createForm.name,
          phone: createForm.phone,
          email: createForm.email,
          assigned_vehicle_id: createForm.assigned_vehicle_id
            ? Number(createForm.assigned_vehicle_id)
            : null,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setIsCreateOpen(false);
        setCreateForm({
          username: '',
          name: '',
          phone: '',
          email: '',
          assigned_vehicle_id: '',
        });
        fetchData();
      } else {
        setCreateError(json.message || 'Failed to create manager.');
      }
    } catch (err: any) {
      setCreateError(err.message || 'Error creating manager.');
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner label="Loading Manager Management..." sublabel="Loading fleet permissions..." />;
  }

  const columns: Column<UserInterface>[] = [
    {
      key: 'name',
      header: 'Manager Name',
      render: (row) => (
        <div>
          <span className="font-extrabold text-slate-900 block">{row.name}</span>
          <span className="text-[10px] text-slate-400 font-mono">@{row.username}</span>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Contact Info',
      render: (row) => (
        <div className="text-[11px]">
          <div className="text-slate-800">{row.phone}</div>
          <div className="text-slate-400 text-[10px]">{row.email}</div>
        </div>
      ),
    },
    {
      key: 'vehicle_number',
      header: 'Assigned Rig Lock',
      render: (row) => {
        if (!row.assigned_vehicle_id) {
          return <Badge variant="warning" size="sm">Reserve (Unassigned)</Badge>;
        }
        return (
          <div className="flex items-center gap-1.5">
            <Badge variant="blue" size="sm">
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3 text-blue-700" />
                {row.vehicle_number}
              </span>
            </Badge>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Access State',
      render: (row) => (
        <Badge variant={row.is_active ? 'success' : 'neutral'} size="sm">
          {row.is_active ? 'Active' : 'Disabled'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      align: 'right',
      render: (row) => (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setAssigningManager(row)}
          icon={<Lock className="w-3.5 h-3.5" />}
        >
          Assign / Reassign
        </Button>
      ),
    },
  ];

  return (
    <PageContainer
      user={currentUser}
      onLogout={handleLogout}
      title="Manager Accounts & Rig Lock"
      subtitle="Enforce 1:1 vehicle isolation across the 4 fleet managers"
      role="ADMIN"
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            icon={<UserPlus className="w-3.5 h-3.5" />}
          >
            Add New Manager
          </Button>
        </div>
      }
    >
      {/* Fleet Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {vehicles.map((v) => (
          <div
            key={v.id}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-900">{v.vehicle_number}</span>
                {v.sensor_enabled && (
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    IoT
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-500 block mt-0.5">{v.rig_name}</span>
              <div className="mt-2 text-[11px] font-bold text-blue-700">
                Locked Manager: {v.manager_name || 'Unassigned'}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Truck className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Managers Table */}
      <div className="space-y-3">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-700">
          Manager Registry & Rig Locks (Total 4 Accounts)
        </h3>
        <Table
          columns={columns}
          data={managers}
          keyExtractor={(row) => row.id}
          emptyMessage="No managers found."
        />
      </div>

      {/* Modal: Assign Vehicle */}
      <ManagerAssignmentModal
        isOpen={Boolean(assigningManager)}
        onClose={() => setAssigningManager(null)}
        manager={assigningManager}
        vehicles={vehicles}
        onAssignmentSuccess={() => {
          fetchData();
        }}
      />

      {/* Modal: Create Manager */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add New Fleet Manager"
        subtitle="Create credentials and optionally lock to an active bore rig"
        maxWidth="md"
      >
        <form onSubmit={handleCreateManager} className="space-y-4">
          {createError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{createError}</span>
            </div>
          )}

          <Input
            label="Full Name"
            value={createForm.name}
            onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
            placeholder="e.g. Ramesh Driller"
            required
          />

          <Input
            label="Username (Login Identifier)"
            value={createForm.username}
            onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
            placeholder="e.g. manager5"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Phone Number"
              value={createForm.phone}
              onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
              placeholder="9842100015"
              required
            />
            <Input
              label="Email Address"
              type="email"
              value={createForm.email}
              onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
              placeholder="ramesh@borewell.com"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase">
              Assign to Bore Vehicle (Lock)
            </label>
            <select
              value={createForm.assigned_vehicle_id}
              onChange={(e) => setCreateForm({ ...createForm, assigned_vehicle_id: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">No Vehicle (Reserve / Floating)</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.vehicle_number} ({v.rig_name})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={isCreating}
              icon={<CheckCircle2 className="w-3.5 h-3.5" />}
            >
              Create Account
            </Button>
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
}
