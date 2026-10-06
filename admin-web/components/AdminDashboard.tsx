import React, { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Vehicle {
  id: number;
  vehicle_number: string;
  rig_name: string;
  status: string;
  manager_name?: string;
  manager_phone?: string;
  total_reports?: number;
  total_depth_drilled?: string | number;
  total_diesel_consumed?: string | number;
}

interface DrillingReport {
  id: string;
  vehicle_id: number;
  vehicle_number: string;
  rig_name: string;
  manager_name: string;
  manager_phone: string;
  report_date: string;
  submitted_at_formatted: string;
  party_name: string;
  party_no?: string;
  village: string;
  agent_name?: string;
  bore_rate: number;
  depth: number;
  rod_count: number;
  ms_casing: number;
  pvc_casing: number;
  welding_details?: string;
  recut?: string;
  rebore?: string;
  flushing?: string;
  rpm_start: number;
  rpm_end: number;
  rpm_total: number;
  avg_rpm: number;
  bit_number?: string;
  bit_size?: string;
  hammer_type?: string;
  driller_name?: string;
  diesel_liters: number;
  cash_advance?: string;
  remarks?: string;
}

interface AdminDashboardProps {
  adminUser: {
    id: string;
    username: string;
    name: string;
    email: string;
    role: string;
  };
  onLogout: () => void;
}

export default function AdminDashboard({ adminUser, onLogout }: AdminDashboardProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number>(1);
  const [reports, setReports] = useState<DrillingReport[]>([]);
  const [vehicleSummary, setVehicleSummary] = useState({
    totalReports: 0,
    totalDepth: 0,
    totalDiesel: 0,
    totalRpmHours: 0,
  });

  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [loadingReports, setLoadingReports] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Selected report for granular inspection modal
  const [inspectReport, setInspectReport] = useState<DrillingReport | null>(null);

  // 1. Fetch all 4 vehicles
  const fetchVehicles = useCallback(async () => {
    setLoadingVehicles(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/vehicles`);
      const json = await res.json();
      if (res.ok && json.success) {
        setVehicles(json.data || []);
        if (json.data && json.data.length > 0 && !selectedVehicleId) {
          setSelectedVehicleId(json.data[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      setError('Could not connect to backend server at ' + API_BASE_URL);
    } finally {
      setLoadingVehicles(false);
    }
  }, [selectedVehicleId]);

  // 2. Fetch reports for the selected vehicle ID (sorted by date and time)
  const fetchVehicleReports = useCallback(async (vId: number) => {
    setLoadingReports(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/reports/${vId}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setReports(json.data || []);
        if (json.summary) {
          setVehicleSummary(json.summary);
        }
      } else {
        setError(json.message || 'Failed to load vehicle reports');
      }
    } catch (err) {
      console.error(`Error fetching reports for vehicle ${vId}:`, err);
      setError('Network connection error while fetching reports');
    } finally {
      setLoadingReports(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  useEffect(() => {
    if (selectedVehicleId) {
      fetchVehicleReports(selectedVehicleId);
    }
  }, [selectedVehicleId, fetchVehicleReports]);

  const activeVehicle = vehicles.find((v) => v.id === selectedVehicleId);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Admin Header */}
      <header className="bg-slate-950/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-xl flex items-center justify-center text-xl shadow-md font-bold text-slate-950">
              ⛏️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold tracking-tight text-white">
                  Borewell Fleet Admin
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                  Admin Panel
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Click a vehicle number plate below to review its time-stamped logs
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:block text-right text-xs">
              <p className="font-bold text-slate-200">{adminUser.name}</p>
              <p className="text-slate-400 font-mono text-[11px]">@{adminUser.username} • {adminUser.role}</p>
            </div>

            <button
              onClick={onLogout}
              className="px-3.5 py-1.5 text-xs font-bold text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-900/50 border border-red-800/60 rounded-lg transition duration-150 flex items-center gap-1.5"
            >
              <span>🚪</span> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Error notification */}
        {error && (
          <div className="p-4 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
            <button
              onClick={() => fetchVehicleReports(selectedVehicleId)}
              className="text-xs font-bold underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* SECTION 1: 4 VEHICLE NUMBER PLATES (BUTTONS/CARDS) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                <span>🚛</span> Fleet Vehicles (Select a Number Plate)
              </h2>
              <p className="text-xs text-slate-400">
                Choose one of the 4 drilling rigs to filter and inspect daily drilling reports
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">
              Fleet Size: 4 Rigs
            </span>
          </div>

          {loadingVehicles ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-slate-800/40 animate-pulse rounded-2xl border border-slate-800" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {vehicles.map((v) => {
                const isSelected = v.id === selectedVehicleId;
                return (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVehicleId(v.id)}
                    type="button"
                    className={`text-left transition-all duration-200 rounded-2xl p-4 relative group flex flex-col justify-between ${
                      isSelected
                        ? 'bg-gradient-to-b from-slate-800 to-slate-850 ring-2 ring-amber-400 shadow-xl shadow-amber-500/10 scale-[1.02]'
                        : 'bg-slate-950/70 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 shadow-md'
                    }`}
                  >
                    {/* Active Indicator Pin */}
                    {isSelected && (
                      <span className="absolute -top-2.5 right-4 px-2 py-0.5 bg-amber-400 text-slate-950 text-[10px] font-black rounded-full uppercase tracking-wider shadow">
                        Active Selection
                      </span>
                    )}

                    {/* Realistic Vehicle Registration Plate Header */}
                    <div className="mb-3">
                      <div className="bg-white rounded-lg p-2 border-2 border-slate-900 shadow-inner flex items-center justify-between">
                        {/* IND Badge with Flag / Hologram look */}
                        <div className="flex flex-col items-center justify-center pr-2 border-r border-slate-300">
                          <span className="text-[9px] font-black text-blue-800 leading-tight">IND</span>
                          <span className="text-[8px] text-blue-600">🇮🇳</span>
                        </div>
                        {/* Bold Vehicle Plate Number */}
                        <div className="flex-1 text-center font-mono font-black text-slate-900 text-base sm:text-lg tracking-wider">
                          {v.vehicle_number}
                        </div>
                      </div>
                    </div>

                    {/* Rig Meta Info */}
                    <div className="space-y-1 text-xs">
                      <p className="font-bold text-slate-200 truncate">{v.rig_name}</p>
                      <p className="text-slate-400 text-[11px] flex items-center justify-between">
                        <span>Manager:</span>
                        <span className="font-medium text-slate-300">{v.manager_name || `Manager ${v.id}`}</span>
                      </p>
                    </div>

                    {/* Quick Metric Badges */}
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">
                        {v.total_reports || 0} Reports
                      </span>
                      <span className="font-mono font-bold text-amber-400">
                        {parseFloat(String(v.total_depth_drilled || 0)).toLocaleString()} ft
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* SECTION 2: SUMMARY KPI TILES FOR SELECTED VEHICLE */}
        {activeVehicle && (
          <section className="bg-slate-950/60 rounded-2xl p-5 border border-slate-800 shadow-inner">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  Vehicle Performance Summary
                </span>
                <h3 className="text-xl font-black text-white">
                  {activeVehicle.vehicle_number} — {activeVehicle.rig_name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Assigned Rig Manager: <b className="text-slate-200">{activeVehicle.manager_name || 'N/A'}</b> ({activeVehicle.manager_phone || 'Contact Field'})
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchVehicleReports(selectedVehicleId)}
                  disabled={loadingReports}
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg transition flex items-center gap-1.5"
                >
                  <span className={loadingReports ? 'animate-spin' : ''}>🔄</span>
                  {loadingReports ? 'Refreshing...' : 'Refresh Logs'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Depth</span>
                <p className="text-xl font-extrabold text-blue-400 mt-1">
                  {vehicleSummary.totalDepth.toLocaleString()} ft
                </p>
              </div>
              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Diesel Consumed</span>
                <p className="text-xl font-extrabold text-amber-400 mt-1">
                  {vehicleSummary.totalDiesel.toLocaleString()} L
                </p>
              </div>
              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">RPM Engine Hours</span>
                <p className="text-xl font-extrabold text-purple-400 mt-1">
                  {vehicleSummary.totalRpmHours.toLocaleString()} hrs
                </p>
              </div>
              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Submitted Logs</span>
                <p className="text-xl font-extrabold text-emerald-400 mt-1">
                  {reports.length}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* SECTION 3: DYNAMIC REPORTS TABLE FOR SELECTED VEHICLE */}
        <section className="bg-slate-950/70 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>📋</span> Daily Drilling Submissions for {activeVehicle?.vehicle_number}
              </h3>
              <p className="text-xs text-slate-400">
                Ordered by date and time of submission (newest entries first)
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Showing {reports.length} time-stamped records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-900 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-800">
                  <th className="py-3.5 px-4">Date & Time of Entry</th>
                  <th className="py-3.5 px-4">Party & Village</th>
                  <th className="py-3.5 px-4 text-right">Depth (ft)</th>
                  <th className="py-3.5 px-4 text-right">Rods</th>
                  <th className="py-3.5 px-4">Casings (MS / PVC)</th>
                  <th className="py-3.5 px-4 text-center">RPM Readings</th>
                  <th className="py-3.5 px-4 text-right">Total RPM</th>
                  <th className="py-3.5 px-4 text-right">Diesel</th>
                  <th className="py-3.5 px-4">Advance</th>
                  <th className="py-3.5 px-4 text-center">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-slate-300">
                {loadingReports ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400">
                      <div className="inline-block animate-spin text-2xl mb-2">⚙️</div>
                      <p className="text-xs font-medium">Fetching time-stamped logs for {activeVehicle?.vehicle_number}...</p>
                    </td>
                  </tr>
                ) : reports.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400">
                      <div className="text-3xl mb-2">📄</div>
                      <p className="font-semibold text-slate-300">No reports submitted yet for {activeVehicle?.vehicle_number}</p>
                      <p className="text-xs mt-1 text-slate-500">
                        The assigned Manager ({activeVehicle?.manager_name}) can submit reports from the Mobile App.
                      </p>
                    </td>
                  </tr>
                ) : (
                  reports.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-900/60 transition-colors">
                      {/* Submission Date & Time */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-white text-xs">
                          📅 {new Date(row.report_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                        <div className="text-[11px] text-amber-400/90 font-mono mt-0.5 flex items-center gap-1">
                          <span>⏰</span> {row.submitted_at_formatted || 'Time recorded'}
                        </div>
                      </td>

                      {/* Customer & Location */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-100">{row.party_name}</p>
                        <p className="text-xs text-slate-400">
                          📍 {row.village} {row.party_no ? `• ${row.party_no}` : ''}
                        </p>
                      </td>

                      {/* Depth */}
                      <td className="py-3.5 px-4 text-right font-black text-blue-400 font-mono">
                        {parseFloat(String(row.depth)).toLocaleString()} ft
                      </td>

                      {/* Rods */}
                      <td className="py-3.5 px-4 text-right text-slate-300 font-mono">
                        {row.rod_count}
                      </td>

                      {/* Casings */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-400">
                        <div><span className="font-semibold text-slate-300">MS:</span> {row.ms_casing} ft</div>
                        <div><span className="font-semibold text-slate-300">PVC:</span> {row.pvc_casing} ft</div>
                      </td>

                      {/* RPM Range */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap text-xs text-slate-400 font-mono">
                        {row.rpm_start} ➔ {row.rpm_end}
                      </td>

                      {/* Total RPM */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-purple-950/60 text-purple-300 border border-purple-800/60 font-mono">
                          {parseFloat(String(row.rpm_total)).toFixed(2)} hrs
                        </span>
                      </td>

                      {/* Diesel */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap text-amber-400 font-bold font-mono">
                        {row.diesel_liters} L
                      </td>

                      {/* Advance */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs font-medium text-emerald-400">
                        {row.cash_advance || '—'}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => setInspectReport(row)}
                          className="px-2.5 py-1 text-xs font-bold text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* INSPECTION MODAL */}
      {inspectReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden">
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-white">
                  Report Detail: {inspectReport.party_name}
                </h4>
                <p className="text-xs text-amber-400 font-mono mt-0.5">
                  Vehicle: {inspectReport.vehicle_number} • Submitted At: {inspectReport.submitted_at_formatted}
                </p>
              </div>
              <button
                onClick={() => setInspectReport(null)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs text-slate-300">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500 block">Report Date</span>
                  <span className="font-bold text-slate-200">{inspectReport.report_date}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Submission Time</span>
                  <span className="font-bold text-amber-400 font-mono">{inspectReport.submitted_at_formatted}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Location / Village</span>
                  <span className="font-bold text-slate-200">{inspectReport.village}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Agent / Broker</span>
                  <span className="font-bold text-slate-200">{inspectReport.agent_name || 'None'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Chief Driller</span>
                  <span className="font-bold text-slate-200">{inspectReport.driller_name || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Rig Manager</span>
                  <span className="font-bold text-slate-200">{inspectReport.manager_name}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/40 p-4 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500 block">Total Depth</span>
                  <span className="text-base font-black text-blue-400">{inspectReport.depth} ft</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Rod Count</span>
                  <span className="text-base font-bold text-slate-200">{inspectReport.rod_count}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">MS Casing</span>
                  <span className="text-base font-bold text-slate-200">{inspectReport.ms_casing} ft</span>
                </div>
                <div>
                  <span className="text-slate-500 block">PVC Casing</span>
                  <span className="text-base font-bold text-slate-200">{inspectReport.pvc_casing} ft</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 bg-slate-950/40 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500 block">Bit No / Size</span>
                  <span className="font-semibold text-slate-200">{inspectReport.bit_number || 'N/A'} ({inspectReport.bit_size})</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Hammer Type</span>
                  <span className="font-semibold text-slate-200">{inspectReport.hammer_type || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Welding</span>
                  <span className="font-semibold text-slate-200">{inspectReport.welding_details || 'None'}</span>
                </div>
              </div>

              <div className="bg-amber-950/30 border border-amber-800/50 rounded-xl p-4">
                <span className="font-bold text-amber-300 block mb-1">
                  Field Remarks & Water Strike Notes:
                </span>
                <p className="text-amber-200/90 leading-relaxed">
                  {inspectReport.remarks || 'No remarks recorded for this drilling log.'}
                </p>
              </div>
            </div>

            <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setInspectReport(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
