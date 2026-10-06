/**
 * ==============================================================================
 * Database Connection & Resilience Pool (/lib/db.ts)
 * Enterprise-grade multi-layer connection resilience:
 * 1. Resilient Mongoose / MongoDB connection pooling
 * 2. Instant memory fallback store with zero hanging promises
 * 3. Pre-seeded with locked fleet: NBW 6656, SNBW 4748 (Sensor), NBW 4656 (Sensor)
 * ==============================================================================
 */

// 1. Locked Fleet Vehicles
export const INITIAL_VEHICLES = [
  {
    id: 1,
    vehicle_number: 'NBW 6656',
    rig_name: 'Rig 1 (Ashok Leyland 6x4)',
    sensor_enabled: false,
    status: 'ACTIVE',
  },
  {
    id: 2,
    vehicle_number: 'SNBW 4748 (Sensor)',
    rig_name: 'Rig 2 (Tata Prima 2528 IoT)',
    sensor_enabled: true,
    status: 'ACTIVE',
  },
  {
    id: 3,
    vehicle_number: 'NBW 4656 (Sensor)',
    rig_name: 'Rig 3 (BharatBenz 2828C IoT)',
    sensor_enabled: true,
    status: 'ACTIVE',
  },
];

// 2. Roles & Permissions: 6 Admins & 4 Managers
export const INITIAL_USERS = [
  // 6 Admin Accounts (Global Oversight)
  { id: 'admin-1', username: 'admin1', password: 'password123', name: 'K. Rajesh (Director)', phone: '9842100001', email: 'rajesh.admin@borewell.com', role: 'ADMIN', assigned_vehicle_id: null, is_active: true },
  { id: 'admin-2', username: 'admin2', password: 'password123', name: 'S. Kumar (Fleet Head)', phone: '9842100002', email: 'kumar.admin@borewell.com', role: 'ADMIN', assigned_vehicle_id: null, is_active: true },
  { id: 'admin-3', username: 'admin3', password: 'password123', name: 'M. Anitha (Finance Chief)', phone: '9842100003', email: 'anitha.finance@borewell.com', role: 'ADMIN', assigned_vehicle_id: null, is_active: true },
  { id: 'admin-4', username: 'admin4', password: 'password123', name: 'V. Senthil (Operations)', phone: '9842100004', email: 'senthil.ops@borewell.com', role: 'ADMIN', assigned_vehicle_id: null, is_active: true },
  { id: 'admin-5', username: 'admin5', password: 'password123', name: 'P. Karthik (Audit)', phone: '9842100005', email: 'karthik.audit@borewell.com', role: 'ADMIN', assigned_vehicle_id: null, is_active: true },
  { id: 'admin-6', username: 'admin6', password: 'password123', name: 'D. Ramesh (Admin)', phone: '9842100006', email: 'ramesh.admin@borewell.com', role: 'ADMIN', assigned_vehicle_id: null, is_active: true },

  // 4 Manager Accounts (Strict Vehicle Isolation)
  { id: 'mgr-1', username: 'manager1', password: 'password123', name: 'Saravanan', phone: '9842100011', email: 'saravanan.nbw6656@borewell.com', role: 'MANAGER', assigned_vehicle_id: 1, is_active: true },
  { id: 'mgr-2', username: 'manager2', password: 'password123', name: 'Murugan', phone: '9842100012', email: 'murugan.snbw4748@borewell.com', role: 'MANAGER', assigned_vehicle_id: 2, is_active: true },
  { id: 'mgr-3', username: 'manager3', password: 'password123', name: 'Selvam', phone: '9842100013', email: 'selvam.nbw4656@borewell.com', role: 'MANAGER', assigned_vehicle_id: 3, is_active: true },
  { id: 'mgr-4', username: 'manager4', password: 'password123', name: 'Ganesan', phone: '9842100014', email: 'ganesan.reserve@borewell.com', role: 'MANAGER', assigned_vehicle_id: null, is_active: true },
];

