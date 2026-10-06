/**
 * ==============================================================================
 * User Model (/models/User.ts)
 * Enterprise RBAC for Nithya Borewells:
 * - 6 Admins (Global oversight)
 * - 4 Managers (Locked to designated bore vehicles)
 * ==============================================================================
 */

import { getDb } from '../lib/db';

export interface UserInterface {
  id: string;
  username: string;
  password?: string;
  name: string;
  phone: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | string;
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

  static async getAllManagers(): Promise<UserInterface[]> {
    const db = getDb();
    return db.users
      .filter((u) => u.role === 'MANAGER')
      .map((mgr) => {
        const vehicle = mgr.assigned_vehicle_id
          ? db.vehicles.find((v) => v.id === mgr.assigned_vehicle_id)
          : null;
        return {
          ...mgr,
          vehicle_number: vehicle ? vehicle.vehicle_number : 'Unassigned',
          rig_name: vehicle ? vehicle.rig_name : 'No Rig Linked',
        };
      });
  }

  static async getAllUsers(): Promise<UserInterface[]> {
    const db = getDb();
    return db.users.map((u) => {
      const vehicle = u.assigned_vehicle_id
        ? db.vehicles.find((v) => v.id === u.assigned_vehicle_id)
        : null;
      return {
        ...u,
        vehicle_number: vehicle ? vehicle.vehicle_number : null,
        rig_name: vehicle ? vehicle.rig_name : null,
      };
    });
  }

  static async createManager(data: {
    username: string;
    name: string;
    phone: string;
    email: string;
    assigned_vehicle_id?: number | null;
  }): Promise<UserInterface> {
    const db = getDb();
    const existing = db.users.find(
      (u) => u.username.toLowerCase() === data.username.toLowerCase()
    );
    if (existing) {
      throw new Error(`Username '${data.username}' is already in use`);
    }

    const newManager = {
      id: `mgr-${Date.now()}`,
      username: data.username.trim(),
      password: 'password123',
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email.trim(),
      role: 'MANAGER' as const,
      assigned_vehicle_id: data.assigned_vehicle_id ? Number(data.assigned_vehicle_id) : null,
      is_active: true,
    };

    db.users.push(newManager);

    const vehicle = newManager.assigned_vehicle_id
      ? db.vehicles.find((v) => v.id === newManager.assigned_vehicle_id)
      : null;

    return {
      ...newManager,
      vehicle_number: vehicle ? vehicle.vehicle_number : null,
      rig_name: vehicle ? vehicle.rig_name : null,
    };
  }

  static async assignVehicle(
    managerId: string,
    vehicleId: number | null
  ): Promise<UserInterface> {
    const db = getDb();
    const mgrIndex = db.users.findIndex((u) => u.id === managerId && u.role === 'MANAGER');
    if (mgrIndex === -1) {
      throw new Error('Manager not found');
    }

    // If another manager had this vehicle, release it to preserve 1:1 lock
    if (vehicleId) {
      db.users.forEach((u) => {
        if (u.id !== managerId && u.assigned_vehicle_id === Number(vehicleId)) {
          u.assigned_vehicle_id = null;
        }
      });
    }

    db.users[mgrIndex].assigned_vehicle_id = vehicleId ? Number(vehicleId) : null;
    const updated = db.users[mgrIndex];

    const vehicle = updated.assigned_vehicle_id
      ? db.vehicles.find((v) => v.id === updated.assigned_vehicle_id)
      : null;

    return {
      ...updated,
      vehicle_number: vehicle ? vehicle.vehicle_number : null,
      rig_name: vehicle ? vehicle.rig_name : null,
    };
  }
}

export default UserModel;
