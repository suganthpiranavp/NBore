/**
 * ==============================================================================
 * Vehicle Model (/models/Vehicle.ts)
 * Represents the 3 locked fleet rigs of Nithya Borewells:
 * 1. NBW 6656
 * 2. SNBW 4748 (Sensor)
 * 3. NBW 4656 (Sensor)
 * ==============================================================================
 */

import { getDb } from '../lib/db';

export interface VehicleInterface {
  id: number;
  vehicle_number: string;
  rig_name: string;
  sensor_enabled: boolean;
  status: string;
  manager_id?: string | null;
  manager_name?: string;
  manager_phone?: string;
  total_reports?: number;
  total_depth_drilled?: number;
  total_diesel_consumed?: number;
  total_revenue?: number;
}

export class VehicleModel {
  static async getAllWithStats(): Promise<VehicleInterface[]> {
    const db = getDb();

    return db.vehicles.map((v) => {
      const assignedMgr = db.users.find(
        (u) => u.assigned_vehicle_id === v.id && u.role === 'MANAGER'
      );
      const vehicleEntries = db.entries.filter((e) => Number(e.vehicleId) === v.id);

      const totalDepth = vehicleEntries.reduce((acc, curr) => acc + (Number(curr.depth) || 0), 0);
      const totalDiesel = vehicleEntries.reduce(
        (acc, curr) => acc + (Number(curr.diesel?.liters) || 0),
        0
      );
      const totalRevenue = vehicleEntries.reduce(
        (acc, curr) => acc + (Number(curr.grossBoreCost) || 0),
        0
      );

      return {
        ...v,
        manager_id: assignedMgr ? assignedMgr.id : null,
        manager_name: assignedMgr ? assignedMgr.name : 'Unassigned',
        manager_phone: assignedMgr ? assignedMgr.phone : '-',
        total_reports: vehicleEntries.length,
        total_depth_drilled: parseFloat(totalDepth.toFixed(1)),
        total_diesel_consumed: parseFloat(totalDiesel.toFixed(1)),
        total_revenue: parseFloat(totalRevenue.toFixed(2)),
      };
    });
  }

  static async findById(id: number | string): Promise<VehicleInterface | null> {
    const db = getDb();
    const v = db.vehicles.find((item) => item.id === Number(id));
    if (!v) return null;

    const assignedMgr = db.users.find(
      (u) => u.assigned_vehicle_id === v.id && u.role === 'MANAGER'
    );

    return {
      ...v,
      manager_id: assignedMgr ? assignedMgr.id : null,
      manager_name: assignedMgr ? assignedMgr.name : 'Unassigned',
      manager_phone: assignedMgr ? assignedMgr.phone : '-',
    };
  }
}

export default VehicleModel;
