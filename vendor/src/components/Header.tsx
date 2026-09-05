import React from 'react';
import { useVendorAuth } from '../context/AuthContext';
import { navItems } from '../data/mockData';

interface HeaderProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  activeNav: string;
}

export function Header({ collapsed, setCollapsed, activeNav }: HeaderProps) {
  const { user, store } = useVendorAuth();
  const current = navItems.find((n) => n.id === activeNav);
  const initials = (user?.name || 'V')
    .split(' ')
    .map((p) => p.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Toggle sidebar"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-slate-400">
            {store?.store_name || 'Circuit Bazaar'}
          </div>
          <h1 className="text-lg font-bold text-slate-900">
            {current?.label || 'Dashboard'}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-500 md:flex">
          <span className="material-symbols-outlined text-lg">search</span>
          <input
            type="search"
            placeholder="Quick search..."
            className="w-40 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />
        </div>

        <button
          className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100"
          aria-label="Notifications"
        >
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-600" />
        </button>

        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
            {initials}
          </div>
          <div className="hidden text-left leading-tight md:block">
            <div className="text-sm font-semibold text-slate-900">{user?.name || 'Vendor'}</div>
            <div className="text-[11px] text-slate-500">{user?.email}</div>
          </div>
        </div>
      </div>
    </header>
  );
}