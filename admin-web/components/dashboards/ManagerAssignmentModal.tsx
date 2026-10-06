'use client';

import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { UserInterface } from '../../models/User';
import { VehicleInterface } from '../../models/Vehicle';
import { Lock, Truck, UserCheck, AlertCircle } from 'lucide-react';

interface ManagerAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  manager: UserInterface | null;
  vehicles: VehicleInterface[];
  onAssignmentSuccess: (updatedManager: UserInterface) => void;
}

export default function ManagerAssignmentModal({
  isOpen,
  onClose,
  manager,
  vehicles,
  onAssignmentSuccess,
}: ManagerAssignmentModalProps) {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(
    manager?.assigned_vehicle_id ? String(manager.assigned_vehicle_id) : ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state when manager changes
  React.useEffect(() => {
    setSelectedVehicleId(
      manager?.assigned_vehicle_id ? String(manager.assigned_vehicle_id) : ''
    );
    setError(null);
  }, [manager]);

  if (!manager) return null;

  const handleSave = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/users/managers/${manager.id}/assign-vehicle`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: selectedVehicleId ? Number(selectedVehicleId) : null,
        }),
      });

      const json = await res.json();
      if (json.success) {
        onAssignmentSuccess(json.data);
        onClose();
      } else {
        setError(json.message || 'Failed to update vehicle assignment.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error updating assignment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Rig Assignment & Manager Lock"
      subtitle={`Configure dedicated drilling rig for manager ${manager.name}`}
      maxWidth="md"
    >
      <div className="space-y-5 text-xs">
        {/* Manager Summary Card */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
          <div>
            <div className="font-extrabold text-sm text-slate-900">{manager.name}</div>
            <div className="text-[11px] text-slate-500">
              Username: <span className="font-mono text-blue-600">{manager.username}</span> • Phone: {manager.phone}
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <UserCheck className="w-4 h-4" />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Vehicle Selection Radio Cards */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
            Select Bore Vehicle to Lock (1:1 Isolation)
          </label>

          <div className="space-y-2">
            {/* Unassigned Option */}
            <label
              className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                selectedVehicleId === ''
                  ? 'bg-blue-50/60 border-blue-500 shadow-xs'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="radio"
                  name="vehicle-choice"
                  checked={selectedVehicleId === ''}
                  onChange={() => setSelectedVehicleId('')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="font-bold text-slate-800 block">No Rig Assigned (Reserve)</span>
                  <span className="text-[10px] text-slate-400">
                    Manager will not have access to submit drilling chits until assigned.
                  </span>
                </div>
              </div>
            </label>

            {/* Fleet Rigs */}
            {vehicles.map((v) => {
              const isSelected = selectedVehicleId === String(v.id);
              const isCurrentlyAssignedToAnother =
                v.manager_id && v.manager_id !== manager.id;

              return (
                <label
                  key={v.id}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                    isSelected
                      ? 'bg-blue-50/60 border-blue-500 shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="vehicle-choice"
                      checked={isSelected}
                      onChange={() => setSelectedVehicleId(String(v.id))}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900">{v.vehicle_number}</span>
                        {v.sensor_enabled && (
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                            IoT Sensor
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 block">{v.rig_name}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    {isCurrentlyAssignedToAnother ? (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Assigned to {v.manager_name} (will reassign)
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Available
                      </span>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            isLoading={isSubmitting}
            icon={<Lock className="w-3.5 h-3.5" />}
          >
            Lock Vehicle Assignment
          </Button>
        </div>
      </div>
    </Modal>
  );
}
