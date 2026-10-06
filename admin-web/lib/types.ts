export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  phone: string;
  role: 'ADMIN' | 'MANAGER' | string;
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
  sensor_enabled?: boolean;
  chassis_number?: string;
  compressor_model?: string;
  status: 'ACTIVE' | 'MAINTENANCE' | 'IDLE' | string;
  manager_id?: string | null;
  manager_name?: string;
  manager_phone?: string;
  total_reports?: number;
  total_depth_drilled?: number;
  total_diesel_consumed?: number;
  total_revenue?: number;
  total_rpm_hours?: number;
  last_drilling_date?: string | null;
}

export interface SummaryStats {
  totalReports: number;
  totalDepth: number;
  totalDiesel: number;
  totalRpmHours: number;
}

export interface DailyEntry {
  id: string;
  vehicleId?: number;
  vehicle_id?: number;
  vehicleNumber?: string;
  vehicle_number?: string;
  rig_name?: string;
  managerId?: string;
  manager_id?: string;
  managerName?: string;
  manager_name?: string;
  manager_phone?: string;

  // Work & Customer Details
  agent?: string;
  agent_name?: string;
  sub?: string;
  subAgent?: string;
  date?: string;
  report_date?: string;
  pNo?: string;
  party_no?: string;
  pName?: string;
  party_name?: string;
  placeVillage?: string;
  village?: string;

  // Depths & Rates
  bRate?: number;
  bore_rate?: number;
  depth?: number;
  rod?: number;
  rod_count?: number;

  // Casing & Operations
  msCasing?: { feet: number; rate: number; total: number; isManualOverride?: boolean };
  ms_casing?: number;
  welding?: { count: number; ratePerUnit: number; total: number };
  welding_details?: string;
  pvcCasing?: { feet: number; rate: number; total: number };
  pvc_casing?: number;
  recut?: string;
  recutting?: { count: number; ratePerUnit: number; total: number };
  rebore?: any;
  flushing?: any;

  // Machinery Telemetry
  rpmDetails?: { sRpm: number; runRpm: number; cRpm: number; avgRpm: number };
  rpm_start?: number;
  rpm_end?: number;
  rpm_total?: number;
  avg_rpm?: number;
  bitDetails?: { max: number; min: number; mm: number };
  bit_number?: string;
  bit_size?: string;
  hammerDetails?: { company: string; num: string; depth: number };
  hammer_type?: string;
  drillerName?: string;
  driller_name?: string;

  // Diesel & Financials
  diesel?: { liters: number; ratePerLiter: number; totalCost: number };
  diesel_liters?: number;
  cashReceived?: number;
  cash_advance?: string;
  boreRemarks?: string;
  remarks?: string;

  grossBoreCost?: number;
  balanceDue?: number;
  created_at?: string;
  createdAt?: string;
  submitted_at_formatted?: string;
}
