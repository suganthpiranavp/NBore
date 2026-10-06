const { db } = require('../config/db');

class VehicleModel {
  static async getAllWithStats() {
    return db.vehicles.map((v) => {
      // Find manager currently assigned
      const assignedManager = db.users.find(
        (u) => u.assigned_vehicle_id === v.id && u.role === 'MANAGER'
      );

      // Aggregate reports for this vehicle
      const vehicleReports = db.entries.filter((e) => e.vehicle_id === v.id);

      const totalReports = vehicleReports.length;
      const totalDepth = vehicleReports.reduce((sum, r) => sum + parseFloat(r.depth || 0), 0);
      const totalDiesel = vehicleReports.reduce((sum, r) => sum + parseFloat(r.diesel_liters || 0), 0);
      const totalRpmHours = vehicleReports.reduce((sum, r) => sum + parseFloat(r.rpm_total || 0), 0);

      // Last activity date
      const lastReport = vehicleReports.slice().sort((a, b) => new Date(b.report_date) - new Date(a.report_date))[0];

      return {
        id: v.id,
        vehicle_number: v.vehicle_number,
        rig_name: v.rig_name,
        chassis_number: v.chassis_number,
        compressor_model: v.compressor_model,
        status: v.status || 'ACTIVE',
        manager_id: assignedManager ? assignedManager.id : null,
        manager_name: assignedManager ? assignedManager.name : 'Unassigned',
        manager_phone: assignedManager ? assignedManager.phone : '-',
        total_reports: totalReports,
        total_depth_drilled: parseFloat(totalDepth.toFixed(2)),
        total_diesel_consumed: parseFloat(totalDiesel.toFixed(2)),
        total_rpm_hours: parseFloat(totalRpmHours.toFixed(2)),
        last_drilling_date: lastReport ? lastReport.report_date : null,
      };
    });
  }

  static async findById(id) {
    const vId = parseInt(id, 10);
    const vehicle = db.vehicles.find((v) => v.id === vId);
    if (!vehicle) return null;

    const assignedManager = db.users.find(
      (u) => u.assigned_vehicle_id === vId && u.role === 'MANAGER'
    );

    return {
      ...vehicle,
      manager_id: assignedManager ? assignedManager.id : null,
      manager_name: assignedManager ? assignedManager.name : 'Unassigned',
      manager_phone: assignedManager ? assignedManager.phone : '-',
    };
  }

  static async updateStatus(id, status) {
    const vId = parseInt(id, 10);
    const vehicle = db.vehicles.find((v) => v.id === vId);
    if (!vehicle) throw new Error('Vehicle not found');

    vehicle.status = status;
    db.persist();
    return vehicle;
  }
}

module.exports = VehicleModel;
