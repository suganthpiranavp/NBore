'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { User, Vehicle, DailyEntry } from '../../lib/types';
import { api } from '../../lib/api';
import DigitalLogSheet from './DigitalLogSheet';
import EntryDetailModal from '../admin/EntryDetailModal';
import {
  Truck,
  Lock,
  LogOut,
  Clock,
  History,
  FileSpreadsheet,
  AlertTriangle,
  RefreshCw,
  Eye,
  CheckCircle,
} from 'lucide-react';

interface ManagerDashboardProps {
  managerUser: User;
  onLogout: () => void;
}

export default function ManagerDashboard({ managerUser, onLogout }: ManagerDashboardProps) {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [vehicleLoading, setVehicleLoading] = useState(true);
  const [recentEntries, setRecentEntries] = useState<DailyEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [activeTab, setActiveTab] = useState<'form' | 'history'>('form');
  const [inspectEntry, setInspectEntry] = useState<DailyEntry | null>(null);

  const fetchVehicleAndEntries = useCallback(async () => {
    if (!managerUser.assigned_vehicle_id) {
      setVehicleLoading(false);
      return;
    }

    setVehicleLoading(true);
    setLoadingEntries(true);
    try {
      // Fetch vehicle details
      const vRes = await api.getVehicle(managerUser.assigned_vehicle_id);
      if (vRes.success) {
        setVehicle(vRes.data);
      }

      // Fetch entries for this vehicle
      const eRes = await api.getVehicleEntries(managerUser.assigned_vehicle_id);
      if (eRes.success) {
        setRecentEntries(eRes.data || []);
      }
    } catch (err) {
      console.error('Error fetching vehicle data:', err);
    } finally {
      setVehicleLoading(false);
      setLoadingEntries(false);
    }
  }, [managerUser.assigned_vehicle_id]);

  useEffect(() => {
    fetchVehicleAndEntries();
  }, [fetchVehicleAndEntries]);

  const handleNewEntry = (entry: DailyEntry) => {
    setRecentEntries((prev) => [entry, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* TOP MANAGER HEADER (WHITE & BLUE) */}
      <header className="bg-white border-b border-blue-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-xl shadow-md shadow-blue-600/20 font-bold text-white border border-blue-500">
              🚜
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-blue-950">Rig Manager Portal</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                  Field Operations
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Daily drilling chits & meter logs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right text-xs hidden sm:block">
              <p className="font-bold text-slate-800">{managerUser.name}</p>
              <p className="text-slate-500 font-mono text-[11px]">@{managerUser.username}</p>
            </div>

            <button
              onClick={onLogout}
              className="px-3.5 py-1.5 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition flex items-center gap-1.5 shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 space-y-6">
        
        {/* ==================================================================== */}
        {/* VEHICLE LOCK BANNER (WHITE & BLUE MANDATORY REQUIREMENT)              */}
        {/* ==================================================================== */}
        {vehicle ? (
          <div className="bg-white border-2 border-blue-400 rounded-2xl p-4 sm:p-5 shadow-sm relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              
              <div className="flex items-center gap-4">
                {/* Visual Registration Plate */}
                <div className="bg-white rounded-lg p-2 border-2 border-slate-900 shadow-inner flex items-center gap-2 min-w-[170px]">
                  <div className="flex flex-col items-center pr-1.5 border-r border-slate-300">
                    <span className="text-[8px] font-black text-blue-800 leading-tight">IND</span>
                    <span className="text-[7px]">🇮🇳</span>
                  </div>
                  <span className="font-mono font-black text-slate-950 text-base sm:text-lg tracking-wider">
                    {vehicle.vehicle_number}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-black uppercase tracking-wider text-blue-700">
                      Locked Assigned Vehicle
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-blue-950 mt-0.5">
                    {vehicle.rig_name}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Compressor: {vehicle.compressor_model || 'ELGI Standard'}
                  </p>
                </div>
              </div>

              {/* Status & Submissions pill */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-blue-100 pt-2 sm:pt-0">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                  ● Rig Status: {vehicle.status}
                </span>
                <span className="text-xs text-slate-500 mt-1">
                  Total Logged: <strong className="text-blue-950 font-mono">{recentEntries.length} entries</strong>
                </span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-blue-100 text-[11px] text-slate-600 flex items-center gap-2">
              <span className="text-blue-600 font-bold">🔒</span>
              <span>
                <strong>Fleet Security Lock:</strong> Your account is locked to this vehicle. All submissions are automatically tagged with registration <strong>{vehicle.vehicle_number}</strong>.
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-red-700 text-xs flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-500" />
            <div>
              <p className="font-bold">No Rig Vehicle Assigned to this Account</p>
              <p className="text-slate-500">
                Please contact an Admin to assign and lock your manager account to one of the 4 fleet rigs.
              </p>
            </div>
          </div>
        )}

        {/* TAB NAVIGATION: Daily Form vs Submission History */}
        <div className="flex gap-2 border-b border-blue-200 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('form')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
              activeTab === 'form'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-600 hover:text-blue-700 hover:bg-white'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Fill Daily Drilling Sheet</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-600 hover:text-blue-700 hover:bg-white'
            }`}
          >
            <History className="w-4 h-4" />
            <span>My Rig Submissions ({recentEntries.length})</span>
          </button>
        </div>

        {/* TAB 1: FORM */}
        {activeTab === 'form' && (
          <DigitalLogSheet
            user={managerUser}
            assignedVehicle={vehicle}
            onEntrySubmitted={handleNewEntry}
          />
        )}

        {/* TAB 2: HISTORY */}
        {activeTab === 'history' && (
          <div className="bg-white border border-blue-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-blue-100 flex items-center justify-between bg-blue-50/40">
              <div className="flex items-center gap-2">
                <span className="text-lg">📋</span>
                <h3 className="font-extrabold text-blue-950 text-base">
                  Drilling History for {vehicle?.vehicle_number}
                </h3>
              </div>
              <button
                onClick={fetchVehicleAndEntries}
                className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
              >
                <RefreshCw className={`w-4 h-4 ${loadingEntries ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-blue-50/70 text-blue-900 uppercase text-[11px] tracking-wider border-b border-blue-200 font-bold">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Party & Village</th>
                    <th className="py-3 px-4 text-right">Depth</th>
                    <th className="py-3 px-4 text-right">RPM Working Hours</th>
                    <th className="py-3 px-4 text-right">Advance Collected</th>
                    <th className="py-3 px-4 text-center">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-100">
                  {recentEntries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        No previous drilling entries recorded yet for this vehicle.
                      </td>
                    </tr>
                  ) : (
                    recentEntries.map((entry) => (
                      <tr
                        key={entry.id}
                        onClick={() => setInspectEntry(entry)}
                        className="hover:bg-blue-50/50 cursor-pointer transition"
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          {entry.report_date}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{entry.party_name}</div>
                          <div className="text-[11px] text-slate-500">{entry.village}</div>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-blue-900">
                          {entry.depth} ft
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-blue-800">
                          {entry.rpm_total} hrs
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-800">
                          {entry.cash_advance || '-'}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setInspectEntry(entry);
                            }}
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-600 hover:text-white transition shadow-sm"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal Chit Inspection */}
        {inspectEntry && (
          <EntryDetailModal
            entry={inspectEntry}
            onClose={() => setInspectEntry(null)}
          />
        )}

      </main>

    </div>
  );
}
