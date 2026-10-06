'use client';

import React, { useState } from 'react';
import { DailyEntryInterface } from '../../models/DailyEntry';
import Table, { Column } from '../common/Table';
import Badge from '../common/Badge';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { Download, Search, Filter, Eye, FileText, IndianRupee, Layers } from 'lucide-react';

interface AdminFeedTableProps {
  entries: DailyEntryInterface[];
  onRefresh?: () => void;
}

export default function AdminFeedTable({ entries, onRefresh }: AdminFeedTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('ALL');
  const [selectedEntry, setSelectedEntry] = useState<DailyEntryInterface | null>(null);

  // Filter logic
  const filteredEntries = entries.filter((item) => {
    const matchesVehicle =
      selectedVehicle === 'ALL' || item.vehicleNumber.includes(selectedVehicle);
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      item.pName?.toLowerCase().includes(searchLower) ||
      item.placeVillage?.toLowerCase().includes(searchLower) ||
      item.agent?.toLowerCase().includes(searchLower) ||
      item.drillerName?.toLowerCase().includes(searchLower) ||
      item.pNo?.toLowerCase().includes(searchLower);

    return matchesVehicle && matchesSearch;
  });

  // CSV Export utility
  const handleExportCSV = () => {
    if (filteredEntries.length === 0) {
      alert('No records available to export.');
      return;
    }

    const headers = [
      'Receipt ID',
      'Date',
      'Vehicle',
      'Manager',
      'Party Name',
      'Location',
      'Drilled Depth (ft)',
      'Base Rate',
      'MS Casing (ft)',
      'MS Rate',
      'Welding Count',
      'PVC Casing (ft)',
      'Recutting',
      'Flushing (ft)',
      'Diesel Liters',
      'Gross Cost (INR)',
      'Cash Received (INR)',
      'Balance Due (INR)',
      'Driller Name',
      'Remarks',
    ];

    const rows = filteredEntries.map((e) => [
      e.id,
      e.date,
      `"${e.vehicleNumber}"`,
      `"${e.managerName}"`,
      `"${e.pName}"`,
      `"${e.placeVillage}"`,
      e.depth,
      e.bRate,
      e.msCasing?.feet || 0,
      e.msCasing?.rate || 0,
      e.welding?.count || 0,
      e.pvcCasing?.feet || 0,
      e.recutting?.count || 0,
      e.flushing?.feet || 0,
      e.diesel?.liters || 0,
      e.grossBoreCost,
      e.cashReceived,
      e.balanceDue,
      `"${e.drillerName || ''}"`,
      `"${(e.boreRemarks || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Nithya_Borewells_Fleet_Logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns: Column<DailyEntryInterface>[] = [
    {
      key: 'date',
      header: 'Date',
      render: (row) => (
        <span className="font-bold text-slate-800 whitespace-nowrap">{row.date}</span>
      ),
    },
    {
      key: 'vehicleNumber',
      header: 'Fleet Rig',
      render: (row) => (
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <Badge variant="blue" size="sm">
            {row.vehicleNumber}
          </Badge>
        </div>
      ),
    },
    {
      key: 'pName',
      header: 'Customer / Party',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900">{row.pName}</div>
          <div className="text-[10px] text-slate-400">
            {row.placeVillage} {row.pNo ? `• ${row.pNo}` : ''}
          </div>
        </div>
      ),
    },
    {
      key: 'depth',
      header: 'Depth (ft)',
      align: 'right',
      render: (row) => (
        <span className="font-extrabold text-blue-700">{row.depth} ft</span>
      ),
    },
    {
      key: 'msCasing',
      header: 'M.S. Casing',
      render: (row) => (
        <div className="text-[11px]">
          <span>{row.msCasing?.feet || 0} ft</span>
          <span className="text-slate-400"> @ ₹{row.msCasing?.rate || 0}</span>
          {row.msCasing?.isManualOverride && (
            <span className="ml-1 text-[9px] px-1 py-0.2 rounded bg-amber-50 text-amber-700 font-bold border border-amber-200">
              Contra
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'grossBoreCost',
      header: 'Gross Bill',
      align: 'right',
      render: (row) => (
        <span className="font-black text-slate-900">
          ₹{row.grossBoreCost?.toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'cashReceived',
      header: 'Advance Paid',
      align: 'right',
      render: (row) => (
        <span className="font-extrabold text-emerald-600">
          ₹{row.cashReceived?.toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'balanceDue',
      header: 'Balance Due',
      align: 'right',
      render: (row) => (
        <span
          className={`font-black ${
            row.balanceDue > 0 ? 'text-rose-600' : 'text-emerald-700'
          }`}
        >
          ₹{row.balanceDue?.toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      align: 'center',
      render: (row) => (
        <button
          onClick={() => setSelectedEntry(row)}
          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition"
          title="View comprehensive 22-field digital chit"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Search */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search customer, agent, village..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>

          {/* Vehicle Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {['ALL', 'NBW 6656', 'SNBW 4748', 'NBW 4656'].map((v) => (
              <button
                key={v}
                onClick={() => setSelectedVehicle(v)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition ${
                  selectedVehicle === v
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {v === 'ALL' ? 'All Vehicles' : v}
              </button>
            ))}
          </div>
        </div>

        {/* Export Button */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Export Logs (CSV)
          </Button>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={filteredEntries}
        keyExtractor={(row) => row.id}
        emptyMessage="No drilling entries match the active filters."
      />

      {/* 22-Field Entry Detail Inspection Modal */}
      {selectedEntry && (
        <Modal
          isOpen={Boolean(selectedEntry)}
          onClose={() => setSelectedEntry(null)}
          title={`Digital Chit Ref #${selectedEntry.id}`}
          subtitle={`Submitted by ${selectedEntry.managerName} for ${selectedEntry.vehicleNumber}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            {/* Header / Customer */}
            <div className="p-3 bg-slate-50 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Customer
                </span>
                <span className="font-bold text-slate-900">{selectedEntry.pName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Location
                </span>
                <span className="font-bold text-slate-900">{selectedEntry.placeVillage}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Agent / Sub
                </span>
                <span className="font-bold text-slate-900">
                  {selectedEntry.agent || 'None'}{' '}
                  {selectedEntry.subAgent ? `(${selectedEntry.subAgent})` : ''}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Date
                </span>
                <span className="font-bold text-slate-900">{selectedEntry.date}</span>
              </div>
            </div>

            {/* Bore & Casing Breakdown */}
            <div className="p-3 border border-slate-200 rounded-xl grid grid-cols-3 gap-2">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase">
                  Drilled Depth
                </span>
                <span className="text-sm font-extrabold text-blue-700">
                  {selectedEntry.depth} ft @ ₹{selectedEntry.bRate}/ft
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase">
                  M.S. Casing
                </span>
                <span className="text-sm font-bold text-slate-800">
                  {selectedEntry.msCasing?.feet} ft @ ₹{selectedEntry.msCasing?.rate} = ₹
                  {selectedEntry.msCasing?.total}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase">
                  PVC Casing
                </span>
                <span className="text-sm font-bold text-slate-800">
                  {selectedEntry.pvcCasing?.feet} ft = ₹{selectedEntry.pvcCasing?.total}
                </span>
              </div>
            </div>

            {/* Operations & Telemetry */}
            <div className="p-3 bg-blue-50/50 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase">
                  Welding (₹250/jt)
                </span>
                <span className="font-bold text-slate-900">
                  {selectedEntry.welding?.count} joints (₹{selectedEntry.welding?.total})
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase">
                  Recutting (₹140)
                </span>
                <span className="font-bold text-slate-900">
                  {selectedEntry.recutting?.count} units (₹{selectedEntry.recutting?.total})
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase">
                  Flushing
                </span>
                <span className="font-bold text-slate-900">
                  {selectedEntry.flushing?.feet} ft (₹{selectedEntry.flushing?.total})
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase">
                  Avg RPM
                </span>
                <span className="font-bold text-slate-900">
                  {selectedEntry.rpmDetails?.avgRpm} RPM
                </span>
              </div>
            </div>

            {/* Diesel & Driller */}
            <div className="p-3 border border-slate-200 rounded-xl grid grid-cols-3 gap-2">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase">
                  Diesel
                </span>
                <span className="font-bold text-slate-900">
                  {selectedEntry.diesel?.liters}L (₹{selectedEntry.diesel?.totalCost})
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase">
                  Head Driller
                </span>
                <span className="font-bold text-slate-900">
                  {selectedEntry.drillerName || 'Not recorded'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase">
                  Rod Count
                </span>
                <span className="font-bold text-slate-900">{selectedEntry.rod} rods</span>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Gross Bill
                </span>
                <span className="text-base font-black">
                  ₹{selectedEntry.grossBoreCost?.toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-emerald-400 uppercase font-bold block">
                  Advance Collected
                </span>
                <span className="text-base font-black text-emerald-400">
                  ₹{selectedEntry.cashReceived?.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-rose-300 uppercase font-bold block">
                  Balance Due
                </span>
                <span className="text-base font-black text-rose-300">
                  ₹{selectedEntry.balanceDue?.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {selectedEntry.boreRemarks && (
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                  Site Remarks
                </span>
                <p className="text-slate-700 italic">{selectedEntry.boreRemarks}</p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
