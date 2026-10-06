import { User, Vehicle, DailyEntry, SummaryStats } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function getAuthHeader(): Record<string, string> {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('borewell_token');
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
  }
  return {};
}

export const api = {
  // 1. Auth API
  async login(username: string, password: string, expectedRole?: string) {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username.trim(),
        password,
        expected_role: expectedRole,
      }),
    });
    return res.json();
  },

  async getMe() {
    const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: { ...getAuthHeader() },
    });
    return res.json();
  },

  // 2. Vehicles API
  async getVehicles(): Promise<{ success: boolean; data: Vehicle[] }> {
    const res = await fetch(`${API_BASE_URL}/api/vehicles`);
    return res.json();
  },

  async getVehicle(id: number): Promise<{ success: boolean; data: Vehicle }> {
    const res = await fetch(`${API_BASE_URL}/api/vehicles/${id}`);
    return res.json();
  },

  // 3. Daily Entries API
  async getGlobalFeed(params: {
    vehicle_id?: string;
    date?: string;
    village?: string;
    search?: string;
  } = {}): Promise<{ success: boolean; data: DailyEntry[]; summary: SummaryStats }> {
    const query = new URLSearchParams();
    if (params.vehicle_id) query.set('vehicle_id', params.vehicle_id);
    if (params.date) query.set('date', params.date);
    if (params.village) query.set('village', params.village);
    if (params.search) query.set('search', params.search);

    const res = await fetch(`${API_BASE_URL}/api/entries?${query.toString()}`);
    return res.json();
  },

  async getVehicleEntries(vehicleId: number): Promise<{
    success: boolean;
    data: DailyEntry[];
    summary: SummaryStats;
  }> {
    const res = await fetch(`${API_BASE_URL}/api/entries/vehicle/${vehicleId}`);
    return res.json();
  },

  async submitEntry(entryData: Partial<DailyEntry>) {
    const res = await fetch(`${API_BASE_URL}/api/entries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(entryData),
    });
    return res.json();
  },

  // 4. User Management API (Admins)
  async getManagers(): Promise<{ success: boolean; data: User[] }> {
    const res = await fetch(`${API_BASE_URL}/api/users/managers`, {
      headers: { ...getAuthHeader() },
    });
    return res.json();
  },

  async createManager(managerData: {
    name: string;
    username: string;
    phone?: string;
    email?: string;
    password?: string;
    assigned_vehicle_id?: number | null;
  }) {
    const res = await fetch(`${API_BASE_URL}/api/users/managers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(managerData),
    });
    return res.json();
  },

  async updateManager(id: string, updateData: Partial<User>) {
    const res = await fetch(`${API_BASE_URL}/api/users/managers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(updateData),
    });
    return res.json();
  },

  async assignVehicle(managerId: string, vehicleId: number | null) {
    const res = await fetch(`${API_BASE_URL}/api/users/managers/${managerId}/assign-vehicle`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ vehicle_id: vehicleId }),
    });
    return res.json();
  },
};
