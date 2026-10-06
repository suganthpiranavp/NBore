'use client';

import React, { useState, useMemo } from 'react';
import { DailyEntryInterface } from '../../models/DailyEntry';
import { VehicleInterface } from '../../models/Vehicle';
import Button from '../Button';
import { Send, Sparkles, AlertCircle, CheckCircle2, Calculator } from 'lucide-react';

interface DrillingChitFormProps {
  vehicle: VehicleInterface | null;
  managerId: string;
  onSuccess: (entry: DailyEntryInterface) => void;
}

export default function DrillingChitForm({
  vehicle,
  managerId,
  onSuccess,
}: DrillingChitFormProps) {
  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    agent_name: '',
    sub: '',
    party_no: '',
    report_date: today,
    party_name: '',
    village: '',
    depth: '',
    bore_rate: '',
    rod_count: '',
    ms_casing: '',
    welding_details: '',
    pvc_casing: '',
    recut: '',
    rebore: '',
    flushing: '',
    rpm_start: '',
    rpm_end: '',
    avg_rpm: '',
    bit_number: '',
    bit_size: '',
    hammer_type: '',
    driller_name: '',
    diesel_liters: '',
    cash_advance: '',
    remarks: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (key: string, val: string) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  // Real-time RPM Math: Total = End - Start
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

    return { total: parseFloat((end - start).toFixed(2)), isValid: true, error: null };
  }, [form.rpm_start, form.rpm_end]);

  // Quick 1-click prefill with exact values from the reference sheet
  const handlePrefillPhotoSlip = () => {
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
      remarks: 'Clear water struck. Rocky strata throughout.',
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicle?.id) {
      setError('Cannot submit: No rig vehicle assigned to this account.');
      return;
    }
    if (!form.party_name.trim()) {
      setError('Party Name is required.');
      return;
    }
    if (!form.village.trim()) {
      setError('Village is required.');
      return;
    }
    if (!form.depth || parseFloat(form.depth) <= 0) {
      setError('Valid drilling depth is required.');
      return;
    }
    if (!form.rpm_start || !form.rpm_end || !rpmCalc.isValid) {
      setError(rpmCalc.error || 'Valid RPM Start and End readings are required.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          vehicle_id: vehicle.id,
          manager_id: managerId,
          rpm_total: rpmCalc.total,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setSuccess('Daily drilling sheet successfully recorded!');
        onSuccess(json.data);
        setForm((prev) => ({
          ...prev,
          party_name: '',
          village: '',
          depth: '',
          rpm_start: '',
          rpm_end: '',
          cash_advance: '',
          remarks: '',
        }));
        setTimeout(() => setSuccess(null), 5000);
      } else {
        setError(json.message || 'Error submitting report.');
      }
    } catch (err: any) {
      setError('Network communication error saving report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner with Prefill */}
      <div className="bg-white border border-blue-100 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <h3 className="font-extrabold text-blue-950 text-base">Digital Daily Drilling Log Sheet</h3>
          <p className="text-xs text-slate-500">
            Locked to: <strong className="text-blue-700 font-mono">{vehicle?.vehicle_number}</strong>
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrefillPhotoSlip}
          className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Fill Reference Slip (Photo)</span>
        </button>
      </div>

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Physical Chit Form (White & Blue) */}
      <form onSubmit={handleSubmit} className="bg-white border-2 border-blue-400 rounded-2xl p-4 sm:p-6 shadow-md space-y-4">
        <div className="border-b-2 border-blue-300 pb-3 flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-blue-800">
            Physical Chit Replica • Daily Field Log
          </span>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
            {vehicle?.vehicle_number}
          </span>
        </div>

        {/* Two-Column Ledger Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x-2 divide-blue-300 border-2 border-blue-300 rounded-xl overflow-hidden bg-white">
          
          {/* LEFT COLUMN */}
          <div className="divide-y divide-blue-200">
            <div className="p-2.5 flex items-center justify-between gap-3">
              <label className="w-24 text-xs font-bold text-blue-900">Agent</label>
              <input
                type="text"
                placeholder="e.g. Subbu"
                value={form.agent_name}
                onChange={(e) => handleChange('agent_name', e.target.value)}
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-blue-200 rounded-lg text-slate-900 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="p-2.5 flex items-center justify-between gap-3">
              <label className="w-24 text-xs font-bold text-blue-900">P. No.</label>
              <input
                type="text"
                placeholder="e.g. 60"
                value={form.party_no}
                onChange={(e) => handleChange('party_no', e.target.value)}
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-blue-200 rounded-lg text-slate-900 text-xs font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="p-2.5 flex items-center justify-between gap-3 bg-blue-50/50">
              <label className="w-24 text-xs font-bold text-blue-950">P. Name *</label>
              <input
                type="text"
                required
                placeholder="Customer Name (e.g. City)"
                value={form.party_name}
                onChange={(e) => handleChange('party_name', e.target.value)}
                className="flex-1 px-3 py-1.5 bg-white border border-blue-300 rounded-lg text-slate-900 text-xs font-semibold focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="p-2.5 flex items-center justify-between gap-3 bg-blue-50/50">
              <label className="w-24 text-xs font-bold text-blue-950">Village *</label>
              <input
                type="text"
                required
                placeholder="Location (e.g. Damalacheruvu)"
                value={form.village}
                onChange={(e) => handleChange('village', e.target.value)}
                className="flex-1 px-3 py-1.5 bg-white border border-blue-300 rounded-lg text-slate-900 text-xs font-semibold focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="p-2.5 flex items-center justify-between gap-3 bg-blue-100/50">
              <label className="w-24 text-xs font-bold text-blue-950">Depth (ft) *</label>
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

            <div className="p-2.5 flex items-center justify-between gap-3">
              <label className="w-24 text-xs font-bold text-blue-900">MS Casing</label>
              <input
                type="number"
                step="any"
                placeholder="e.g. 0"
                value={form.ms_casing}
                onChange={(e) => handleChange('ms_casing', e.target.value)}
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-blue-200 rounded-lg text-slate-900 text-xs font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="p-2.5 flex items-center justify-between gap-3">
              <label className="w-24 text-xs font-bold text-blue-900">PVC Casing</label>
              <input
                type="number"
                step="any"
                placeholder="e.g. 40"
                value={form.pvc_casing}
                onChange={(e) => handleChange('pvc_casing', e.target.value)}
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-blue-200 rounded-lg text-slate-900 text-xs font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="p-2.5 flex items-center justify-between gap-3">
              <label className="w-24 text-xs font-bold text-blue-900">Rebore</label>
              <input
                type="text"
                placeholder="e.g. -"
                value={form.rebore}
                onChange={(e) => handleChange('rebore', e.target.value)}
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-blue-200 rounded-lg text-slate-900 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="p-2.5 space-y-1.5 bg-blue-50/70">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-blue-950">RPM Hours *</span>
                <span className="font-mono font-bold text-blue-800">Total: {rpmCalc.total} hrs</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="Start (6504.0)"
                  value={form.rpm_start}
                  onChange={(e) => handleChange('rpm_start', e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-blue-200 rounded-lg text-slate-900 text-xs font-mono"
                />
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="End (6511.3)"
                  value={form.rpm_end}
                  onChange={(e) => handleChange('rpm_end', e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-blue-200 rounded-lg text-slate-900 text-xs font-mono"
                />
              </div>
            </div>

            <div className="p-2.5 flex items-center justify-between gap-3">
              <label className="w-24 text-xs font-bold text-blue-900">Bit Num</label>
              <input
                type="text"
                placeholder="e.g. Ganesh"
                value={form.bit_number}
                onChange={(e) => handleChange('bit_number', e.target.value)}
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-blue-200 rounded-lg text-slate-900 text-xs"
              />
            </div>

            <div className="p-2.5 flex items-center justify-between gap-3">
              <label className="w-24 text-xs font-bold text-blue-900">Hammer</label>
              <input
                type="text"
                placeholder="e.g. Gam"
                value={form.hammer_type}
                onChange={(e) => handleChange('hammer_type', e.target.value)}
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-blue-200 rounded-lg text-slate-900 text-xs"
              />
            </div>

            <div className="p-2.5 flex items-center justify-between gap-3">
              <label className="w-24 text-xs font-bold text-blue-900">Diesel (L)</label>
              <input
                type="number"
                step="any"
                placeholder="e.g. 240"
                value={form.diesel_liters}
                onChange={(e) => handleChange('diesel_liters', e.target.value)}
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-blue-200 rounded-lg text-slate-900 text-xs font-mono"
              />
            </div>

            <div className="p-2.5 flex items-center justify-between gap-3 bg-blue-50/40">
              <label className="w-24 text-xs font-bold text-blue-950">Cash/Adv</label>
              <input
                type="text"
                placeholder="e.g. 20,000 - Subbu"
                value={form.cash_advance}
                onChange={(e) => handleChange('cash_advance', e.target.value)}
                className="flex-1 px-3 py-1.5 bg-white border border-blue-300 rounded-lg text-blue-950 text-xs font-bold"
              />
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="divide-y divide-blue-200">
            <div className="p-2.5 flex items-center justify-between gap-3">
              <label className="w-24 text-xs font-bold text-blue-900">Sub</label>
              <input
                type="text"
                placeholder="Sub-contractor"
                value={form.sub}
                onChange={(e) => handleChange('sub', e.target.value)}
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-blue-200 rounded-lg text-slate-900 text-xs"
              />
            </div>

            <div className="p-2.5 flex items-center justify-between gap-3">
              <label className="w-24 text-xs font-bold text-blue-900">Date *</label>
              <input
                type="date"
                required
                value={form.report_date}
                onChange={(e) => handleChange('report_date', e.target.value)}
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-blue-200 rounded-lg text-slate-900 text-xs font-mono"
              />
            </div>

            <div className="p-2.5 flex items-center justify-between gap-3 bg-blue-50/50">
              <label className="w-24 text-xs font-bold text-blue-950">B.Rate (₹/ft)</label>
              <input
                type="number"
                step="any"
                placeholder="e.g. 120"
                value={form.bore_rate}
                onChange={(e) => handleChange('bore_rate', e.target.value)}
                className="flex-1 px-3 py-1.5 bg-white border border-blue-300 rounded-lg text-slate-900 text-xs font-mono font-bold"
              />
            </div>

            <div className="p-2.5 flex items-center justify-between gap-3 bg-blue-50/50">
              <label className="w-24 text-xs font-bold text-blue-950">Rod Count</label>
              <input
                type="number"
                placeholder="e.g. 40"
                value={form.rod_count}
                onChange={(e) => handleChange('rod_count', e.target.value)}
                className="flex-1 px-3 py-1.5 bg-white border border-blue-300 rounded-lg text-slate-900 text-xs font-mono"
              />
            </div>

            <div className="p-2.5 flex items-center justify-between gap-3">
              <label className="w-24 text-xs font-bold text-blue-900">Welding</label>
              <input
                type="text"
                placeholder="e.g. 3 joints"
                value={form.welding_details}
                onChange={(e) => handleChange('welding_details', e.target.value)}
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-blue-200 rounded-lg text-slate-900 text-xs"
              />
            </div>

            <div className="p-2.5 flex items-center justify-between gap-3">
              <label className="w-24 text-xs font-bold text-blue-900">Recut</label>
              <input
                type="text"
                placeholder="e.g. -"
                value={form.recut}
                onChange={(e) => handleChange('recut', e.target.value)}
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-blue-200 rounded-lg text-slate-900 text-xs"
              />
            </div>

            <div className="p-2.5 flex items-center justify-between gap-3">
              <label className="w-24 text-xs font-bold text-blue-900">Flushing</label>
              <input
                type="text"
                placeholder="e.g. 45 mins"
                value={form.flushing}
                onChange={(e) => handleChange('flushing', e.target.value)}
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-blue-200 rounded-lg text-slate-900 text-xs"
              />
            </div>

            <div className="p-2.5 flex items-center justify-between gap-3 bg-blue-50/50">
              <label className="w-24 text-xs font-bold text-blue-950">Avg</label>
              <input
                type="number"
                step="any"
                placeholder="e.g. 109"
                value={form.avg_rpm}
                onChange={(e) => handleChange('avg_rpm', e.target.value)}
                className="flex-1 px-3 py-1.5 bg-white border border-blue-300 rounded-lg text-slate-900 text-xs font-mono"
              />
            </div>

            <div className="p-2.5 flex items-center justify-between gap-3">
              <label className="w-24 text-xs font-bold text-blue-900">Bit Size</label>
              <input
                type="text"
                placeholder="e.g. 161"
                value={form.bit_size}
                onChange={(e) => handleChange('bit_size', e.target.value)}
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-blue-200 rounded-lg text-slate-900 text-xs font-mono"
              />
            </div>

            <div className="p-2.5 flex items-center justify-between gap-3">
              <label className="w-24 text-xs font-bold text-blue-900">Driller</label>
              <input
                type="text"
                placeholder="e.g. Tharumal"
                value={form.driller_name}
                onChange={(e) => handleChange('driller_name', e.target.value)}
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-blue-200 rounded-lg text-slate-900 text-xs"
              />
            </div>

            <div className="p-2.5 flex items-center justify-between gap-3 bg-blue-100/50">
              <label className="w-24 text-xs font-bold text-blue-950">Est. Amount</label>
              <span className="text-sm font-mono font-black text-blue-950">
                ₹{((parseFloat(form.depth) || 0) * (parseFloat(form.bore_rate) || 0)).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Remarks */}
        <div className="p-3 bg-blue-50/40 border border-blue-200 rounded-xl">
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

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <Button type="submit" loading={submitting} disabled={!rpmCalc.isValid}>
            <Send className="w-4 h-4" />
            <span>Submit Daily Drilling Sheet</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
