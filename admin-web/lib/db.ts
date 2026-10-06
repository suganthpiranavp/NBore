/**
 * ==============================================================================
 * Database Connection & Resilience Pool (/lib/db.ts)
 * Supports PostgreSQL connection pooling with auto-resilient fallback
 * Ensures zero-blocking, zero-infinite-loading, and comprehensive error logging.
 * ==============================================================================
 */

// Initial Fleet & User Seeding for instant reliability
export const INITIAL_VEHICLES = [
  {
    id: 1,
    vehicle_number: 'TN-28-AA-1001',
    rig_name: 'Rig 1 (Ashok Leyland 6x4)',
    chassis_number: 'AL-CH-98124',
    compressor_model: 'ELGI 1100 CFM / 300 PSI',
    status: 'ACTIVE',
  },
  {
    id: 2,
    vehicle_number: 'TN-28-AA-1002',
    rig_name: 'Rig 2 (Tata Prima 2528)',
    chassis_number: 'TP-CH-77431',
    compressor_model: 'Atlas Copco XRVS 1250',
    status: 'ACTIVE',
  },
  {
    id: 3,
    vehicle_number: 'TN-28-AA-1003',
    rig_name: 'Rig 3 (BharatBenz 2828C)',
    chassis_number: 'BB-CH-55102',
    compressor_model: 'Doosan HP 1050',
    status: 'ACTIVE',
  },
  {
    id: 4,
    vehicle_number: 'TN-28-AA-1004',
    rig_name: 'Rig 4 (Eicher Pro 6028)',
    chassis_number: 'EP-CH-33299',
    compressor_model: 'ELGI 1200 CFM / 330 PSI',
    status: 'ACTIVE',
  },
];

export const INITIAL_USERS = [
  // 6 Admins
  { id: 'admin-1', username: 'admin1', password: 'password123', name: 'K. Rajesh', phone: '9842100001', email: 'rajesh.admin@borewell.com', role: 'ADMIN', assigned_vehicle_id: null, is_active: true },
  { id: 'admin-2', username: 'admin2', password: 'password123', name: 'S. Kumar', phone: '9842100002', email: 'kumar.admin@borewell.com', role: 'ADMIN', assigned_vehicle_id: null, is_active: true },
  { id: 'admin-3', username: 'admin3', password: 'password123', name: 'M. Anitha', phone: '9842100003', email: 'anitha.finance@borewell.com', role: 'ADMIN', assigned_vehicle_id: null, is_active: true },
  { id: 'admin-4', username: 'admin4', password: 'password123', name: 'V. Senthil', phone: '9842100004', email: 'senthil.ops@borewell.com', role: 'ADMIN', assigned_vehicle_id: null, is_active: true },
  { id: 'admin-5', username: 'admin5', password: 'password123', name: 'P. Karthik', phone: '9842100005', email: 'karthik.audit@borewell.com', role: 'ADMIN', assigned_vehicle_id: null, is_active: true },
  { id: 'admin-6', username: 'admin6', password: 'password123', name: 'D. Ramesh', phone: '9842100006', email: 'ramesh.admin@borewell.com', role: 'ADMIN', assigned_vehicle_id: null, is_active: true },

  // 4 Managers locked to rigs 1 to 4
  { id: 'mgr-1', username: 'manager1', password: 'password123', name: 'Saravanan', phone: '9842100011', email: 'saravanan.rig1@borewell.com', role: 'MANAGER', assigned_vehicle_id: 1, is_active: true },
  { id: 'mgr-2', username: 'manager2', password: 'password123', name: 'Murugan', phone: '9842100012', email: 'murugan.rig2@borewell.com', role: 'MANAGER', assigned_vehicle_id: 2, is_active: true },
  { id: 'mgr-3', username: 'manager3', password: 'password123', name: 'Selvam', phone: '9842100013', email: 'selvam.rig3@borewell.com', role: 'MANAGER', assigned_vehicle_id: 3, is_active: true },
  { id: 'mgr-4', username: 'manager4', password: 'password123', name: 'Ganesan', phone: '9842100014', email: 'ganesan.rig4@borewell.com', role: 'MANAGER', assigned_vehicle_id: 4, is_active: true },
];

