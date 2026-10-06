'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../lib/api';
import { DailyEntry, SummaryStats, Vehicle } from '../../lib/types';
import EntryDetailModal from './EntryDetailModal';
import { Search, RefreshCw, Filter, Layers, Fuel, Gauge, Eye, Calendar, MapPin, HardHat } from 'lucide-react';

interface GlobalFeedProps {
  vehicles: Vehicle[];
}

export default function GlobalFeed({ vehicles }: GlobalFeedProps) {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [summary, setSummary] = useState<SummaryStats>({
    totalReports: 0,
    totalDepth: 0,
    totalDiesel: 0,
    totalRpmHours: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState('');

  // Selected entry for modal view
  const [activeModalEntry, setActiveModalEntry] = useState<DailyEntry | null>(null);

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getGlobalFeed({
        vehicle_id: selectedVehicle,
        date: selectedDate,
        search: search.trim(),
      });
      if (res.success) {
        setEntries(res.data || []);
        if (res.summary) setSummary(res.summary);
      } else {
        setError('Failed to load global drilling feed');
      }
    } catch (err) {
      setError('Connection error loading live feed');
    } finally {
      setLoading(false);
    }
  }, [selectedVehicle, selectedDate, search]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  return (
    <div className="space-y-6">
      
      {/* 4 SUMMARY KPI CARDS (WHITE & BLUE) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-blue-100 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
          <div className="h-12 w-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-xl text-blue-600">
            ⛏️
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Depth Drilled</p>
            <h3 className="text-xl sm:text-2xl font-black text-blue-950 font-mono">
              {summary.totalDepth.toLocaleString()} <span className="text-xs font-normal text-slate-400">ft</span>
            </h3>
          </div>
        </div>

        <div className="bg-white border border-blue-100 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
          <div className="h-12 w-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-xl text-blue-600">
            <Fuel className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Diesel</p>
            <h3 className="text-xl sm:text-2xl font-black text-blue-950 font-mono">
              {summary.totalDiesel.toLocaleString()} <span className="text-xs font-normal text-slate-400">L</span>
            </h3>
          </div>
        </div>

        <div className="bg-white border border-blue-100 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
          <div className="h-12 w-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-xl text-blue-600">
            <Gauge className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total RPM Hours</p>
            <h3 className="text-xl sm:text-2xl font-black text-blue-950 font-mono">
              {summary.totalRpmHours.toLocaleString()} <span className="text-xs font-normal text-slate-400">hrs</span>
            </h3>
          </div>
        </div>

        <div className="bg-white border border-blue-100 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
          <div className="h-12 w-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-xl text-blue-600">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Log Entries</p>
            <h3 className="text-xl sm:text-2xl font-black text-blue-950 font-mono">
              {summary.totalReports} <span className="text-xs font-normal text-slate-400">sheets</span>
            </h3>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH CONTROL BAR */}
      <div className="bg-white border border-blue-100 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: Search input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search party, village, driller..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-blue-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Right: Filters and Refresh */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Rig Select */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 font-bold hidden sm:inline">Rig:</span>
            <select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className="bg-slate-50 border border-blue-200 text-slate-800 text-xs sm:text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="ALL">All Rigs (4 Fleet)</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.vehicle_number} ({v.rig_name.split(' ')[0]})
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-slate-50 border border-blue-200 text-slate-800 text-xs sm:text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {selectedDate && (
            <button
              onClick={() => setSelectedDate('')}
              className="text-xs text-blue-600 hover:text-blue-800 font-bold underline"
            >
              Clear
            </button>
          )}

          {/* Refresh Button */}
          <button
            onClick={fetchFeed}
            disabled={loading}
            className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition flex items-center justify-center disabled:opacity-50"
            title="Refresh Live Feed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* ERROR NOTICE */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button onClick={fetchFeed} className="underline font-bold">Retry</button>
        </div>
      )}

      {/* DATA TABLE (WHITE & BLUE) */}
      <div className="bg-white border border-blue-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-blue-100 flex items-center justify-between bg-blue-50/40">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌐</span>
            <h3 className="font-extrabold text-blue-950 text-base">Real-Time Global Drilling Feed</h3>
          </div>
          <span className="text-xs font-mono text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 font-bold">
            {entries.length} Entries Found
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-blue-50/70 text-blue-900 uppercase text-[11px] tracking-wider border-b border-blue-200 font-bold">
              <tr>
                <th className="py-3 px-4">Date / Rig</th>
                <th className="py-3 px-4">Party & Village</th>
                <th className="py-3 px-4 text-right">Depth</th>
                <th className="py-3 px-4 text-right">B.Rate</th>
                <th className="py-3 px-4 text-right">RPM Hours</th>
                <th className="py-3 px-4 text-right">Diesel</th>
                <th className="py-3 px-4">Manager / Driller</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-100">
              {loading && entries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                      <span>Loading real-time logs...</span>
                    </div>
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No drilling reports found matching criteria.
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr
                    key={entry.id}
                    onClick={() => setActiveModalEntry(entry)}
                    className="hover:bg-blue-50/50 cursor-pointer transition group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 font-mono">{entry.report_date}</div>
                      <div className="text-[11px] font-mono text-blue-700 font-bold">
                        {entry.vehicle_number}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 group-hover:text-blue-600 transition flex items-center gap-1.5">
                        <span>{entry.party_name}</span>
                        {entry.party_no && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold font-mono">
                            #{entry.party_no}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{entry.village}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className="font-mono font-black text-blue-900 text-sm">
                        {entry.depth}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-0.5">ft</span>
                      <div className="text-[10px] text-slate-500">{entry.rod_count} rods</div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className="font-mono text-slate-800 font-semibold">₹{entry.bore_rate}</span>
                      <div className="text-[10px] text-emerald-600 font-mono font-semibold">
                        ₹{((entry.depth || 0) * (entry.bore_rate || 0)).toLocaleString()}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className="font-mono font-bold text-blue-800">
                        {entry.rpm_total} hrs
                      </span>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {entry.rpm_start} → {entry.rpm_end}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className="font-mono text-slate-800">
                        {entry.diesel_liters ? `${entry.diesel_liters} L` : '-'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{entry.manager_name}</div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1">
                        <HardHat className="w-3 h-3 text-slate-400" />
                        <span>{entry.driller_name || 'Driller N/A'}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveModalEntry(entry);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 border border-blue-200 text-xs font-semibold transition inline-flex items-center gap-1 shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Chit</span>
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
