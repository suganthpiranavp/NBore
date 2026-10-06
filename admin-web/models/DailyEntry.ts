/**
 * ==============================================================================
 * Daily Entry Model (/models/DailyEntry.ts)
 * Enterprise-grade logging model mapped to all 22 drilling sheet fields.
 * ==============================================================================
 */

import { getDb } from '../lib/db';
import { calculateFinancialSummary } from '../lib/calculations';

export interface DailyEntryInterface {
  id: string;
  vehicleId: number;
  vehicleNumber: string;
  managerId: string;
  managerName: string;

  // 22 Comprehensive Form Fields
  agent: string;
  subAgent: string;
  date: string;
  pNo: string;
  pName: string;
  placeVillage: string;
  bRate: number;
  depth: number;
  rod: number;
  msCasing: { feet: number; rate: number; total: number; isManualOverride: boolean };
  welding: { count: number; ratePerUnit: number; total: number };
  pvcCasing: { feet: number; rate: number; total: number };
  recutting: { count: number; ratePerUnit: number; total: number };
  rebore: { feet: number; rate: number; total: number };
  flushing: { feet: number; rate: number; total: number };
  rpmDetails: { sRpm: number; runRpm: number; cRpm: number; avgRpm: number };
  bitDetails: { max: number; min: number; mm: number };
  hammerDetails: { company: string; num: string; depth: number };
  diesel: { liters: number; ratePerLiter: number; totalCost: number };
  cashReceived: number;
  drillerName: string;
  boreRemarks: string;

  // Auto-calculated summary fields
  grossBoreCost: number;
  balanceDue: number;
  createdAt: string;
}

export class DailyEntryModel {
  static async getAll(): Promise<DailyEntryInterface[]> {
    const db = getDb();
    return [...db.entries].sort(
      (a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime()
    );
  }

  static async getByVehicle(vehicleId: number | string): Promise<DailyEntryInterface[]> {
    const db = getDb();
    const vid = Number(vehicleId);
    return db.entries
      .filter((e) => Number(e.vehicleId) === vid)
      .sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime());
  }

  static async getByVehicleId(vehicleId: number | string): Promise<DailyEntryInterface[]> {
    return this.getByVehicle(vehicleId);
  }

  static async create(data: any): Promise<DailyEntryInterface> {
    const db = getDb();

    // Reconcile calculations server-side for integrity
    const msTotal = Number(data.msCasing?.total) || (Number(data.msCasing?.feet || 0) * Number(data.msCasing?.rate || 120));
    const pvcTotal = Number(data.pvcCasing?.total) || (Number(data.pvcCasing?.feet || 0) * Number(data.pvcCasing?.rate || 0));
    const weldingTotal = Number(data.welding?.total) || (Number(data.welding?.count || 0) * Number(data.welding?.ratePerUnit || 250));
    const recuttingTotal = Number(data.recutting?.total) || (Number(data.recutting?.count || 0) * Number(data.recutting?.ratePerUnit || 140));
    const reboreTotal = Number(data.rebore?.total) || (Number(data.rebore?.feet || 0) * Number(data.rebore?.rate || 0));
    const flushingTotal = Number(data.flushing?.total) || (Number(data.flushing?.feet || 0) * Number(data.flushing?.rate || 40));

    const fin = calculateFinancialSummary({
      depth: Number(data.depth) || 0,
      bRate: Number(data.bRate) || 120,
      msCasingTotal: msTotal,
      pvcCasingTotal: pvcTotal,
      weldingTotal,
      recuttingTotal,
      reboreTotal,
      flushingTotal,
      cashReceived: Number(data.cashReceived) || 0,
    });

    const newEntry: DailyEntryInterface = {
      id: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      vehicleId: Number(data.vehicleId),
      vehicleNumber: data.vehicleNumber || `Rig #${data.vehicleId}`,
      managerId: data.managerId,
      managerName: data.managerName,

      agent: data.agent || '',
      subAgent: data.subAgent || '',
      date: data.date || new Date().toISOString().split('T')[0],
      pNo: data.pNo || '',
      pName: data.pName || 'Direct Customer',
      placeVillage: data.placeVillage || 'Site',
      bRate: Number(data.bRate) || 120,
      depth: Number(data.depth) || 0,
      rod: Number(data.rod) || 25,

      msCasing: {
        feet: Number(data.msCasing?.feet) || 0,
        rate: Number(data.msCasing?.rate) || 120,
        total: msTotal,
        isManualOverride: Boolean(data.msCasing?.isManualOverride),
      },
      welding: {
        count: Number(data.welding?.count) || 0,
        ratePerUnit: Number(data.welding?.ratePerUnit) || 250,
        total: weldingTotal,
      },
      pvcCasing: {
        feet: Number(data.pvcCasing?.feet) || 0,
        rate: Number(data.pvcCasing?.rate) || 0,
        total: pvcTotal,
      },
      recutting: {
        count: Number(data.recutting?.count) || 0,
        ratePerUnit: Number(data.recutting?.ratePerUnit) || 140,
        total: recuttingTotal,
      },
      rebore: {
        feet: Number(data.rebore?.feet) || 0,
        rate: Number(data.rebore?.rate) || 0,
        total: reboreTotal,
      },
      flushing: {
        feet: Number(data.flushing?.feet) || 0,
        rate: Number(data.flushing?.rate) || 40,
        total: flushingTotal,
      },
      rpmDetails: {
        sRpm: Number(data.rpmDetails?.sRpm) || 0,
        runRpm: Number(data.rpmDetails?.runRpm) || 0,
        cRpm: Number(data.rpmDetails?.cRpm) || 0,
        avgRpm: Number(data.rpmDetails?.avgRpm) || 0,
      },
      bitDetails: {
        max: Number(data.bitDetails?.max) || 0,
        min: Number(data.bitDetails?.min) || 0,
        mm: Number(data.bitDetails?.mm) || 0,
      },
      hammerDetails: {
        company: data.hammerDetails?.company || '',
        num: data.hammerDetails?.num || '',
        depth: Number(data.hammerDetails?.depth) || 0,
      },
      diesel: {
        liters: Number(data.diesel?.liters) || 0,
        ratePerLiter: Number(data.diesel?.ratePerLiter) || 0,
        totalCost: Number(data.diesel?.totalCost) || (Number(data.diesel?.liters || 0) * Number(data.diesel?.ratePerLiter || 0)),
      },
      cashReceived: Number(data.cashReceived) || 0,
      drillerName: data.drillerName || '',
      boreRemarks: data.boreRemarks || '',

      grossBoreCost: fin.grossBoreCost,
      balanceDue: fin.balanceDue,
      createdAt: new Date().toISOString(),
    };

    db.entries.unshift(newEntry);
    return newEntry;
  }
}

export default DailyEntryModel;
