'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, FileSpreadsheet, Settings, Truck } from 'lucide-react';

interface SidebarProps {
  role?: 'ADMIN' | 'MANAGER';
}

export default function Sidebar({ role = 'ADMIN' }: SidebarProps) {
  const pathname = usePathname();

  const adminLinks = [
    {
      label: 'Fleet Live Feed',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      badge: 'Live',
    },
    {
      label: 'Manager Fleet Lock',
      href: '/admin/managers',
      icon: Users,
      badge: '4 Rigs',
    },
  ];

  const managerLinks = [
    {
      label: 'Digital Log Sheet',
      href: '/manager/entry',
      icon: FileSpreadsheet,
      badge: '22 Fields',
    },
  ];

  const links = role === 'ADMIN' ? adminLinks : managerLinks;

  return (
    <aside className="w-full md:w-64 bg-white border-r border-slate-200 p-4 shrink-0 shadow-xs flex flex-col justify-between">
      <div className="space-y-6">
        <div>
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 px-3 mb-2">
            Navigation Menu
          </div>
          <nav className="space-y-1">
            {links.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition duration-150 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                        isActive
                          ? 'bg-blue-800 text-blue-100'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Fleet Rigs Info Pill */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Truck className="w-4 h-4 text-blue-600" />
            <span>Active Fleet Rigs</span>
          </div>
          <ul className="text-[11px] font-medium text-slate-500 space-y-1 pl-1">
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>NBW 6656</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>SNBW 4748 (Sensor)</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>NBW 4656 (Sensor)</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 text-center font-medium">
        © 2026 Nithya Borewells
      </div>
    </aside>
  );
}
