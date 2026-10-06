import { getDb } from '../lib/db';

export interface DailyEntryInterface {
  id: string;
  vehicle_id: number;
  vehicle_number?: string;
  rig_name?: string;
  manager_id: string;
  manager_name?: string;
  manager_phone?: string;
  report_date: string;
  submitted_at_formatted?: string;
  
  // Header Info
  agent_name?: string;
  sub?: string;
  party_no?: string;
  party_name: string;
  village: string;

  // Bore Details
  depth: number;
  bore_rate: number;
  rod_count: number;

  // Casing & Operations
  ms_casing: number;
  welding_details?: string;
  pvc_casing: number;
  recut?: string;
  rebore?: string;
  flushing?: string;

  // Machinery Stats
  rpm_start: number;
  rpm_end: number;
  rpm_total: number;
  avg_rpm: number;
  bit_number?: string;
  bit_size?: string;
  hammer_type?: string;
  driller_name?: string;

  // Financials & Notes
  diesel_liters: number;
  cash_advance?: string;
  remarks?: string;
  created_at?: string;
}

export class DailyEntryModel {
  private static format(entry: any): DailyEntryInterface {
    const db = getDb();
    const vehicle = db.vehicles.find((v) => v.id === entry.vehicle_id);
    const mgr = db.users.find((u) => u.id === entry.manager_id);

    return {
      ...entry,
      vehicle_number: vehicle ? vehicle.vehicle_number : `Vehicle #${entry.vehicle_id}`,
      rig_name: vehicle ? vehicle.rig_name : `Rig #${entry.vehicle_id}`,
      manager_name: mgr ? mgr.name : 'Rig Manager',
      manager_phone: mgr ? mgr.phone : '-',
      submitted_at_formatted: entry.created_at
        ? new Date(entry.created_at).toISOString().replace('T', ' ').substring(0, 19)
        : new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
  }

  static async create(payload: Partial<DailyEntryInterface>) {
    const db = getDb();
    const start = parseFloat(String(payload.rpm_start)) || 0;
    const end = parseFloat(String(payload.rpm_end)) || 0;
    const total = parseFloat((end - start).toFixed(2));

    const newDoc = {
      id: 'entry-' + Date.now(),
      vehicle_id: Number(payload.vehicle_id),
      manager_id: payload.manager_id || 'mgr-1',
      report_date: payload.report_date || new Date().toISOString().split('T')[0],
      agent_name: payload.agent_name || '',
      sub: payload.sub || '',
      party_no: payload.party_no || '',
      party_name: payload.party_name || '',
      village: payload.village || '',
      depth: parseFloat(String(payload.depth)) || 0,
      bore_rate: parseFloat(String(payload.bore_rate)) || 0,
      rod_count: parseInt(String(payload.rod_count), 10) || 0,
      ms_casing: parseFloat(String(payload.ms_casing)) || 0,
      welding_details: payload.welding_details || '-',
      pvc_casing: parseFloat(String(payload.pvc_casing)) || 0,
      recut: payload.recut || '-',
      rebore: payload.rebore || '-',
      flushing: payload.flushing || '-',
      rpm_start: start,
      rpm_end: end,
      rpm_total: total,
      avg_rpm: parseFloat(String(payload.avg_rpm)) || 0,
      bit_number: payload.bit_number || '',
      bit_size: payload.bit_size || '',
      hammer_type: payload.hammer_type || '',
      driller_name: payload.driller_name || '',
      diesel_liters: parseFloat(String(payload.diesel_liters)) || 0,
      cash_advance: payload.cash_advance || '',
      remarks: payload.remarks || '',
      created_at: new Date().toISOString(),
    };

    db.entries.unshift(newDoc);
    return this.format(newDoc);
  }

  static async getByVehicleId(vId: number) {
    const db = getDb();
    const list = db.entries
      .filter((e) => e.vehicle_id === Number(vId))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return list.map((e) => this.format(e));
  }

  static async getAll(filters: { vehicle_id?: string; date?: string; search?: string } = {}) {
    const db = getDb();
    let list = [...db.entries];

    if (filters.vehicle_id && filters.vehicle_id !== 'ALL') {
      list = list.filter((e) => e.vehicle_id === Number(filters.vehicle_id));
    }
    if (filters.date) {
      list = list.filter((e) => e.report_date === filters.date);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (e) =>
          e.party_name.toLowerCase().includes(q) ||
          e.village.toLowerCase().includes(q) ||
          e.driller_name?.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return list.map((e) => this.format(e));
  }
}
