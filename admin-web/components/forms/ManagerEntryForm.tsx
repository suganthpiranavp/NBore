'use client';

import React, { useState, useEffect } from 'react';
import { User } from '../../lib/types';
import Input from '../common/Input';
import Button from '../common/Button';
import Badge from '../common/Badge';
import MachineryStatsSection from './MachineryStatsSection';
import FinancialSummarySection from './FinancialSummarySection';
import {
  calculateMsCasing,
  calculateFlushing,
  calculateWelding,
  calculateRecutting,
  calculatePvcCasing,
  calculateRebore,
  calculateDiesel,
  calculateRpm,
  calculateFinancialSummary,
  getMsCasingRate,
} from '../../lib/calculations';
import {
  Lock,
  Unlock,
  CheckCircle2,
  Calendar,
  MapPin,
  User as UserIcon,
  Layers,
  Flame,
  FileText,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

interface ManagerEntryFormProps {
  managerUser: User;
  onSuccess?: () => void;
}

export default function ManagerEntryForm({ managerUser, onSuccess }: ManagerEntryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State (22 Comprehensive Fields)
  const [formData, setFormData] = useState({
    // 1-3. Agents & Date
    agent: '',
    subAgent: '',
    date: new Date().toISOString().split('T')[0],

    // 4-6. Party & Location
    pNo: '',
    pName: '',
    placeVillage: '',

    // 7-9. Bore Base & Depth
    bRate: 120,
    depth: 0,
    rod: 25,

    // 10. M.S. Casing (with Contra Edit support)
    msFeet: 0,
    msCustomRate: 120,
    isMsContraEdit: false,

    // 11. Welding (Default rate ₹250)
    weldingCount: 0,
    weldingRate: 250,

    // 12. PVC Casing
    pvcFeet: 0,
    pvcRate: 210,

    // 13. Recutting (Default rate ₹140)
    recuttingCount: 0,
    recuttingRate: 140,

    // 14. Rebore
    reboreFeet: 0,
    reboreRate: 0,

    // 15. Flushing
    flushingFeet: 0,
    flushingCustomRate: undefined as number | undefined,

    // 16. RPM Details
    sRpm: 0,
    runRpm: 0,
    cRpm: 0,

    // 17. Bit Details
    bitMax: 0,
    bitMin: 0,
    bitMm: 0,

    // 18. Hammer Details
    hammerCompany: '',
    hammerNum: '',
    hammerDepth: 0,

    // 19. Diesel
    dieselLiters: 0,
    dieselRate: 94.5,

    // 20. Cash Received
    cashReceived: 0,

    // 21. Driller Name
    drillerName: '',

    // 22. Remarks
    boreRemarks: '',
  });

  // Dynamic calculations
  const msCalc = calculateMsCasing({
    feet: formData.msFeet,
    depth: formData.depth,
    customRate: formData.msCustomRate,
    isManualOverride: formData.isMsContraEdit,
  });

  const flushingCalc = calculateFlushing({
    feet: formData.flushingFeet,
    customRate: formData.flushingCustomRate,
  });

  const weldingCalc = calculateWelding(formData.weldingCount, formData.weldingRate);
  const recuttingCalc = calculateRecutting(formData.recuttingCount, formData.recuttingRate);
  const pvcCalc = calculatePvcCasing(formData.pvcFeet, formData.pvcRate);
  const reboreCalc = calculateRebore(formData.reboreFeet, formData.reboreRate);
  const dieselCalc = calculateDiesel(formData.dieselLiters, formData.dieselRate);
  const rpmCalc = calculateRpm(formData.sRpm, formData.runRpm, formData.cRpm);

  const financialSummary = calculateFinancialSummary({
    depth: formData.depth,
    bRate: formData.bRate,
    msCasingTotal: msCalc.total,
    pvcCasingTotal: pvcCalc.total,
    weldingTotal: weldingCalc.total,
    recuttingTotal: recuttingCalc.total,
    reboreTotal: reboreCalc.total,
    flushingTotal: flushingCalc.total,
    cashReceived: formData.cashReceived,
  });

  // If Contra Edit is turned off, sync msCustomRate back to standard slab rate
  useEffect(() => {
    if (!formData.isMsContraEdit) {
      setFormData((prev) => ({
        ...prev,
        msCustomRate: getMsCasingRate(prev.depth),
      }));
    }
  }, [formData.depth, formData.isMsContraEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!formData.pName.trim()) {
      setErrorMessage('Party Name (Field 5) is required.');
      setIsSubmitting(false);
      return;
    }
    if (!formData.placeVillage.trim()) {
      setErrorMessage('Village / Location (Field 6) is required.');
      setIsSubmitting(false);
      return;
    }
    if (formData.depth <= 0) {
      setErrorMessage('Total drilled depth (Field 8) must be greater than 0.');
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        vehicleId: managerUser.assigned_vehicle_id || 1,
        vehicleNumber: managerUser.vehicle_number || 'NBW 6656',
        managerId: managerUser.id,
        managerName: managerUser.name,

        agent: formData.agent,
        subAgent: formData.subAgent,
        date: formData.date,
        pNo: formData.pNo,
        pName: formData.pName,
        placeVillage: formData.placeVillage,
        bRate: formData.bRate,
        depth: formData.depth,
        rod: formData.rod,

        msCasing: msCalc,
        welding: weldingCalc,
        pvcCasing: pvcCalc,
        recutting: recuttingCalc,
        rebore: reboreCalc,
        flushing: flushingCalc,

        rpmDetails: rpmCalc,
        bitDetails: {
          max: formData.bitMax,
          min: formData.bitMin,
          mm: formData.bitMm,
        },
        hammerDetails: {
          company: formData.hammerCompany,
          num: formData.hammerNum,
          depth: formData.hammerDepth,
        },
        diesel: dieselCalc,

        cashReceived: formData.cashReceived,
        drillerName: formData.drillerName,
        boreRemarks: formData.boreRemarks,

        grossBoreCost: financialSummary.grossBoreCost,
        balanceDue: financialSummary.balanceDue,
      };

      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (json.success) {
        setSuccessMessage(
          `Entry successfully recorded! Receipt ref #${json.data.id} saved for ${managerUser.vehicle_number || 'designated vehicle'}.`
        );
        // Reset non-fixed fields
        setFormData((prev) => ({
          ...prev,
          pNo: '',
          pName: '',
          placeVillage: '',
          depth: 0,
          msFeet: 0,
          weldingCount: 0,
          pvcFeet: 0,
          recuttingCount: 0,
          reboreFeet: 0,
          flushingFeet: 0,
          cashReceived: 0,
          boreRemarks: '',
        }));
        if (onSuccess) onSuccess();
      } else {
        setErrorMessage(json.message || 'Failed to submit entry.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error occurred while submitting entry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Vehicle Lock Banner */}
      <div className="bg-blue-600 rounded-2xl p-4 sm:p-5 text-white shadow-md shadow-blue-500/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-bold text-lg">
            🚛
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-extrabold text-blue-200">
                Designated Rig
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-white text-blue-800">
                LOCKED
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight">
              {managerUser.vehicle_number || 'NBW 6656'}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold text-blue-100 bg-blue-700/60 px-3.5 py-2 rounded-xl">
          <span>Logged Manager: {managerUser.name}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Strict Vehicle Isolation Active</span>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-bold animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs font-bold animate-fadeIn">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* SECTION 1: Header, Date & Site Information (Fields 1–6) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <MapPin className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
            Site, Customer & Agent Info (Fields 1–6)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Agent Name (Field 1)"
            value={formData.agent}
            onChange={(e) => setFormData({ ...formData, agent: e.target.value })}
            placeholder="e.g. Subbu"
          />
          <Input
            label="Sub-Agent Name (Field 2)"
            value={formData.subAgent}
            onChange={(e) => setFormData({ ...formData, subAgent: e.target.value })}
            placeholder="e.g. Kishore"
          />
          <Input
            label="Drilling Work Date (Field 3)"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <Input
            label="Party Number / P.No (Field 4)"
            value={formData.pNo}
            onChange={(e) => setFormData({ ...formData, pNo: e.target.value })}
            placeholder="e.g. PT-60"
          />
          <Input
            label="Party / Customer Name (Field 5) *"
            value={formData.pName}
            onChange={(e) => setFormData({ ...formData, pName: e.target.value })}
            placeholder="e.g. Lakshmi Textiles Farm"
            required
          />
          <Input
            label="Village / Site Location (Field 6) *"
            value={formData.placeVillage}
            onChange={(e) => setFormData({ ...formData, placeVillage: e.target.value })}
            placeholder="e.g. Damalacheruvu"
            required
          />
        </div>
      </div>

      {/* SECTION 2: Bore Depths, Rod & Rates (Fields 7–9) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Layers className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
            Drilling Depths & Rod Specs (Fields 7–9)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Bore Base Rate (₹/ft) (Field 7)"
            type="number"
            value={formData.bRate || ''}
            onChange={(e) => setFormData({ ...formData, bRate: parseFloat(e.target.value) || 0 })}
            helperText="Default standard ₹120/ft"
          />
          <Input
            label="Total Depth Drilled (ft) (Field 8) *"
            type="number"
            value={formData.depth || ''}
            onChange={(e) => setFormData({ ...formData, depth: parseFloat(e.target.value) || 0 })}
            badge="Calculates Slabs"
            placeholder="e.g. 650"
            required
          />
          <Input
            label="Rod Count / Length (Field 9)"
            type="number"
            value={formData.rod || ''}
            onChange={(e) => setFormData({ ...formData, rod: parseFloat(e.target.value) || 0 })}
            helperText="Default standard: 25 rods"
          />
        </div>
      </div>

      {/* SECTION 3: Casing & Operations (Fields 10–15) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Flame className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
            Casing, Welding & Operations (Fields 10–15)
          </h3>
        </div>

        {/* 10. M.S. Casing with Contra Edit Override */}
        <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800">
                10. M.S. Casing Slabs (Depth-derived)
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                Slab: ₹{getMsCasingRate(formData.depth)}/ft
              </span>
            </div>

            {/* Contra Edit Toggle */}
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  isMsContraEdit: !prev.isMsContraEdit,
                }))
              }
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                formData.isMsContraEdit
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {formData.isMsContraEdit ? (
                <>
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Contra Edit Active</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Contra Edit (Override)</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="M.S. Casing (Feet)"
              type="number"
              value={formData.msFeet || ''}
              onChange={(e) =>
                setFormData({ ...formData, msFeet: parseFloat(e.target.value) || 0 })
              }
              placeholder="0"
            />
            <Input
              label={`Rate per Foot (₹)${formData.isMsContraEdit ? ' (Manual Override)' : ''}`}
              type="number"
              value={msCalc.rate || ''}
              onChange={(e) =>
                formData.isMsContraEdit &&
                setFormData({ ...formData, msCustomRate: parseFloat(e.target.value) || 0 })
              }
              readOnly={!formData.isMsContraEdit}
              className={!formData.isMsContraEdit ? 'bg-slate-100 cursor-not-allowed' : 'bg-white border-amber-300 font-bold'}
            />
            <Input
              label="M.S. Total Amount (₹)"
              type="number"
              value={msCalc.total || ''}
              readOnly
              className="bg-slate-100 font-bold text-slate-900 cursor-not-allowed"
            />
          </div>
        </div>

        {/* 11 & 12: Welding & PVC Casing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-slate-700 block">
              11. Welding Operations (Default ₹250/joint)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Joint Count"
                type="number"
                value={formData.weldingCount || ''}
                onChange={(e) =>
                  setFormData({ ...formData, weldingCount: parseFloat(e.target.value) || 0 })
                }
                placeholder="0"
              />
              <Input
                label="Welding Total (₹)"
                type="number"
                value={weldingCalc.total || ''}
                readOnly
                className="bg-white font-bold"
              />
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-slate-700 block">
              12. PVC Casing (Pipes & Joints)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="PVC Feet"
                type="number"
                value={formData.pvcFeet || ''}
                onChange={(e) =>
                  setFormData({ ...formData, pvcFeet: parseFloat(e.target.value) || 0 })
                }
                placeholder="0"
              />
              <Input
                label="Rate (₹/ft)"
                type="number"
                value={formData.pvcRate || ''}
                onChange={(e) =>
                  setFormData({ ...formData, pvcRate: parseFloat(e.target.value) || 0 })
                }
                placeholder="210"
              />
            </div>
          </div>
        </div>

        {/* 13, 14 & 15: Recutting, Rebore & Flushing */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-slate-700 block">
              13. Recutting (₹140/unit)
            </span>
            <Input
              label="Recutting Count"
              type="number"
              value={formData.recuttingCount || ''}
              onChange={(e) =>
                setFormData({ ...formData, recuttingCount: parseFloat(e.target.value) || 0 })
              }
              placeholder="0"
            />
            <div className="text-xs font-extrabold text-slate-800 text-right">
              Total: ₹{recuttingCalc.total}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-slate-700 block">
              14. Rebore Operations
            </span>
            <Input
              label="Rebore Feet"
              type="number"
              value={formData.reboreFeet || ''}
              onChange={(e) =>
                setFormData({ ...formData, reboreFeet: parseFloat(e.target.value) || 0 })
              }
              placeholder="0"
            />
            <Input
              label="Rebore Rate (₹/ft)"
              type="number"
              value={formData.reboreRate || ''}
              onChange={(e) =>
                setFormData({ ...formData, reboreRate: parseFloat(e.target.value) || 0 })
              }
              placeholder="0"
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 block">
                15. Flushing (Slabs)
              </span>
              <span className="text-[10px] font-bold text-blue-600">
                ₹{flushingCalc.rate}/ft
              </span>
            </div>
            <Input
              label="Flushing Feet"
              type="number"
              value={formData.flushingFeet || ''}
              onChange={(e) =>
                setFormData({ ...formData, flushingFeet: parseFloat(e.target.value) || 0 })
              }
              placeholder="0"
            />
            <div className="text-xs font-extrabold text-slate-800 text-right">
              Total: ₹{flushingCalc.total}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: Machinery Telemetry & Diesel (Fields 16–19 & 21) */}
      <MachineryStatsSection
        rpmDetails={rpmCalc}
        onRpmChange={(field, val) => setFormData({ ...formData, [field]: val })}
        bitDetails={{ max: formData.bitMax, min: formData.bitMin, mm: formData.bitMm }}
        onBitChange={(field, val) =>
          setFormData({
            ...formData,
            [field === 'max' ? 'bitMax' : field === 'min' ? 'bitMin' : 'bitMm']: val,
          })
        }
        hammerDetails={{
          company: formData.hammerCompany,
          num: formData.hammerNum,
          depth: formData.hammerDepth,
        }}
        onHammerChange={(field, val) =>
          setFormData({
            ...formData,
            [field === 'company'
              ? 'hammerCompany'
              : field === 'num'
              ? 'hammerNum'
              : 'hammerDepth']: val,
          })
        }
        diesel={dieselCalc}
        onDieselChange={(field, val) =>
          setFormData({
            ...formData,
            [field === 'liters' ? 'dieselLiters' : 'dieselRate']: val,
          })
        }
        drillerName={formData.drillerName}
        onDrillerNameChange={(val) => setFormData({ ...formData, drillerName: val })}
      />

      {/* SECTION 5: Financials & Site Remarks (Fields 20 & 22) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <FileText className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
            Cash Collection & Operational Remarks (Fields 20 & 22)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Cash Received / Advance Collected (Field 20) (₹)"
            type="number"
            value={formData.cashReceived || ''}
            onChange={(e) =>
              setFormData({ ...formData, cashReceived: parseFloat(e.target.value) || 0 })
            }
            placeholder="0"
            helperText="Direct cash or UPI advance received from customer on site"
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 tracking-wide">
              Site & Bore Remarks (Field 22)
            </label>
            <textarea
              rows={2}
              value={formData.boreRemarks}
              onChange={(e) => setFormData({ ...formData, boreRemarks: e.target.value })}
              placeholder="e.g. Formation, boulder layer depth, water struck ft, or special billing notes..."
              className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>
        </div>
      </div>

      {/* SECTION 6: Automated Dynamic Financial Summary */}
      <FinancialSummarySection
        summary={financialSummary}
        details={{
          depth: formData.depth,
          bRate: formData.bRate,
          msCasingTotal: msCalc.total,
          msRate: msCalc.rate,
          isMsOverride: formData.isMsContraEdit,
          pvcTotal: pvcCalc.total,
          weldingTotal: weldingCalc.total,
          recuttingTotal: recuttingCalc.total,
          reboreTotal: reboreCalc.total,
          flushingTotal: flushingCalc.total,
          flushingRate: flushingCalc.rate,
        }}
      />

      {/* Submit Action */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (confirm('Clear form fields and start over?')) {
              window.location.reload();
            }
          }}
          icon={<RotateCcw className="w-4 h-4" />}
        >
          Reset Form
        </Button>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
          icon={<CheckCircle2 className="w-5 h-5" />}
        >
          Submit Digital Log Chit ({managerUser.vehicle_number || 'Locked Rig'})
        </Button>
      </div>
    </form>
  );
}
