'use client';

import React from 'react';
import Input from '../common/Input';
import { Gauge, Fuel, Hammer, Wrench } from 'lucide-react';

interface MachineryStatsSectionProps {
  rpmDetails: { sRpm: number; runRpm: number; cRpm: number; avgRpm: number };
  onRpmChange: (field: string, value: number) => void;
  bitDetails: { max: number; min: number; mm: number };
  onBitChange: (field: string, value: number) => void;
  hammerDetails: { company: string; num: string; depth: number };
  onHammerChange: (field: string, value: any) => void;
  diesel: { liters: number; ratePerLiter: number; totalCost: number };
  onDieselChange: (field: string, value: number) => void;
  drillerName: string;
  onDrillerNameChange: (value: string) => void;
}

export default function MachineryStatsSection({
  rpmDetails,
  onRpmChange,
  bitDetails,
  onBitChange,
  hammerDetails,
  onHammerChange,
  diesel,
  onDieselChange,
  drillerName,
  onDrillerNameChange,
}: MachineryStatsSectionProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-6">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <Gauge className="w-5 h-5 text-blue-600" />
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
          Machinery Telemetry & Consumables (Fields 16–19 & 21)
        </h3>
      </div>

      {/* 16. RPM Details */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <span>⚙️</span> RPM Metrics (Start, Running, Compressor)
          </span>
          <span className="text-xs font-extrabold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
            Avg Operating: {rpmDetails.avgRpm} RPM
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <Input
            label="Start RPM (sRpm)"
            type="number"
            value={rpmDetails.sRpm || ''}
            onChange={(e) => onRpmChange('sRpm', parseFloat(e.target.value) || 0)}
            placeholder="0"
          />
          <Input
            label="Run RPM (runRpm)"
            type="number"
            value={rpmDetails.runRpm || ''}
            onChange={(e) => onRpmChange('runRpm', parseFloat(e.target.value) || 0)}
            placeholder="0"
          />
          <Input
            label="Compressor RPM (cRpm)"
            type="number"
            value={rpmDetails.cRpm || ''}
            onChange={(e) => onRpmChange('cRpm', parseFloat(e.target.value) || 0)}
            placeholder="0"
          />
          <Input
            label="Calculated Avg RPM"
            type="number"
            value={rpmDetails.avgRpm || ''}
            readOnly
            className="bg-slate-50 font-bold text-blue-700 cursor-not-allowed"
          />
        </div>
      </div>

      {/* 17. Bit Details */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <Wrench className="w-4 h-4 text-slate-500" />
          Bit Measurements (Max, Min, MM)
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Max Bit Gauge"
            type="number"
            value={bitDetails.max || ''}
            onChange={(e) => onBitChange('max', parseFloat(e.target.value) || 0)}
            placeholder="e.g. 165"
          />
          <Input
            label="Min Bit Gauge"
            type="number"
            value={bitDetails.min || ''}
            onChange={(e) => onBitChange('min', parseFloat(e.target.value) || 0)}
            placeholder="e.g. 150"
          />
          <Input
            label="Bit Caliber (MM)"
            type="number"
            value={bitDetails.mm || ''}
            onChange={(e) => onBitChange('mm', parseFloat(e.target.value) || 0)}
            placeholder="e.g. 161"
          />
        </div>
      </div>

      {/* 18. Hammer Details */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <Hammer className="w-4 h-4 text-slate-500" />
          Hammer Specification
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Hammer Brand / Company"
            value={hammerDetails.company}
            onChange={(e) => onHammerChange('company', e.target.value)}
            placeholder="e.g. Secoroc / Sandvik"
          />
          <Input
            label="Hammer Serial / Num"
            value={hammerDetails.num}
            onChange={(e) => onHammerChange('num', e.target.value)}
            placeholder="e.g. HAM-007"
          />
          <Input
            label="Hammer Tested Depth (ft)"
            type="number"
            value={hammerDetails.depth || ''}
            onChange={(e) => onHammerChange('depth', parseFloat(e.target.value) || 0)}
            placeholder="0"
          />
        </div>
      </div>

      {/* 19. Diesel Consumables & 21. Driller */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <Input
            label="Diesel Consumed (Liters)"
            type="number"
            leftIcon={<Fuel className="w-4 h-4" />}
            value={diesel.liters || ''}
            onChange={(e) => onDieselChange('liters', parseFloat(e.target.value) || 0)}
            placeholder="0"
          />
          <Input
            label="Rate per Liter (₹)"
            type="number"
            value={diesel.ratePerLiter || ''}
            onChange={(e) => onDieselChange('ratePerLiter', parseFloat(e.target.value) || 0)}
            placeholder="e.g. 94.50"
          />
          <Input
            label="Total Diesel Cost (₹)"
            type="number"
            value={diesel.totalCost || ''}
            readOnly
            className="bg-slate-50 font-bold text-slate-900 cursor-not-allowed"
          />
          <Input
            label="Head Driller Name (Field 21)"
            value={drillerName}
            onChange={(e) => onDrillerNameChange(e.target.value)}
            placeholder="e.g. Tharumal"
          />
        </div>
      </div>
    </div>
  );
}
