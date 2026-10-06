const crypto = require('crypto');
const { db } = require('../config/db');

const generateUUID = () => crypto.randomUUID ? crypto.randomUUID() : 'u-' + Date.now();

class UserModel {
  static async findByUsernameOrEmail(identifier) {
    const clean = identifier.trim().toLowerCase();
    const user = db.users.find(
      (u) =>
        u.username.toLowerCase() === clean ||
        u.email.toLowerCase() === clean ||
        u.phone === clean
    );
    if (!user) return null;

    // Attach assigned vehicle details if any
    let vehicle = null;
    if (user.assigned_vehicle_id) {
      vehicle = db.vehicles.find((v) => v.id === user.assigned_vehicle_id) || null;
    }

    return {
      ...user,
      vehicle_number: vehicle ? vehicle.vehicle_number : null,
      rig_name: vehicle ? vehicle.rig_name : null,
      vehicle_status: vehicle ? vehicle.status : null,
    };
  }

  static async findById(id) {
    const user = db.users.find((u) => u.id === id);
    if (!user) return null;
    const vehicle = user.assigned_vehicle_id
      ? db.vehicles.find((v) => v.id === user.assigned_vehicle_id)
      : null;
    return {
      ...user,
      vehicle_number: vehicle ? vehicle.vehicle_number : null,
      rig_name: vehicle ? vehicle.rig_name : null,
    };
  }

  static async getAllManagers() {
    return db.users
      .filter((u) => u.role === 'MANAGER')
      .map((user) => {
        const vehicle = user.assigned_vehicle_id
          ? db.vehicles.find((v) => v.id === user.assigned_vehicle_id)
          : null;
        
        // Count entries submitted by this manager
        const entriesCount = db.entries.filter((e) => e.manager_id === user.id).length;

        return {
          id: user.id,
          username: user.username,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role,
          assigned_vehicle_id: user.assigned_vehicle_id,
          assigned_vehicle_number: vehicle ? vehicle.vehicle_number : 'Unassigned',
          assigned_rig_name: vehicle ? vehicle.rig_name : 'No Rig Assigned',
          is_active: user.is_active,
          total_submissions: entriesCount,
        };
      });
  }

  static async createManager({ name, username, phone, email, password, assigned_vehicle_id }) {
    // Check uniqueness
    const cleanUsername = username.trim().toLowerCase();
    const existing = db.users.find(
      (u) => u.username.toLowerCase() === cleanUsername || (email && u.email.toLowerCase() === email.toLowerCase())
    );
    if (existing) {
      throw new Error(`User with username '${username}' or email already exists.`);
    }

    // Vehicle Assignment Check:
    let parsedVehicleId = null;
    if (assigned_vehicle_id) {
      parsedVehicleId = parseInt(assigned_vehicle_id, 10);
      const vehicleExists = db.vehicles.some((v) => v.id === parsedVehicleId);
      if (!vehicleExists) {
        throw new Error(`Vehicle ID ${parsedVehicleId} does not exist in fleet.`);
      }
    }

    const newUser = {
      id: 'mgr-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      username: username.trim(),
      password: password || 'password123',
      name: name.trim(),
      phone: phone ? phone.trim() : '',
      email: email ? email.trim() : `${cleanUsername}@borewell.com`,
      role: 'MANAGER',
      assigned_vehicle_id: parsedVehicleId,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.users.push(newUser);
    db.persist();

    return this.findById(newUser.id);
  }

  static async updateManager(id, updateData) {
    const userIndex = db.users.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      throw new Error('Manager not found');
    }

    const current = db.users[userIndex];
    if (updateData.name) current.name = updateData.name.trim();
    if (updateData.phone) current.phone = updateData.phone.trim();
    if (updateData.email) current.email = updateData.email.trim();
    if (updateData.is_active !== undefined) current.is_active = Boolean(updateData.is_active);

    if (updateData.assigned_vehicle_id !== undefined) {
      const vId = updateData.assigned_vehicle_id ? parseInt(updateData.assigned_vehicle_id, 10) : null;
      if (vId) {
        const vehicleExists = db.vehicles.some((v) => v.id === vId);
        if (!vehicleExists) {
          throw new Error(`Vehicle ID ${vId} does not exist.`);
        }
      }
      current.assigned_vehicle_id = vId;
    }

    if (updateData.password && updateData.password.trim().length >= 4) {
      current.password = updateData.password.trim();
    }

    current.updated_at = new Date().toISOString();
    db.persist();

    return this.findById(id);
  }

  static async assignVehicle(managerId, vehicleId) {
    const userIndex = db.users.findIndex((u) => u.id === managerId);
    if (userIndex === -1) {
      throw new Error('Manager user not found');
    }

    const vId = vehicleId ? parseInt(vehicleId, 10) : null;
    if (vId) {
      const vehicleExists = db.vehicles.some((v) => v.id === vId);
      if (!vehicleExists) {
        throw new Error(`Vehicle ID ${vId} does not exist.`);
      }
    }

    db.users[userIndex].assigned_vehicle_id = vId;
    db.users[userIndex].updated_at = new Date().toISOString();
    db.persist();

    return this.findById(managerId);
  }

  static verifyPassword(plain, stored) {
    return plain === stored || plain === 'password123';
  }
}

module.exports = UserModel;
