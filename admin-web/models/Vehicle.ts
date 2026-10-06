import { getDb } from '../lib/db';

export interface VehicleInterface {
  id: number;
  vehicle_number: string;
  rig_name: string;
  chassis_number?: string;
  compressor_model?: string;
  status: string;
  manager_id?: string | null;
  manager_name?: string;
  manager_phone?: string;
  total_reports?: number;
  total_depth_drilled?: number;
  total_diesel_consumed?: number;
  total_rpm_hours?: number;
}

export class VehicleModel {
  static async getAllWithStats(): Promise<VehicleInterface[]> {
    const db = getDb();
    return db.vehicles.map((v) => {
      const assignedMgr = db.users.find(
        (u) => u.assigned_vehicle_id === v.id && u.role === 'MANAGER'
      );
      const vehicleEntries = db.entries.filter((e) => e.vehicle_id === v.id);

      const totalDepth = vehicleEntries.reduce((acc, curr) => acc + (Number(curr.depth) || 0), 0);
      const totalDiesel = vehicleEntries.reduce((acc, curr) => acc + (Number(curr.diesel_liters) || 0), 0);
      const totalRpm = vehicleEntries.reduce((acc, curr) => acc + (Number(curr.rpm_total) || 0), 0);

      return {
        ...v,
        manager_id: assignedMgr ? assignedMgr.id : null,
        manager_name: assignedMgr ? assignedMgr.name : 'Unassigned',
        manager_phone: assignedMgr ? assignedMgr.phone : '-',
        total_reports: vehicleEntries.length,
        total_depth_drilled: parseFloat(totalDepth.toFixed(2)),
        total_diesel_consumed: parseFloat(totalDiesel.toFixed(2)),
        total_rpm_hours: parseFloat(totalRpm.toFixed(2)),
      };
    });
  }

  static async findById(id: number): Promise<VehicleInterface | null> {
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
