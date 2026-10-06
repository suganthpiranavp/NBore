'use client';

import React from 'react';
import { IndianRupee, Calculator, CheckCircle2, AlertCircle } from 'lucide-react';
import Badge from '../common/Badge';

interface FinancialSummaryProps {
  summary: {
    drillingBaseCost: number;
    casingAndOperationsCost: number;
    grossBoreCost: number;
    cashReceived: number;
    balanceDue: number;
  };
  details: {
    depth: number;
    bRate: number;
    msCasingTotal: number;
    msRate: number;
    isMsOverride: boolean;
    pvcTotal: number;
    weldingTotal: number;
    recuttingTotal: number;
    reboreTotal: number;
    flushingTotal: number;
    flushingRate: number;
  };
}

export default function FinancialSummarySection({
  summary,
  details,
}: FinancialSummaryProps) {
  const isFullySettled = summary.balanceDue <= 0 && summary.grossBoreCost > 0;

  return (
    <div className="bg-gradient-to-br from-white to-blue-50/40 rounded-2xl border-2 border-blue-200 p-6 shadow-md space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-blue-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              Automated Financial Reconciliation & Slabs
            </h3>
            <p className="text-xs text-slate-500">
              Live calculation verified per Nithya Borewells enterprise pricing policy
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {details.isMsOverride && (
            <Badge variant="warning" size="sm">
              Contra Override Active
            </Badge>
          )}
          {isFullySettled ? (
            <Badge variant="success" size="sm">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Fully Settled
              </span>
            </Badge>
          ) : (
            <Badge variant="blue" size="sm">
              Payment Pending
            </Badge>
          )}
        </div>
      </div>

      {/* Itemized Cost Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 block uppercase">
            Base Bore ({details.depth}ft @ ₹{details.bRate})
          </span>
          <span className="text-sm font-extrabold text-slate-900 mt-1 block">
            ₹{summary.drillingBaseCost.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">
              M.S. Casing
            </span>
            <span className="text-[10px] font-bold text-blue-600">
              ₹{details.msRate}/ft
            </span>
          </div>
          <span className="text-sm font-extrabold text-slate-900 mt-1 block">
            ₹{details.msCasingTotal.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 block uppercase">
            Flushing (Slab ₹{details.flushingRate}/ft)
          </span>
          <span className="text-sm font-extrabold text-slate-900 mt-1 block">
            ₹{details.flushingTotal.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 block uppercase">
            Welding & Recutting
          </span>
          <span className="text-sm font-extrabold text-slate-900 mt-1 block">
            ₹{(details.weldingTotal + details.recuttingTotal).toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Grand Totals Callout */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="bg-blue-600 rounded-xl p-4 text-white shadow-md shadow-blue-500/20">
          <span className="text-[11px] font-bold text-blue-100 uppercase tracking-wider block">
            Gross Bore Cost
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black tracking-tight">
              ₹{summary.grossBoreCost.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-[10px] text-blue-200 mt-1">
            Drilling base + casing, joints & operations
          </p>
        </div>

        <div className="bg-emerald-600 rounded-xl p-4 text-white shadow-md shadow-emerald-500/20">
          <span className="text-[11px] font-bold text-emerald-100 uppercase tracking-wider block">
            Cash / Advance Received
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black tracking-tight">
              ₹{summary.cashReceived.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-[10px] text-emerald-200 mt-1">
            Verified on-site collection
          </p>
        </div>

        <div
          className={`rounded-xl p-4 text-white shadow-md ${
            summary.balanceDue > 0
              ? 'bg-slate-900 shadow-slate-900/20'
              : 'bg-emerald-700 shadow-emerald-700/20'
          }`}
        >
          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
            Net Balance Due
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black tracking-tight">
              ₹{summary.balanceDue.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-[10px] text-slate-300 mt-1">
            {summary.balanceDue > 0 ? 'Remaining to be recovered' : 'Invoice fully balanced'}
          </p>
        </div>
      </div>
    </div>
  );
}
