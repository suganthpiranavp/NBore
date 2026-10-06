import { getDb } from '../lib/db';

export interface UserInterface {
  id: string;
  username: string;
  password?: string;
  name: string;
  phone: string;
  email: string;
  role: 'ADMIN' | 'MANAGER';
  assigned_vehicle_id: number | null;
  is_active: boolean;
  vehicle_number?: string | null;
  rig_name?: string | null;
}

export class UserModel {
  static async findByUsername(username: string): Promise<UserInterface | null> {
    const db = getDb();
    const clean = username.trim().toLowerCase();
    const found = db.users.find(
      (u) => u.username.toLowerCase() === clean || u.email.toLowerCase() === clean
    );
    if (!found) return null;

    const vehicle = found.assigned_vehicle_id
      ? db.vehicles.find((v) => v.id === found.assigned_vehicle_id)
      : null;

    return {
      ...found,
      vehicle_number: vehicle ? vehicle.vehicle_number : null,
      rig_name: vehicle ? vehicle.rig_name : null,
    };
  }

  static async findById(id: string): Promise<UserInterface | null> {
    const db = getDb();
    const found = db.users.find((u) => u.id === id);
    if (!found) return null;

    const vehicle = found.assigned_vehicle_id
      ? db.vehicles.find((v) => v.id === found.assigned_vehicle_id)
      : null;

    return {
      ...found,
      vehicle_number: vehicle ? vehicle.vehicle_number : null,
      rig_name: vehicle ? vehicle.rig_name : null,
    };
  }

  static async getAllManagers() {
    const db = getDb();
    return db.users
      .filter((u) => u.role === 'MANAGER')
      .map((mgr) => {
        const vehicle = mgr.assigned_vehicle_id
          ? db.vehicles.find((v) => v.id === mgr.assigned_vehicle_id)
          : null;
        const totalSubmissions = db.entries.filter((e) => e.manager_id === mgr.id).length;

        return {
          id: mgr.id,
          username: mgr.username,
          name: mgr.name,
          phone: mgr.phone,
          email: mgr.email,
          role: mgr.role,
          assigned_vehicle_id: mgr.assigned_vehicle_id,
          assigned_vehicle_number: vehicle ? vehicle.vehicle_number : 'Unassigned',
          assigned_rig_name: vehicle ? vehicle.rig_name : 'No Rig Assigned',
          total_submissions: totalSubmissions,
          is_active: mgr.is_active,
        };
      });
  }

  static async createManager(data: {
    name: string;
    username: string;
    phone?: string;
    email?: string;
    password?: string;
    assigned_vehicle_id?: number | null;
  }) {
    const db = getDb();
    const clean = data.username.trim().toLowerCase();
    if (db.users.some((u) => u.username.toLowerCase() === clean)) {
      throw new Error(`Username '${data.username}' is already taken.`);
    }

    const newMgr = {
      id: 'mgr-' + Date.now(),
      username: data.username.trim(),
      password: data.password || 'password123',
      name: data.name.trim(),
      phone: data.phone?.trim() || '',
      email: data.email?.trim() || `${clean}@borewell.com`,
      role: 'MANAGER' as const,
      assigned_vehicle_id: data.assigned_vehicle_id ? Number(data.assigned_vehicle_id) : null,
      is_active: true,
    };

    db.users.push(newMgr);
    return newMgr;
  }

  static async assignVehicle(managerId: string, vehicleId: number | null) {
    const db = getDb();
    const mgr = db.users.find((u) => u.id === managerId);
    if (!mgr) throw new Error('Manager not found');

    mgr.assigned_vehicle_id = vehicleId ? Number(vehicleId) : null;
    return mgr;
  }
}
