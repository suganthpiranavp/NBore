'use client';

import React from 'react';
import { DailyEntry } from '../../lib/types';
import { X, Printer, CheckCircle2, MapPin, Calendar, Clock, DollarSign, Gauge, Fuel } from 'lucide-react';

interface EntryDetailModalProps {
  entry: DailyEntry | null;
  onClose: () => void;
}

export default function EntryDetailModal({ entry, onClose }: EntryDetailModalProps) {
  if (!entry) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-blue-200 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Top Header (WHITE & BLUE) */}
        <div className="px-6 py-4 bg-blue-50 border-b border-blue-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📋</span>
            <div>
              <h3 className="text-base font-bold text-blue-950 flex items-center gap-2">
                Daily Drilling Log Slip
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300 font-semibold">
                  Verified Entry
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {entry.vehicle_number || `Rig #${entry.vehicle_id}`} • Submitted {entry.submitted_at_formatted || entry.created_at}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-2 rounded-xl bg-white hover:bg-blue-100 text-blue-700 border border-blue-200 transition text-xs flex items-center gap-1.5 shadow-sm"
              title="Print Chit"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print Slip</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-700 border border-blue-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Physical Chit Replica Design (WHITE & BLUE THEME) */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* THE PHYSICAL CHIT CARD */}
          <div className="bg-white border-2 border-blue-400 rounded-xl p-4 sm:p-5 relative shadow-md font-sans">
            <div className="flex items-center justify-between border-b-2 border-blue-300 pb-3 mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                  Physical Chit Replica • Daily Field Log
                </span>
                <h4 className="text-lg font-black text-blue-950 font-mono">
                  {entry.party_name} ({entry.village})
                </h4>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500">P. No:</span>
                <span className="ml-1 text-sm font-black font-mono text-blue-800">
                  {entry.party_no || 'N/A'}
                </span>
              </div>
            </div>

            {/* Grid layout exactly following the physical slip columns */}
            <div className="grid grid-cols-2 divide-x divide-blue-300 border-2 border-blue-300 rounded-lg overflow-hidden bg-white text-xs sm:text-sm">
              
              {/* Left Column */}
              <div className="divide-y divide-blue-200">
                <div className="p-2.5 flex justify-between items-center">
                  <span className="font-bold text-blue-900">Agent:</span>
                  <span className="font-medium text-slate-900">{entry.agent_name || '-'}</span>
                </div>
                <div className="p-2.5 flex justify-between items-center">
                  <span className="font-bold text-blue-900">P. No.:</span>
                  <span className="font-mono font-medium text-slate-900">{entry.party_no || '-'}</span>
                </div>
                <div className="p-2.5 flex justify-between items-center">
                  <span className="font-bold text-blue-900">P. Name:</span>
                  <span className="font-semibold text-slate-900">{entry.party_name}</span>
                </div>
                <div className="p-2.5 flex justify-between items-center">
                  <span className="font-bold text-blue-900">Village:</span>
                  <span className="font-semibold text-slate-900">{entry.village}</span>
                </div>
                <div className="p-2.5 flex justify-between items-center bg-blue-50/70">
                  <span className="font-bold text-blue-900">Depth (ft):</span>
                  <span className="font-mono font-black text-blue-900 text-base">{entry.depth} ft</span>
                </div>
                <div className="p-2.5 flex justify-between items-center">
                  <span className="font-bold text-blue-900">MS Casing:</span>
                  <span className="font-mono text-slate-900">{entry.ms_casing ? `${entry.ms_casing} ft` : '-'}</span>
                </div>
                <div className="p-2.5 flex justify-between items-center">
                  <span className="font-bold text-blue-900">PVC Casing:</span>
                  <span className="font-mono text-slate-900">{entry.pvc_casing ? `${entry.pvc_casing} ft` : '-'}</span>
                </div>
                <div className="p-2.5 flex justify-between items-center">
                  <span className="font-bold text-blue-900">Rebore:</span>
                  <span className="text-slate-900">{entry.rebore || '-'}</span>
                </div>
                <div className="p-2.5 flex justify-between items-center bg-blue-50/70">
                  <span className="font-bold text-blue-900">RPM:</span>
                  <span className="font-mono font-bold text-blue-900">
                    {entry.rpm_start} - {entry.rpm_end} ({entry.rpm_total} hrs)
                  </span>
                </div>
                <div className="p-2.5 flex justify-between items-center">
                  <span className="font-bold text-blue-900">Bit Num:</span>
                  <span className="font-medium text-slate-900">{entry.bit_number || '-'}</span>
                </div>
                <div className="p-2.5 flex justify-between items-center">
                  <span className="font-bold text-blue-900">Hammer:</span>
                  <span className="font-medium text-slate-900">{entry.hammer_type || '-'}</span>
                </div>
                <div className="p-2.5 flex justify-between items-center">
                  <span className="font-bold text-blue-900">Diesel:</span>
                  <span className="font-mono text-slate-900">{entry.diesel_liters ? `${entry.diesel_liters} L` : '-'}</span>
                </div>
                <div className="p-2.5 flex justify-between items-center bg-blue-50/40">
                  <span className="font-bold text-blue-900">Cash/Adv:</span>
                  <span className="font-mono font-bold text-blue-800">{entry.cash_advance || '-'}</span>
                </div>
              </div>

              {/* Right Column */}
              <div className="divide-y divide-blue-200">
                <div className="p-2.5 flex justify-between items-center">
                  <span className="font-bold text-blue-900">Sub:</span>
                  <span className="font-medium text-slate-900">{entry.sub || '-'}</span>
                </div>
                <div className="p-2.5 flex justify-between items-center">
                  <span className="font-bold text-blue-900">Date:</span>
                  <span className="font-mono font-medium text-slate-900">{entry.report_date}</span>
                </div>
                <div className="p-2.5 flex justify-between items-center">
                  <span className="font-bold text-blue-900">Rig Assigned:</span>
                  <span className="font-mono text-blue-800 font-bold">{entry.vehicle_number || `#${entry.vehicle_id}`}</span>
                </div>
                <div className="p-2.5 flex justify-between items-center">
                  <span className="font-bold text-blue-900">Manager:</span>
                  <span className="font-semibold text-slate-900">{entry.manager_name || '-'}</span>
                </div>
                <div className="p-2.5 flex justify-between items-center bg-blue-50/70">
                  <span className="font-bold text-blue-900">B.Rate (₹/ft):</span>
                  <span className="font-mono font-bold text-blue-900">₹{entry.bore_rate}</span>
                </div>
                <div className="p-2.5 flex justify-between items-center">
                  <span className="font-bold text-blue-900">Rod Count:</span>
                  <span className="font-mono text-slate-900">{entry.rod_count} rods</span>
                </div>
                <div className="p-2.5 flex justify-between items-center">
                  <span className="font-bold text-blue-900">Welding:</span>
                  <span className="text-slate-900">{entry.welding_details || '-'}</span>
                </div>
                <div className="p-2.5 flex justify-between items-center">
                  <span className="font-bold text-blue-900">Recut:</span>
                  <span className="text-slate-900">{entry.recut || '-'}</span>
                </div>
                <div className="p-2.5 flex justify-between items-center">
                  <span className="font-bold text-blue-900">Flushing:</span>
                  <span className="text-slate-900">{entry.flushing || '-'}</span>
                </div>
                <div className="p-2.5 flex justify-between items-center bg-blue-50/70">
                  <span className="font-bold text-blue-900">Avg:</span>
                  <span className="font-mono font-bold text-blue-900">{entry.avg_rpm || '-'}</span>
                </div>
                <div className="p-2.5 flex justify-between items-center">
                  <span className="font-bold text-blue-900">Bit Size:</span>
                  <span className="font-medium text-slate-900">{entry.bit_size || '-'}</span>
                </div>
                <div className="p-2.5 flex justify-between items-center">
                  <span className="font-bold text-blue-900">Driller:</span>
                  <span className="font-semibold text-slate-900">{entry.driller_name || '-'}</span>
                </div>
                <div className="p-2.5 flex justify-between items-center bg-blue-50/40">
                  <span className="font-bold text-blue-900">Est. Amount:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    ₹{((entry.depth || 0) * (entry.bore_rate || 0)).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Remarks Full Width */}
            <div className="mt-3 p-3 bg-blue-50/50 border border-blue-200 rounded-lg">
              <span className="text-xs font-bold text-blue-900 block mb-1">Remarks / Formation Notes:</span>
              <p className="text-xs text-slate-700 italic">
                {entry.remarks || 'No special remarks recorded.'}
              </p>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-blue-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition shadow-sm"
          >
            Close Inspection
          </button>
        </div>
      </div>
    </div>
  );
}
