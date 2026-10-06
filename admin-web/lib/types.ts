export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  phone: string;
  role: 'ADMIN' | 'MANAGER';
  assigned_vehicle_id?: number | null;
  assigned_vehicle_number?: string | null;
  assigned_rig_name?: string | null;
  vehicle_number?: string | null;
  rig_name?: string | null;
  vehicle_status?: string | null;
  is_active?: boolean;
  total_submissions?: number;
}

export interface Vehicle {
  id: number;
  vehicle_number: string;
  rig_name: string;
  chassis_number?: string;
  compressor_model?: string;
  status: 'ACTIVE' | 'MAINTENANCE' | 'IDLE';
  manager_id?: string | null;
  manager_name?: string;
  manager_phone?: string;
  total_reports?: number;
  total_depth_drilled?: number;
  total_diesel_consumed?: number;
  total_rpm_hours?: number;
  last_drilling_date?: string | null;
}

export interface DailyEntry {
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

  // Financials / Notes
  diesel_liters: number;
  cash_advance?: string;
  remarks?: string;

  created_at?: string;
}

export interface SummaryStats {
  totalReports: number;
  totalDepth: number;
  totalDiesel: number;
  totalRpmHours: number;
}
