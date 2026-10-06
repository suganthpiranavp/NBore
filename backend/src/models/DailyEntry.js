const { db } = require('../config/db');

class DailyEntryModel {
  static formatReport(entry) {
    const vehicle = db.vehicles.find((v) => v.id === entry.vehicle_id);
    const manager = db.users.find((u) => u.id === entry.manager_id);

    return {
      ...entry,
      vehicle_number: vehicle ? vehicle.vehicle_number : `Vehicle #${entry.vehicle_id}`,
      rig_name: vehicle ? vehicle.rig_name : `Rig #${entry.vehicle_id}`,
      manager_name: manager ? manager.name : 'Unknown Manager',
      manager_phone: manager ? manager.phone : '-',
      submitted_at_formatted: entry.created_at
        ? new Date(entry.created_at).toISOString().replace('T', ' ').substring(0, 19)
        : new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
  }

  static async create(payload) {
    const {
      vehicle_id,
      manager_id,
      report_date,
      agent_name,
      sub,
      party_no,
      party_name,
      village,
      depth,
      bore_rate,
      rod_count,
      ms_casing,
      welding_details,
      pvc_casing,
      recut,
      rebore,
      flushing,
      rpm_start,
      rpm_end,
      avg_rpm,
      bit_number,
      bit_size,
      hammer_type,
      driller_name,
      diesel_liters,
      cash_advance,
      remarks,
    } = payload;

    const startNum = parseFloat(rpm_start) || 0;
    const endNum = parseFloat(rpm_end) || 0;
    const rpmTotal = parseFloat((endNum - startNum).toFixed(2));

    const newEntry = {
      id: 'e-' + Date.now() + '-' + Math.floor(Math.random() * 10000),
      vehicle_id: parseInt(vehicle_id, 10),
      manager_id: manager_id,
      report_date: report_date || new Date().toISOString().split('T')[0],
      agent_name: agent_name ? agent_name.trim() : '',
      sub: sub ? sub.trim() : '',
      party_no: party_no ? party_no.trim() : '',
      party_name: party_name ? party_name.trim() : 'Unnamed Party',
      village: village ? village.trim() : '',
      depth: parseFloat(depth) || 0,
      bore_rate: parseFloat(bore_rate) || 0,
      rod_count: parseInt(rod_count, 10) || 0,
      ms_casing: parseFloat(ms_casing) || 0,
      welding_details: welding_details ? welding_details.trim() : '-',
      pvc_casing: parseFloat(pvc_casing) || 0,
      recut: recut ? recut.trim() : '-',
      rebore: rebore ? rebore.trim() : '-',
      flushing: flushing ? flushing.trim() : '-',
      rpm_start: startNum,
      rpm_end: endNum,
      rpm_total: rpmTotal,
      avg_rpm: parseFloat(avg_rpm) || 0,
      bit_number: bit_number ? bit_number.trim() : '',
      bit_size: bit_size ? bit_size.trim() : '',
      hammer_type: hammer_type ? hammer_type.trim() : '',
      driller_name: driller_name ? driller_name.trim() : '',
      diesel_liters: parseFloat(diesel_liters) || 0,
      cash_advance: cash_advance ? cash_advance.trim() : '',
      remarks: remarks ? remarks.trim() : '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Prepend new entry
    db.entries.unshift(newEntry);
    db.persist();

    return this.formatReport(newEntry);
  }

  static async getByVehicleId(vehicleId) {
    const vId = parseInt(vehicleId, 10);
    const filtered = db.entries
      .filter((e) => e.vehicle_id === vId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return filtered.map((e) => this.formatReport(e));
  }

  static async getAll(filters = {}) {
    let result = [...db.entries];

    if (filters.vehicle_id && filters.vehicle_id !== 'ALL') {
      const vId = parseInt(filters.vehicle_id, 10);
      result = result.filter((e) => e.vehicle_id === vId);
    }

    if (filters.date) {
      result = result.filter((e) => e.report_date === filters.date);
    }

    if (filters.village) {
      const vTerm = filters.village.toLowerCase();
      result = result.filter((e) => e.village.toLowerCase().includes(vTerm));
    }

    if (filters.search) {
      const s = filters.search.toLowerCase();
      result = result.filter(
        (e) =>
          e.party_name.toLowerCase().includes(s) ||
          e.village.toLowerCase().includes(s) ||
          (e.agent_name && e.agent_name.toLowerCase().includes(s)) ||
          (e.party_no && e.party_no.toLowerCase().includes(s)) ||
          (e.driller_name && e.driller_name.toLowerCase().includes(s))
      );
    }

    // Sort newest first
    result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return result.map((e) => this.formatReport(e));
  }

  static async getById(id) {
    const entry = db.entries.find((e) => e.id === id);
    if (!entry) return null;
    return this.formatReport(entry);
  }
}

module.exports = DailyEntryModel;