// 3. Historical Seed Daily Entries (Mapped to 22 fields)
export const INITIAL_ENTRIES: any[] = [
  {
    id: 'entry-ref-01',
    vehicleId: 1,
    vehicleNumber: 'NBW 6656',
    managerId: 'mgr-1',
    managerName: 'Saravanan',
    agent: 'Subbu',
    subAgent: 'Kishore',
    date: '2026-10-04',
    pNo: 'PT-101',
    pName: 'Lakshmi Textiles Farm',
    placeVillage: 'Damalacheruvu',
    bRate: 120,
    depth: 650,
    rod: 26,
    msCasing: { feet: 40, rate: 140, total: 5600, isManualOverride: false },
    welding: { count: 3, ratePerUnit: 250, total: 750 },
    pvcCasing: { feet: 80, rate: 220, total: 17600 },
    recutting: { count: 1, ratePerUnit: 140, total: 140 },
    rebore: { feet: 0, rate: 0, total: 0 },
    flushing: { feet: 150, rate: 40, total: 6000 },
    rpmDetails: { sRpm: 1200, runRpm: 1500, cRpm: 1450, avgRpm: 1475 },
    bitDetails: { max: 165, min: 150, mm: 161 },
    hammerDetails: { company: 'Secoroc', num: 'SEC-09', depth: 650 },
    diesel: { liters: 240, ratePerLiter: 94.5, totalCost: 22680 },
    cashReceived: 45000,
    drillerName: 'Tharumal',
    boreRemarks: 'Water struck at 480ft. Rock formation granite. High yield.',
    grossBoreCost: 108090,
    balanceDue: 63090,
    createdAt: '2026-10-04T18:30:00Z',
  },
  {
    id: 'entry-ref-02',
    vehicleId: 2,
    vehicleNumber: 'SNBW 4748 (Sensor)',
    managerId: 'mgr-2',
    managerName: 'Murugan',
    agent: 'Nagaraj Agent',
    subAgent: 'Ramu',
    date: '2026-10-05',
    pNo: 'PT-102',
    pName: 'Sundaram Poultry Farm',
    placeVillage: 'Kangeyam',
    bRate: 120,
    depth: 820,
    rod: 33,
    msCasing: { feet: 60, rate: 160, total: 9600, isManualOverride: false },
    welding: { count: 4, ratePerUnit: 250, total: 1000 },
    pvcCasing: { feet: 120, rate: 210, total: 25200 },
    recutting: { count: 2, ratePerUnit: 140, total: 280 },
    rebore: { feet: 0, rate: 0, total: 0 },
    flushing: { feet: 350, rate: 150, total: 52500 },
    rpmDetails: { sRpm: 1300, runRpm: 1600, cRpm: 1550, avgRpm: 1575 },
    bitDetails: { max: 170, min: 155, mm: 165 },
    hammerDetails: { company: 'Sandvik', num: 'SAN-44', depth: 820 },
    diesel: { liters: 310, ratePerLiter: 94.5, totalCost: 29295 },
    cashReceived: 60000,
    drillerName: 'Mani Driller',
    boreRemarks: 'Heavy boulder top 70ft. IoT sensor telemetrics synced 100%.',
    grossBoreCost: 186980,
    balanceDue: 126980,
    createdAt: '2026-10-05T17:15:00Z',
  },
];

// In-Memory Global Instance for high-performance zero-delay SSR & API
declare global {
  var __nithyaBorewellStore: {
    vehicles: typeof INITIAL_VEHICLES;
    users: typeof INITIAL_USERS;
    entries: any[];
    mongooseConn: any | null;
  } | undefined;
}

if (!global.__nithyaBorewellStore) {
  global.__nithyaBorewellStore = {
    vehicles: [...INITIAL_VEHICLES],
    users: [...INITIAL_USERS],
    entries: [...INITIAL_ENTRIES],
    mongooseConn: null,
  };
}

/**
 * Connect to MongoDB with timeout guard and fallback
 */
export async function connectMongoose(): Promise<any> {
  const store = global.__nithyaBorewellStore!;
  if (store.mongooseConn && store.mongooseConn.connection?.readyState === 1) {
    return store.mongooseConn;
  }

  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nithya_borewells';

  try {
    const mongooseModule = await import('mongoose').catch(() => null);
    const mongoose = mongooseModule?.default || mongooseModule;

    if (mongoose && typeof mongoose.connect === 'function') {
      const conn = await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 2000, // Never block for more than 2s
        maxPoolSize: 10,
        minPoolSize: 2,
      });
      store.mongooseConn = conn;
      console.log('[DB] ✅ Mongoose connected successfully');
      return conn;
    }
  } catch (err: any) {
    console.warn('[DB] ℹ️ MongoDB connection bypassed; resilient in-memory store active:', err.message);
  }

  return null;
}

export const getDb = () => global.__nithyaBorewellStore!;
export default connectMongoose;
