'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageContainer from '../../../components/layout/PageContainer';
import AdminFeedTable from '../../../components/dashboards/AdminFeedTable';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { DailyEntryInterface } from '../../../models/DailyEntry';
import { User } from '../../../lib/types';
import { Truck, Layers, IndianRupee, Fuel, RefreshCw, Plus } from 'lucide-react';
import Button from '../../../components/common/Button';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [entries, setEntries] = useState<DailyEntryInterface[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchFeed = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/entries');
      const json = await res.json();
      if (json.success) {
        setEntries(json.data || []);
      }
    } catch (err) {
      console.error('Error fetching admin feed:', err);
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('borewell_user');
      if (!stored) {
        router.replace('/login');
        return;
      }
      try {
        const u = JSON.parse(stored);
        if (u.role !== 'ADMIN') {
          router.replace('/manager/entry');
          return;
        }
        setCurrentUser(u);
      } catch (e) {
        router.replace('/login');
        return;
      }
    }

    fetchFeed();
  }, [router]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('borewell_user');
      localStorage.removeItem('borewell_token');
    }
    router.push('/login');
  };

  if (isLoading) {
    return <LoadingSpinner label="Loading Global Fleet Feed..." sublabel="Aggregating telemetry..." />;
  }

  // Aggregate Metrics
  const totalDrilled = entries.reduce((acc, curr) => acc + (Number(curr.depth) || 0), 0);
  const totalRevenue = entries.reduce((acc, curr) => acc + (Number(curr.grossBoreCost) || 0), 0);
  const totalDiesel = entries.reduce((acc, curr) => acc + (Number(curr.diesel?.liters) || 0), 0);
  const totalOutstanding = entries.reduce((acc, curr) => acc + (Number(curr.balanceDue) || 0), 0);

  return (
    <PageContainer
      user={currentUser}
      onLogout={handleLogout}
      title="Global Fleet Feed & Operations"
      subtitle="Real-time centralized entry stream across all 3 active bore rigs"
      role="ADMIN"
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchFeed}
            isLoading={isRefreshing}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push('/admin/managers')}
            icon={<Truck className="w-3.5 h-3.5" />}
          >
            Manage Vehicle Locks
          </Button>
        </div>
      }
    >
      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Drilled
            </span>
            <div className="text-xl font-black text-slate-900 mt-0.5">
              {totalDrilled.toLocaleString()} ft
            </div>
            <span className="text-[10px] text-blue-600 font-semibold">Across all 3 rigs</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Gross Revenue
            </span>
            <div className="text-xl font-black text-slate-900 mt-0.5">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold">All daily chits</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Fuel className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Diesel Consumed
            </span>
            <div className="text-xl font-black text-slate-900 mt-0.5">
              {totalDiesel.toLocaleString()} L
            </div>
            <span className="text-[10px] text-amber-600 font-semibold">Machinery total</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Balance Due
            </span>
            <div className="text-xl font-black text-rose-600 mt-0.5">
              ₹{totalOutstanding.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-rose-500 font-semibold">Pending recovery</span>
          </div>
        </div>
      </div>

      {/* Main Admin Feed Table */}
      <AdminFeedTable entries={entries} onRefresh={fetchFeed} />
    </PageContainer>
  );
}
