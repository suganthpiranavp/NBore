'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Vehicle, DailyEntry, SummaryStats } from '../../lib/types';
import { api } from '../../lib/api';
import EntryDetailModal from './EntryDetailModal';
import { Truck, Fuel, Gauge, Eye, Phone, UserCheck, RefreshCw, AlertCircle } from 'lucide-react';

interface VehicleFleetProps {
  vehicles: Vehicle[];
  onRefreshVehicles: () => void;
}

export default function VehicleFleet({ vehicles, onRefreshVehicles }: VehicleFleetProps) {
  const [selectedVehicleId, setSelectedVehicleId] = useState<number>(1);
  const [reports, setReports] = useState<DailyEntry[]>([]);
  const [summary, setSummary] = useState<SummaryStats>({
    totalReports: 0,
    totalDepth: 0,
    totalDiesel: 0,
    totalRpmHours: 0,
  });
  const [loading, setLoading] = useState(false);
  const [activeModalEntry, setActiveModalEntry] = useState<DailyEntry | null>(null);

  const fetchVehicleReports = useCallback(async (vId: number) => {
    setLoading(true);
    try {
      const res = await api.getVehicleEntries(vId);
      if (res.success) {
        setReports(res.data || []);
        if (res.summary) setSummary(res.summary);
      }
    } catch (err) {
      console.error('Error fetching vehicle reports:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedVehicleId) {
      fetchVehicleReports(selectedVehicleId);
    }
  }, [selectedVehicleId, fetchVehicleReports]);

  const activeVehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];

  return (
    <div className="space-y-6">
      
      {/* 4 VEHICLE NUMBER PLATES GRID (WHITE & BLUE) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-extrabold text-blue-950 flex items-center gap-2">
              <span>🚛</span> Fleet Rig Selector (4 Bore Rigs)
            </h3>
            <p className="text-xs text-slate-500">
              Click a registration plate to view dedicated rig performance, compressor metrics, and logs
            </p>
          </div>
          <button
            onClick={() => {
              onRefreshVehicles();
              if (selectedVehicleId) fetchVehicleReports(selectedVehicleId);
            }}
            className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition"
            title="Refresh Fleet Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {vehicles.map((v) => {
            const isSelected = v.id === selectedVehicleId;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelectedVehicleId(v.id)}
                className={`text-left transition-all duration-200 rounded-2xl p-4 relative group flex flex-col justify-between ${
                  isSelected
                    ? 'bg-blue-50/60 ring-2 ring-blue-600 border border-blue-300 shadow-md scale-[1.02]'
                    : 'bg-white hover:bg-blue-50/30 border border-blue-100 hover:border-blue-200 shadow-sm'
                }`}
              >
                {/* Active Indicator */}
                {isSelected && (
                  <span className="absolute -top-2.5 right-4 px-2 py-0.5 bg-blue-600 text-white text-[10px] font-black rounded-full uppercase tracking-wider shadow">
                    Active Rig
                  </span>
                )}

                {/* Indian Vehicle Plate */}
                <div className="mb-3">
                  <div className="bg-white rounded-lg p-2 border-2 border-slate-900 shadow-inner flex items-center justify-between">
                    <div className="flex flex-col items-center justify-center pr-2 border-r border-slate-300">
                      <span className="text-[9px] font-black text-blue-800 leading-tight">IND</span>
                      <span className="text-[8px]">🇮🇳</span>
                    </div>
                    <div className="flex-1 text-center font-mono font-black text-slate-900 text-base sm:text-lg tracking-wider">
                      {v.vehicle_number}
                    </div>
                  </div>
                </div>

                {/* Rig Name & Status */}
                <div className="space-y-1 mb-3">
                  <div className="text-xs font-bold text-slate-900 truncate">{v.rig_name}</div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Assigned Manager:</span>
                    <span className="font-semibold text-blue-700 truncate max-w-[120px]">
                      {v.manager_name}
                    </span>
                  </div>
                </div>

                {/* Quick Rig KPI stats */}
                <div className="pt-2 border-t border-blue-100 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Depth:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {(v.total_depth_drilled || 0).toLocaleString()} ft
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block">Diesel:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {(v.total_diesel_consumed || 0).toLocaleString()} L
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SELECTED RIG SPECS & CUMULATIVE STATS BANNER (WHITE & BLUE) */}
      {activeVehicle && (
        <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-blue-100">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-mono font-black text-slate-900 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                  {activeVehicle.vehicle_number}
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ● {activeVehicle.status}
                </span>
              </div>
              <h4 className="text-lg font-bold text-blue-950 mt-1">{activeVehicle.rig_name}</h4>
              <p className="text-xs text-slate-500 font-mono">
                Chassis: {activeVehicle.chassis_number || 'N/A'} • Compressor: {activeVehicle.compressor_model || 'N/A'}
              </p>
            </div>

            {/* Assigned Manager Card */}
            <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-200 text-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 block">
                Locked Field Manager
              </span>
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-blue-950 text-sm">{activeVehicle.manager_name}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 font-mono">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>{activeVehicle.manager_phone}</span>
              </div>
            </div>
          </div>

          {/* Rig Performance KPI numbers */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
            <div>
              <span className="text-xs text-slate-500 block">Total Drilled</span>
              <span className="text-lg sm:text-xl font-mono font-bold text-blue-900">
                {summary.totalDepth.toLocaleString()} ft
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Diesel Consumed</span>
              <span className="text-lg sm:text-xl font-mono font-bold text-blue-900">
                {summary.totalDiesel.toLocaleString()} L
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">RPM Working Hours</span>
              <span className="text-lg sm:text-xl font-mono font-bold text-blue-900">
                {summary.totalRpmHours.toLocaleString()} hrs
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Daily Log Sheets</span>
              <span className="text-lg sm:text-xl font-mono font-bold text-slate-900">
                {summary.totalReports} logs
              </span>
            </div>
          </div>
        </div>
      )}

      {/* FILTERED DRILLING LOGS FOR THIS RIG */}
      <div className="bg-white border border-blue-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-blue-100 flex items-center justify-between bg-blue-50/40">
          <div className="flex items-center gap-2">
            <span className="text-lg">📄</span>
            <h3 className="font-extrabold text-blue-950 text-base">
              Time-Stamped Logs for {activeVehicle?.vehicle_number}
            </h3>
          </div>
          <span className="text-xs font-mono text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 font-bold">
            {reports.length} Logs Recorded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-blue-50/70 text-blue-900 uppercase text-[11px] tracking-wider border-b border-blue-200 font-bold">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Party & Village</th>
                <th className="py-3 px-4 text-right">Depth</th>
                <th className="py-3 px-4 text-right">B.Rate</th>
                <th className="py-3 px-4 text-right">RPM Hours</th>
                <th className="py-3 px-4 text-right">Diesel</th>
                <th className="py-3 px-4">Advance / Notes</th>
                <th className="py-3 px-4 text-center">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                    <span>Loading logs for {activeVehicle?.vehicle_number}...</span>
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500">
                    No drilling reports logged for this vehicle yet.
                  </td>
                </tr>
              ) : (
                reports.map((entry) => (
                  <tr
                    key={entry.id}
                    onClick={() => setActiveModalEntry(entry)}
                    className="hover:bg-blue-50/50 cursor-pointer transition group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {entry.report_date}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 group-hover:text-blue-600 transition">
                        {entry.party_name}
                      </div>
                      <div className="text-[11px] text-slate-500">{entry.village}</div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className="font-mono font-black text-blue-900">{entry.depth}</span>
                      <span className="text-[10px] text-slate-400 ml-0.5">ft</span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-slate-800">
                      ₹{entry.bore_rate}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-blue-800">
                      {entry.rpm_total} hrs
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-slate-800">
                      {entry.diesel_liters ? `${entry.diesel_liters} L` : '-'}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 text-xs">
                      {entry.cash_advance || entry.remarks || '-'}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveModalEntry(entry);
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

      {/* Chit Inspection Modal */}
      {activeModalEntry && (
        <EntryDetailModal
          entry={activeModalEntry}
          onClose={() => setActiveModalEntry(null)}
        />
      )}
    </div>
  );
}
