'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { User, Vehicle } from '../../lib/types';
import { api } from '../../lib/api';
import GlobalFeed from './GlobalFeed';
import VehicleFleet from './VehicleFleet';
import UserManagement from './UserManagement';
import {
  Globe,
  Truck,
  Users,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  RefreshCw,
  Bell,
} from 'lucide-react';

interface AdminDashboardProps {
  adminUser: User;
  onLogout: () => void;
}

type TabType = 'feed' | 'fleet' | 'users';

export default function AdminDashboard({ adminUser, onLogout }: AdminDashboardProps) {
  const [currentTab, setCurrentTab] = useState<TabType>('feed');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchVehicles = useCallback(async () => {
    setLoadingVehicles(true);
    try {
      const res = await api.getVehicles();
      if (res.success) {
        setVehicles(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching vehicles:', err);
    } finally {
      setLoadingVehicles(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const navItems = [
    {
      id: 'feed' as TabType,
      label: 'Global Live Feed',
      icon: Globe,
      badge: 'Real-time',
    },
    {
      id: 'fleet' as TabType,
      label: 'Fleet Vehicles (4 Rigs)',
      icon: Truck,
      badge: `${vehicles.length} Rigs`,
    },
    {
      id: 'users' as TabType,
      label: 'Manager Management',
      icon: Users,
      badge: 'Vehicle Lock',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* TOP HEADER (PURE WHITE & BLUE THEME) */}
      <header className="bg-white border-b border-blue-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Left Brand & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-xl shadow-md shadow-blue-600/20 font-bold text-white border border-blue-500">
              ⛏️
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold tracking-tight text-blue-950">
                  Borewell Fleet Admin
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                  Global Oversight
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                All 4 Drilling Rigs • Live Field Submissions • Manager Lock Control
              </p>
            </div>
          </div>

          {/* Right Admin Controls */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden md:block text-right text-xs">
              <p className="font-bold text-slate-800">{adminUser.name}</p>
              <p className="text-slate-500 font-mono text-[11px]">
                @{adminUser.username} • <span className="text-blue-600 font-semibold">{adminUser.role}</span>
              </p>
            </div>

            <button
              onClick={onLogout}
              className="px-3.5 py-1.5 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition flex items-center gap-1.5 shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-blue-100 bg-white p-4 space-y-2 shadow-lg">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-700 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}>
                    {item.badge}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* BODY WITH SIDEBAR NAVIGATION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 flex flex-col lg:flex-row gap-6">
        
        {/* DESKTOP SIDEBAR (PURE WHITE & BLUE) */}
        <aside className="hidden lg:block w-64 flex-shrink-0 space-y-6">
          <div className="bg-white border border-blue-100 rounded-2xl p-4 shadow-sm space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-3 mb-2">
              Navigation Menu
            </span>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-md font-mono ${
                      isActive
                        ? 'bg-white/20 text-white font-bold'
                        : 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold'
                    }`}
                  >
                    {item.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Fleet Summary Card in Sidebar */}
          <div className="bg-white border border-blue-100 rounded-2xl p-4 space-y-3 text-xs shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900 block">
              Fleet System Status
            </span>
            <div className="space-y-2 font-mono text-[11px]">
              <div className="flex justify-between text-slate-500">
                <span>Active Rigs:</span>
                <span className="text-slate-800 font-bold">{vehicles.length} Units</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Admins Authorized:</span>
                <span className="text-slate-800 font-bold">6 Users</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Manager Accounts:</span>
                <span className="text-slate-800 font-bold">4 Locked</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Live Database:</span>
                <span className="text-emerald-600 font-bold">● Online</span>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 w-full overflow-hidden">
          {currentTab === 'feed' && <GlobalFeed vehicles={vehicles} />}
          {currentTab === 'fleet' && (
            <VehicleFleet vehicles={vehicles} onRefreshVehicles={fetchVehicles} />
          )}
          {currentTab === 'users' && (
            <UserManagement vehicles={vehicles} onRefreshVehicles={fetchVehicles} />
          )}
        </main>
      </div>

    </div>
  );
}
