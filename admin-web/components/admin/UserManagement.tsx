'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { User, Vehicle } from '../../lib/types';
import { api } from '../../lib/api';
import {
  UserPlus,
  Lock,
  Truck,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Edit2,
  Shield,
  X,
} from 'lucide-react';

interface UserManagementProps {
  vehicles: Vehicle[];
  onRefreshVehicles: () => void;
}

export default function UserManagement({ vehicles, onRefreshVehicles }: UserManagementProps) {
  const [managers, setManagers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Add Manager Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newManager, setNewManager] = useState({
    name: '',
    username: '',
    phone: '',
    email: '',
    password: 'password123',
    assigned_vehicle_id: '' as string | number,
  });
  const [addLoading, setAddLoading] = useState(false);

  // Edit/Reassign Vehicle Modal State
  const [editingManager, setEditingManager] = useState<User | null>(null);
  const [editVehicleId, setEditVehicleId] = useState<string>('');
  const [editLoading, setEditLoading] = useState(false);

  const fetchManagers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getManagers();
      if (res.success) {
        setManagers(res.data || []);
      } else {
        setError('Failed to fetch managers list');
      }
    } catch (err) {
      setError('Connection error loading manager users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchManagers();
  }, [fetchManagers]);

  const handleCreateManager = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newManager.name.trim() || !newManager.username.trim()) {
      setError('Please provide manager name and username.');
      return;
    }

    setAddLoading(true);
    setError(null);
    try {
      const res = await api.createManager({
        name: newManager.name.trim(),
        username: newManager.username.trim(),
        phone: newManager.phone.trim(),
        email: newManager.email.trim(),
        password: newManager.password || 'password123',
        assigned_vehicle_id: newManager.assigned_vehicle_id
          ? parseInt(String(newManager.assigned_vehicle_id), 10)
          : null,
      });

      if (res.success) {
        setSuccessMessage(`Manager ${newManager.name} created successfully and assigned!`);
        setShowAddModal(false);
        setNewManager({
          name: '',
          username: '',
          phone: '',
          email: '',
          password: 'password123',
          assigned_vehicle_id: '',
        });
        fetchManagers();
        onRefreshVehicles();
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        setError(res.message || 'Error creating manager');
      }
    } catch (err: any) {
      setError('Network failure creating manager');
    } finally {
      setAddLoading(false);
    }
  };

  const handleAssignVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingManager) return;

    setEditLoading(true);
    setError(null);
    try {
      const vehicleId = editVehicleId ? parseInt(editVehicleId, 10) : null;
      const res = await api.assignVehicle(editingManager.id, vehicleId);

      if (res.success) {
        setSuccessMessage(
          `Vehicle assignment updated! Manager ${editingManager.name} is now locked to Rig #${vehicleId || 'Unassigned'}.`
        );
        setEditingManager(null);
        fetchManagers();
        onRefreshVehicles();
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        setError(res.message || 'Failed to update vehicle lock');
      }
    } catch (err: any) {
      setError('Network failure assigning vehicle');
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Action Bar (WHITE & BLUE) */}
      <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-extrabold text-blue-950 flex items-center gap-2">
            <span>👥</span> Rig Manager Directory & Vehicle Locks
          </h3>
          <p className="text-xs text-slate-500">
            Admins have exclusive permission to register managers and lock each manager to 1 drilling rig
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchManagers}
            className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition"
            title="Refresh Manager Directory"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-600/20 text-xs sm:text-sm transition flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add New Manager</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-xs underline font-bold">Dismiss</button>
        </div>
      )}

      {/* Managers Table (WHITE & BLUE) */}
      <div className="bg-white border border-blue-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-blue-100 flex items-center justify-between bg-blue-50/40">
          <span className="text-xs font-bold text-blue-950 uppercase tracking-wider">
            Registered Field Managers ({managers.length})
          </span>
          <span className="text-xs text-blue-700 font-mono font-semibold">
            Security Rule: 1 Manager = 1 Locked Rig
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-blue-50/70 text-blue-900 uppercase text-[11px] tracking-wider border-b border-blue-200 font-bold">
              <tr>
                <th className="py-3 px-4">Manager Name & Login</th>
                <th className="py-3 px-4">Locked Assigned Rig</th>
                <th className="py-3 px-4">Phone / Contact</th>
                <th className="py-3 px-4 text-center">Submissions</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Vehicle Lock Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-100">
              {loading && managers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                    <span>Loading manager profiles...</span>
                  </td>
                </tr>
              ) : managers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500">
                    No managers found. Click "+ Add New Manager" to create one.
                  </td>
                </tr>
              ) : (
                managers.map((mgr) => {
                  const assignedVehicle = vehicles.find((v) => v.id === mgr.assigned_vehicle_id);
                  return (
                    <tr key={mgr.id} className="hover:bg-blue-50/40 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">{mgr.name}</div>
                        <div className="text-xs text-slate-500 font-mono">
                          @{mgr.username} • {mgr.email}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {assignedVehicle ? (
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 font-mono font-bold text-xs">
                              {assignedVehicle.vehicle_number}
                            </span>
                            <span className="text-xs text-slate-500 hidden md:inline">
                              ({assignedVehicle.rig_name.split(' ')[0]})
                            </span>
                          </div>
                        ) : (
                          <span className="px-2 py-1 rounded bg-slate-100 text-slate-500 text-xs italic">
                            Unassigned
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-600 font-mono text-xs">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{mgr.phone || 'No phone'}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900">
                        {mgr.total_submissions || 0}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingManager(mgr);
                            setEditVehicleId(mgr.assigned_vehicle_id ? String(mgr.assigned_vehicle_id) : '');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 border border-blue-200 text-xs font-semibold transition inline-flex items-center gap-1.5 shadow-sm"
                        >
                          <Lock className="w-3 h-3 text-blue-600" />
                          <span>Assign / Lock Rig</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD NEW MANAGER (WHITE & BLUE) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-blue-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-4 bg-blue-50 border-b border-blue-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                <h4 className="text-base font-extrabold text-blue-950">Add New Rig Manager</h4>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManager} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Manager Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. R. Subramani"
                  value={newManager.name}
                  onChange={(e) => setNewManager({ ...newManager, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-blue-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Login Username *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. manager5"
                    value={newManager.username}
                    onChange={(e) => setNewManager({ ...newManager, username: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-blue-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 9842100015"
                    value={newManager.phone}
                    onChange={(e) => setNewManager({ ...newManager, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-blue-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. subramani@borewell.com"
                    value={newManager.email}
                    onChange={(e) => setNewManager({ ...newManager, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-blue-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Temporary Password
                  </label>
                  <input
                    type="text"
                    value={newManager.password}
                    onChange={(e) => setNewManager({ ...newManager, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-blue-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              {/* Assign / Lock Vehicle Select */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-blue-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Assign / Lock to Rig Vehicle</span>
                </label>
                <select
                  value={newManager.assigned_vehicle_id}
                  onChange={(e) => setNewManager({ ...newManager, assigned_vehicle_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-blue-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="">Leave Unassigned for now</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.vehicle_number} — {v.rig_name} (Current: {v.manager_name})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Once assigned, this manager will only have access to submit daily chits for this specific vehicle.
                </p>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm"
                >
                  {addLoading ? 'Creating Manager...' : 'Create & Assign Manager'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT / REASSIGN VEHICLE (WHITE & BLUE) */}
      {editingManager && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-blue-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-4 bg-blue-50 border-b border-blue-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-600" />
                <h4 className="text-base font-extrabold text-blue-950">
                  Lock Vehicle to {editingManager.name}
                </h4>
              </div>
              <button
                onClick={() => setEditingManager(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignVehicle} className="p-6 space-y-4">
              <div className="bg-blue-50/60 p-3.5 rounded-xl border border-blue-200 text-xs space-y-1">
                <p className="text-slate-600">
                  Manager: <strong className="text-blue-950">{editingManager.name}</strong> (@{editingManager.username})
                </p>
                <p className="text-slate-600">
                  Currently Locked: <strong className="text-blue-700 font-bold">{editingManager.assigned_vehicle_number || 'None'}</strong>
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select New Locked Vehicle:
                </label>
                <select
                  value={editVehicleId}
                  onChange={(e) => setEditVehicleId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-blue-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="">Unassign / No Vehicle</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.vehicle_number} — {v.rig_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingManager(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm"
                >
                  {editLoading ? 'Saving Lock...' : 'Confirm Vehicle Lock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
