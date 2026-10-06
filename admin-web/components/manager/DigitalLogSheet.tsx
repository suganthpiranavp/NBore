'use client';

import React, { useState, useMemo } from 'react';
import { api } from '../../lib/api';
import { User, Vehicle, DailyEntry } from '../../lib/types';
import {
  FileText,
  Send,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Layers,
  Wrench,
  Fuel,
  IndianRupee,
  Calculator,
} from 'lucide-react';

interface DigitalLogSheetProps {
  user: User;
  assignedVehicle: Vehicle | null;
  onEntrySubmitted: (entry: DailyEntry) => void;
}

export default function DigitalLogSheet({
  user,
  assignedVehicle,
  onEntrySubmitted,
}: DigitalLogSheetProps) {
  const today = new Date().toISOString().split('T')[0];

  // View Mode: Physical Chit Replica (ledger layout) vs Sectioned Modern Form
  const [viewMode, setViewMode] = useState<'chit' | 'standard'>('chit');

  const initialFormState = {
    // Header Info
    agent_name: '',
    sub: '',
    party_no: '',
    report_date: today,
    party_name: '',
    village: '',

    // Bore Details
    depth: '',
    bore_rate: '',
    rod_count: '',

    // Casing & Operations
    ms_casing: '',
    welding_details: '',
    pvc_casing: '',
    recut: '',
    rebore: '',
    flushing: '',

    // Machinery Stats
    rpm_start: '',
    rpm_end: '',
    avg_rpm: '',
    bit_number: '',
    bit_size: '',
    hammer_type: '',
    driller_name: '',

    // Financials & Notes
    diesel_liters: '',
    cash_advance: '',
    remarks: '',
  };

  const [form, setForm] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Field change handler
  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Real-time RPM Calculation & Validation
  const rpmCalc = useMemo(() => {
    const start = parseFloat(form.rpm_start);
    const end = parseFloat(form.rpm_end);

    if (isNaN(start) || isNaN(end)) {
      return { total: 0, isValid: true, error: null };
    }

    if (end <= start) {
      return {
        total: 0,
        isValid: false,
        error: `RPM End (${end}) must be greater than RPM Start (${start})`,
      };
    }

    const diff = parseFloat((end - start).toFixed(2));
    return { total: diff, isValid: true, error: null };
  }, [form.rpm_start, form.rpm_end]);

  // Pre-fill with the EXACT values from the reference physical chit photo!
  const handlePrefillReferenceSlip = () => {
    setForm({
      agent_name: 'Subbu',
      sub: '',
      party_no: '60',
      report_date: '2026-09-08',
      party_name: 'City',
      village: 'Damalacheruvu',
      depth: '800',
      bore_rate: '120',
      rod_count: '40',
      ms_casing: '',
      welding_details: '-',
      pvc_casing: '40',
      recut: '-',
      rebore: '-',
      flushing: '-',
      rpm_start: '6504.0',
      rpm_end: '6511.3',
      avg_rpm: '109',
      bit_number: 'Ganesh',
      bit_size: '161',
      hammer_type: 'Gam',
      driller_name: 'Tharumal',
      diesel_liters: '',
      cash_advance: '20,000 - Subbu',
      remarks: 'Clear water struck. Rocky formation throughout.',
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!assignedVehicle?.id) {
      setError('You are not assigned to any vehicle. Contact Fleet Admin.');
      return;
    }

    if (!form.party_name.trim()) {
      setError('Party Name (Customer) is required.');
      return;
    }

    if (!form.village.trim()) {
      setError('Village / Location is required.');
      return;
    }

    if (!form.depth || parseFloat(form.depth) <= 0) {
      setError('Please provide a valid drilling depth (ft).');
      return;
    }

    if (!form.rpm_start || !form.rpm_end) {
      setError('Both RPM Start and RPM End readings are required.');
      return;
    }

    if (!rpmCalc.isValid) {
      setError(rpmCalc.error || 'Invalid RPM values.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const payload: Partial<DailyEntry> = {
        vehicle_id: assignedVehicle.id,
        manager_id: user.id,
        report_date: form.report_date,
        agent_name: form.agent_name,
        sub: form.sub,
        party_no: form.party_no,
        party_name: form.party_name.trim(),
        village: form.village.trim(),
        depth: parseFloat(form.depth) || 0,
        bore_rate: parseFloat(form.bore_rate) || 0,
        rod_count: parseInt(form.rod_count, 10) || 0,
        ms_casing: parseFloat(form.ms_casing) || 0,
        welding_details: form.welding_details,
        pvc_casing: parseFloat(form.pvc_casing) || 0,
        recut: form.recut,
        rebore: form.rebore,
        flushing: form.flushing,
        rpm_start: parseFloat(form.rpm_start),
        rpm_end: parseFloat(form.rpm_end),
        rpm_total: rpmCalc.total,
        avg_rpm: parseFloat(form.avg_rpm) || 0,
        bit_number: form.bit_number,
        bit_size: form.bit_size,
        hammer_type: form.hammer_type,
        driller_name: form.driller_name,
        diesel_liters: parseFloat(form.diesel_liters) || 0,
        cash_advance: form.cash_advance,
        remarks: form.remarks,
      };

      const res = await api.submitEntry(payload);

      if (res.success && res.data) {
        setSuccess('Daily drilling log sheet successfully submitted and locked to fleet feed!');
        onEntrySubmitted(res.data);
        // Reset form
        setForm({
          ...initialFormState,
          report_date: today,
        });
        setTimeout(() => setSuccess(null), 5000);
      } else {
        setError(res.message || 'Failed to submit log sheet');
      }
    } catch (err: any) {
      setError('Network connection error while submitting report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Controls: Mode Switcher & Prefill Button (WHITE & BLUE) */}
      <div className="bg-white border border-blue-100 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">📝</span>
          <div>
            <h3 className="font-extrabold text-blue-950 text-base">Digital Daily Drilling Sheet</h3>
            <p className="text-xs text-slate-500">
              Assigned Rig: <strong className="text-blue-700 font-mono">{assignedVehicle?.vehicle_number}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Quick Prefill Button from photo */}
          <button
            type="button"
            onClick={handlePrefillReferenceSlip}
            className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
            title="Load values from the reference physical slip photo"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Fill Reference Slip (Photo)</span>
          </button>

          {/* Toggle View Mode */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('chit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'chit'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-blue-700'
              }`}
            >
              Chit Slip View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('standard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'standard'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-blue-700'
              }`}
            >
              Sectioned View
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* FORM CONTAINER */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {viewMode === 'chit' ? (
          /* ==================================================================== */
          /* MODE 1: PHYSICAL CHIT REPLICA (WHITE & BLUE EXACT MIRROR OF PHOTO)    */
          /* ==================================================================== */
          <div className="bg-white border-2 border-blue-400 rounded-2xl p-4 sm:p-6 shadow-md relative font-sans">
            <div className="border-b-2 border-blue-300 pb-3 mb-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-blue-700">
                  Daily Drilling Chit Sheet (Field Ledger Entry)
                </span>
                <p className="text-xs text-slate-500">
                  Enter drilling metrics in the corresponding ledger cells below
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 border border-blue-200 font-bold">
                  {assignedVehicle?.vehicle_number}
                </span>
              </div>
            </div>

            {/* TWO-COLUMN GRID LIKE THE PHOTO LEDGER SLIP (WHITE & BLUE) */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x-2 divide-blue-300 border-2 border-blue-300 rounded-xl overflow-hidden bg-white">
              
              {/* LEFT COLUMN */}
              <div className="divide-y divide-blue-200">
                {/* Agent */}
                <div className="p-3 flex items-center justify-between gap-3">
                  <label className="w-28 text-xs font-bold text-blue-900">Agent</label>
                  <input
                    type="text"
                    placeholder="e.g. Subbu"
                    value={form.agent_name}
                    onChange={(e) => handleChange('agent_name', e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-blue-200 rounded-lg text-slate-900 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* P. No. */}
                <div className="p-3 flex items-center justify-between gap-3">
                  <label className="w-28 text-xs font-bold text-blue-900">P. No.</label>
                  <input
                    type="text"
                    placeholder="e.g. 60"
                    value={form.party_no}
                    onChange={(e) => handleChange('party_no', e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-blue-200 rounded-lg text-slate-900 text-xs font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* P. Name */}
                <div className="p-3 flex items-center justify-between gap-3 bg-blue-50/50">
                  <label className="w-28 text-xs font-bold text-blue-950">P. Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Customer / Party Name (e.g. City)"
                    value={form.party_name}
                    onChange={(e) => handleChange('party_name', e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-white border border-blue-300 rounded-lg text-slate-900 text-xs font-semibold focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Village */}
                <div className="p-3 flex items-center justify-between gap-3 bg-blue-50/50">
                  <label className="w-28 text-xs font-bold text-blue-950">Village *</label>
                  <input
                    type="text"
                    required
                    placeholder="Location (e.g. Damalacheruvu)"
                    value={form.village}
                    onChange={(e) => handleChange('village', e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-white border border-blue-300 rounded-lg text-slate-900 text-xs font-semibold focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Depth */}
                <div className="p-3 flex items-center justify-between gap-3 bg-blue-100/50">
                  <label className="w-28 text-xs font-bold text-blue-950">Depth (ft) *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 800"
                    value={form.depth}
                    onChange={(e) => handleChange('depth', e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-white border border-blue-400 rounded-lg text-blue-950 text-xs font-mono font-bold focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* MS Casing */}
                <div className="p-3 flex items-center justify-between gap-3">
                  <label className="w-28 text-xs font-bold text-blue-900">MS Casing (ft)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 0 or -"
                    value={form.ms_casing}
                    onChange={(e) => handleChange('ms_casing', e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-blue-200 rounded-lg text-slate-900 text-xs font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* PVC Casing */}
                <div className="p-3 flex items-center justify-between gap-3">
                  <label className="w-28 text-xs font-bold text-blue-900">PVC Casing (ft)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 40"
                    value={form.pvc_casing}
                    onChange={(e) => handleChange('pvc_casing', e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-blue-200 rounded-lg text-slate-900 text-xs font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Rebore */}
                <div className="p-3 flex items-center justify-between gap-3">
                  <label className="w-28 text-xs font-bold text-blue-900">Rebore</label>
                  <input
                    type="text"
                    placeholder="e.g. - or details"
                    value={form.rebore}
                    onChange={(e) => handleChange('rebore', e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-blue-200 rounded-lg text-slate-900 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* RPM (Start, End, Total - auto calculate!) */}
                <div className="p-3 space-y-2 bg-blue-50/70">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-blue-950">RPM Hours (Start - End) *</label>
                    <span className="text-[11px] font-mono font-bold text-blue-800">
                      Total: {rpmCalc.total} hrs
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="Start (6504.0)"
                      value={form.rpm_start}
                      onChange={(e) => handleChange('rpm_start', e.target.value)}
                      className="px-2.5 py-1.5 bg-white border border-blue-200 rounded-lg text-slate-900 text-xs font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="End (6511.3)"
                      value={form.rpm_end}
                      onChange={(e) => handleChange('rpm_end', e.target.value)}
                      className={`px-2.5 py-1.5 bg-white border rounded-lg text-slate-900 text-xs font-mono focus:outline-none ${
                        !rpmCalc.isValid ? 'border-red-500' : 'border-blue-200 focus:ring-1 focus:ring-blue-500'
                      }`}
                    />
                  </div>
                  {!rpmCalc.isValid && (
                    <p className="text-[10px] text-red-600 font-semibold">{rpmCalc.error}</p>
                  )}
                </div>

                {/* Bit Num */}
                <div className="p-3 flex items-center justify-between gap-3">
                  <label className="w-28 text-xs font-bold text-blue-900">Bit Num</label>
                  <input
                    type="text"
                    placeholder="e.g. Ganesh"
                    value={form.bit_number}
                    onChange={(e) => handleChange('bit_number', e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-blue-200 rounded-lg text-slate-900 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Hammer */}
                <div className="p-3 flex items-center justify-between gap-3">
                  <label className="w-28 text-xs font-bold text-blue-900">Hammer</label>
                  <input
                    type="text"
                    placeholder="e.g. Gam"
                    value={form.hammer_type}
                    onChange={(e) => handleChange('hammer_type', e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-blue-200 rounded-lg text-slate-900 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Diesel */}
                <div className="p-3 flex items-center justify-between gap-3">
                  <label className="w-28 text-xs font-bold text-blue-900">Diesel (L)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 250"
                    value={form.diesel_liters}
                    onChange={(e) => handleChange('diesel_liters', e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-blue-200 rounded-lg text-slate-900 text-xs font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Cash/Adv */}
                <div className="p-3 flex items-center justify-between gap-3 bg-blue-50/40">
                  <label className="w-28 text-xs font-bold text-blue-950">Cash/Adv</label>
                  <input
                    type="text"
                    placeholder="e.g. 20,000 - Subbu"
                    value={form.cash_advance}
                    onChange={(e) => handleChange('cash_advance', e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-white border border-blue-300 rounded-lg text-blue-900 text-xs font-bold focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="divide-y divide-blue-200">
                {/* Sub */}
                <div className="p-3 flex items-center justify-between gap-3">
                  <label className="w-28 text-xs font-bold text-blue-900">Sub</label>
                  <input
                    type="text"
                    placeholder="Sub-agent / note"
                    value={form.sub}
                    onChange={(e) => handleChange('sub', e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-blue-200 rounded-lg text-slate-900 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Date */}
                <div className="p-3 flex items-center justify-between gap-3">
                  <label className="w-28 text-xs font-bold text-blue-900">Date *</label>
                  <input
                    type="date"
                    required
                    value={form.report_date}
                    onChange={(e) => handleChange('report_date', e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-blue-200 rounded-lg text-slate-900 text-xs font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* B.Rate */}
                <div className="p-3 flex items-center justify-between gap-3 bg-blue-50/50">
                  <label className="w-28 text-xs font-bold text-blue-950">B.Rate (₹/ft)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 120"
                    value={form.bore_rate}
                    onChange={(e) => handleChange('bore_rate', e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-white border border-blue-300 rounded-lg text-slate-900 text-xs font-mono font-bold focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Rod */}
                <div className="p-3 flex items-center justify-between gap-3 bg-blue-50/50">
                  <label className="w-28 text-xs font-bold text-blue-950">Rod Count</label>
                  <input
                    type="number"
                    placeholder="e.g. 40"
                    value={form.rod_count}
                    onChange={(e) => handleChange('rod_count', e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-white border border-blue-300 rounded-lg text-slate-900 text-xs font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Welding */}
                <div className="p-3 flex items-center justify-between gap-3">
                  <label className="w-28 text-xs font-bold text-blue-900">Welding</label>
                  <input
                    type="text"
                    placeholder="e.g. - or 3 joints"
                    value={form.welding_details}
                    onChange={(e) => handleChange('welding_details', e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-blue-200 rounded-lg text-slate-900 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Recut */}
                <div className="p-3 flex items-center justify-between gap-3">
                  <label className="w-28 text-xs font-bold text-blue-900">Recut</label>
                  <input
                    type="text"
                    placeholder="e.g. - or 10 ft"
                    value={form.recut}
                    onChange={(e) => handleChange('recut', e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-blue-200 rounded-lg text-slate-900 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Flushing */}
                <div className="p-3 flex items-center justify-between gap-3">
                  <label className="w-28 text-xs font-bold text-blue-900">Flushing</label>
                  <input
                    type="text"
                    placeholder="e.g. - or 45 mins"
                    value={form.flushing}
                    onChange={(e) => handleChange('flushing', e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-blue-200 rounded-lg text-slate-900 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Avg */}
                <div className="p-3 flex items-center justify-between gap-3 bg-blue-50/50">
                  <label className="w-28 text-xs font-bold text-blue-950">Avg</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 109"
                    value={form.avg_rpm}
                    onChange={(e) => handleChange('avg_rpm', e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-white border border-blue-300 rounded-lg text-slate-900 text-xs font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Bit Size */}
                <div className="p-3 flex items-center justify-between gap-3">
                  <label className="w-28 text-xs font-bold text-blue-900">Bit Size</label>
                  <input
                    type="text"
                    placeholder="e.g. 161 or 6.5 inch"
                    value={form.bit_size}
                    onChange={(e) => handleChange('bit_size', e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-blue-200 rounded-lg text-slate-900 text-xs font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Driller */}
                <div className="p-3 flex items-center justify-between gap-3">
                  <label className="w-28 text-xs font-bold text-blue-900">Driller</label>
                  <input
                    type="text"
                    placeholder="e.g. Tharumal"
                    value={form.driller_name}
                    onChange={(e) => handleChange('driller_name', e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-blue-200 rounded-lg text-slate-900 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Estimated Bill preview */}
                <div className="p-3 flex items-center justify-between gap-3 bg-blue-100/50">
                  <label className="w-28 text-xs font-bold text-blue-950">Est. Amount</label>
                  <span className="text-sm font-mono font-black text-blue-950">
                    ₹{((parseFloat(form.depth) || 0) * (parseFloat(form.bore_rate) || 0)).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Remarks Full Width */}
            <div className="mt-4 p-3 bg-blue-50/40 border border-blue-200 rounded-xl">
              <label className="block text-xs font-bold text-blue-900 mb-1">
                Remarks / Formation Notes
              </label>
              <textarea
                rows={2}
                placeholder="Water strike depths, rock formation, gravel layers, etc."
                value={form.remarks}
                onChange={(e) => handleChange('remarks', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-slate-900 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        ) : (
          /* ==================================================================== */
          /* MODE 2: MODERN SECTIONED FORM (WHITE & BLUE)                          */
          /* ==================================================================== */
          <div className="space-y-6">
            
            {/* 1. Header Details */}
            <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm space-y-4">
              <h4 className="text-sm font-extrabold text-blue-900 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>1. Header & Customer Information</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={form.report_date}
                    onChange={(e) => handleChange('report_date', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-blue-200 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Party / Customer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. City"
                    value={form.party_name}
                    onChange={(e) => handleChange('party_name', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-blue-200 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Village / Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Damalacheruvu"
                    value={form.village}
                    onChange={(e) => handleChange('village', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-blue-200 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Agent</label>
                  <input
                    type="text"
                    placeholder="e.g. Subbu"
                    value={form.agent_name}
                    onChange={(e) => handleChange('agent_name', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-blue-200 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Sub</label>
                  <input
                    type="text"
                    placeholder="Sub-agent"
                    value={form.sub}
                    onChange={(e) => handleChange('sub', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-blue-200 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">P. No. (Party Number)</label>
                  <input
                    type="text"
                    placeholder="e.g. 60"
                    value={form.party_no}
                    onChange={(e) => handleChange('party_no', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-blue-200 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* 2. Bore Details & Casing Operations */}
            <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm space-y-4">
              <h4 className="text-sm font-extrabold text-blue-900 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>2. Bore Metrics & Casing Operations</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Total Depth (ft) *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 800"
                    value={form.depth}
                    onChange={(e) => handleChange('depth', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-blue-300 rounded-xl text-blue-950 font-mono font-bold text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Bore Rate (₹/ft)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 120"
                    value={form.bore_rate}
                    onChange={(e) => handleChange('bore_rate', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-blue-200 rounded-xl text-slate-900 font-mono text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Drill Rod Count</label>
                  <input
                    type="number"
                    placeholder="e.g. 40"
                    value={form.rod_count}
                    onChange={(e) => handleChange('rod_count', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-blue-200 rounded-xl text-slate-900 font-mono text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">MS Casing (ft)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 0"
                    value={form.ms_casing}
                    onChange={(e) => handleChange('ms_casing', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-blue-200 rounded-xl text-slate-900 font-mono text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">PVC Casing (ft)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 40"
                    value={form.pvc_casing}
                    onChange={(e) => handleChange('pvc_casing', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-blue-200 rounded-xl text-slate-900 font-mono text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Welding Details</label>
                  <input
                    type="text"
                    placeholder="e.g. 3 joints welded"
                    value={form.welding_details}
                    onChange={(e) => handleChange('welding_details', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-blue-200 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* 3. Machinery & Rig Stats */}
            <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm space-y-4">
              <h4 className="text-sm font-extrabold text-blue-900 uppercase tracking-wider flex items-center gap-2">
                <Wrench className="w-4 h-4 text-blue-600" />
                <span>3. Machinery, RPM & Tool Stats</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">RPM Start *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 6504.0"
                    value={form.rpm_start}
                    onChange={(e) => handleChange('rpm_start', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-blue-200 rounded-xl text-slate-900 font-mono text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">RPM End *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 6511.3"
                    value={form.rpm_end}
                    onChange={(e) => handleChange('rpm_end', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-blue-200 rounded-xl text-slate-900 font-mono text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">RPM Total (Auto)</label>
                  <div className="px-3 py-2 bg-blue-50 border border-blue-300 rounded-xl text-blue-900 font-mono font-bold text-xs flex items-center justify-between">
                    <span>{rpmCalc.total} hrs</span>
                    <Calculator className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Avg RPM Rate</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 109"
                    value={form.avg_rpm}
                    onChange={(e) => handleChange('avg_rpm', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-blue-200 rounded-xl text-slate-900 font-mono text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Bit Num</label>
                  <input
                    type="text"
                    placeholder="e.g. Ganesh"
                    value={form.bit_number}
                    onChange={(e) => handleChange('bit_number', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-blue-200 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Bit Size</label>
                  <input
                    type="text"
                    placeholder="e.g. 161"
                    value={form.bit_size}
                    onChange={(e) => handleChange('bit_size', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-blue-200 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hammer</label>
                  <input
                    type="text"
                    placeholder="e.g. Gam"
                    value={form.hammer_type}
                    onChange={(e) => handleChange('hammer_type', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-blue-200 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Driller (Name)</label>
                  <input
                    type="text"
                    placeholder="e.g. Tharumal"
                    value={form.driller_name}
                    onChange={(e) => handleChange('driller_name', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-blue-200 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* 4. Financials & Remarks */}
            <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm space-y-4">
              <h4 className="text-sm font-extrabold text-blue-900 uppercase tracking-wider flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-blue-600" />
                <span>4. Financials, Diesel & Notes</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Diesel Consumed (L)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 240"
                    value={form.diesel_liters}
                    onChange={(e) => handleChange('diesel_liters', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-blue-200 rounded-xl text-slate-900 font-mono text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cash / Advance</label>
                  <input
                    type="text"
                    placeholder="e.g. 20,000 - Subbu"
                    value={form.cash_advance}
                    onChange={(e) => handleChange('cash_advance', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-blue-200 rounded-xl text-blue-900 font-bold text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Remarks & Strata Details</label>
                  <textarea
                    rows={2}
                    placeholder="Water strikes, rock hardness, customer feedback..."
                    value={form.remarks}
                    onChange={(e) => handleChange('remarks', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-blue-200 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

          </div>
        )}

        {/* SUBMIT BUTTON (WHITE & BLUE) */}
        <div className="bg-white border border-blue-100 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div className="text-xs text-slate-500 font-mono">
            Tied to: <span className="text-blue-700 font-bold">{assignedVehicle?.vehicle_number}</span> • Auto-locked
          </div>

          <button
            type="submit"
            disabled={loading || !rpmCalc.isValid}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-600/20 text-xs sm:text-sm transition flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Recording Daily Log...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Daily Drilling Sheet</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