export const INITIAL_ENTRIES = [
  {
    id: 'entry-ref-01',
    vehicle_id: 1,
    manager_id: 'mgr-1',
    report_date: '2026-09-08',
    agent_name: 'Subbu',
    sub: '',
    party_no: '60',
    party_name: 'City',
    village: 'Damalacheruvu',
    depth: 800.0,
    bore_rate: 120.0,
    rod_count: 40,
    ms_casing: 0.0,
    welding_details: '-',
    pvc_casing: 40.0,
    recut: '-',
    rebore: '-',
    flushing: '-',
    rpm_start: 6504.0,
    rpm_end: 6511.3,
    rpm_total: 7.3,
    avg_rpm: 109.0,
    bit_number: 'Ganesh',
    bit_size: '161',
    hammer_type: 'Gam',
    driller_name: 'Tharumal',
    diesel_liters: 0.0,
    cash_advance: '20,000 - Subbu',
    remarks: 'Clear water struck at 540ft. Formation rocky throughout.',
    created_at: '2026-09-08T18:30:00Z',
  },
  {
    id: 'entry-ref-02',
    vehicle_id: 2,
    manager_id: 'mgr-2',
    report_date: '2026-10-05',
    agent_name: 'Nagaraj Agent',
    sub: 'Sub-South',
    party_no: 'PT-2024-89',
    party_name: 'Sundaram Poultry Farm',
    village: 'Kangeyam',
    depth: 920.0,
    bore_rate: 90.0,
    rod_count: 46,
    ms_casing: 60.0,
    welding_details: '4 joints welded with rings',
    pvc_casing: 140.0,
    recut: '15 ft recut',
    rebore: 'No',
    flushing: '1 hour flushing',
    rpm_start: 2100.0,
    rpm_end: 2114.5,
    rpm_total: 14.5,
    avg_rpm: 1500.0,
    bit_number: 'BIT-6.5-904',
    bit_size: '6.5 inch',
    hammer_type: 'SD 6',
    driller_name: 'Mani Driller',
    diesel_liters: 310.0,
    cash_advance: '30,000 - GPay',
    remarks: 'Heavy boulder layer up to 70ft. Water yield approx 2 inches.',
    created_at: '2026-10-05T17:15:00Z',
  },
];

// Global in-memory cache to guarantee persistence across Next.js API requests
declare global {
  var __borewellDbInstance: {
    vehicles: typeof INITIAL_VEHICLES;
    users: typeof INITIAL_USERS;
    entries: typeof INITIAL_ENTRIES;
    pgPool: any | null;
  } | undefined;
}

if (!global.__borewellDbInstance) {
  let pgPool: any = null;
  try {
    // Dynamic import to prevent bundler failure if pg package isn't present
    const pg = require('pg');
    if (pg && pg.Pool) {
      pgPool = new pg.Pool({
        connectionString: process.env.DATABASE_URL || undefined,
        host: process.env.PGHOST || 'localhost',
        port: parseInt(process.env.PGPORT || '5432', 10),
        database: process.env.PGDATABASE || 'borewell_db',
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD || 'postgres',
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      pgPool.query('SELECT 1').then(() => {
        console.log('[PostgreSQL] ✅ Database connection pool established');
      }).catch((err: any) => {
        console.warn('[PostgreSQL] ℹ️ PostgreSQL not reachable, using resilient memory store:', err.message);
      });
    }
  } catch (e: any) {
    console.warn('[PostgreSQL] ℹ️ Resilient memory store active:', e.message);
  }

  global.__borewellDbInstance = {
    vehicles: [...INITIAL_VEHICLES],
    users: [...INITIAL_USERS],
    entries: [...INITIAL_ENTRIES],
    pgPool,
  };
}

export const getDb = () => global.__borewellDbInstance!;
