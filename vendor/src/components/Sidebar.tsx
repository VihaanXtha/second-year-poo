import React from 'react';
import { navItems } from '../data/mockData';
import { useVendorAuth } from '../context/AuthContext';

interface SidebarProps {
  activeNav: string;
  setActiveNav: (id: string) => void;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

export function Sidebar({ activeNav, setActiveNav, collapsed, setCollapsed }: SidebarProps) {
  const { store, user, logout } = useVendorAuth();
  const width = collapsed ? 'w-20' : 'w-64';

  return (
    <aside
      className={`${width} fixed inset-y-0 left-0 z-30 flex flex-col border-r border-slate-200 bg-white transition-all duration-300`}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="brand-gradient flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-sm">
            <span className="material-symbols-outlined text-xl">bolt</span>
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="text-sm font-bold text-slate-900">Circuit Bazaar</div>
              <div className="text-[11px] uppercase tracking-wider text-red-600">Vendor Portal</div>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
          aria-label="Toggle sidebar"
        >
          <span className="material-symbols-outlined text-xl">
            {collapsed ? 'chevron_right' : 'chevron_left'}
          </span>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        {!collapsed && (
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Main Menu
          </div>
        )}
        <ul className="space-y-1">
          {navItems.map((item) => {
            const active = activeNav === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveNav(item.id)}
                  className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? 'bg-red-50 text-red-700 shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <span
                    className={`material-symbols-outlined text-[22px] ${
                      active ? 'text-red-600' : 'text-slate-500 group-hover:text-slate-700'
                    }`}
                  >
                    {item.icon}
                  </span>
                  {!collapsed && <span>{item.label}</span>}
                  {!collapsed && active && (
                    <span className="ml-auto h-2 w-2 rounded-full bg-red-600" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-slate-200 p-3">
        {!collapsed ? (
          <div className="rounded-xl bg-slate-50 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-700">
                {user?.name?.charAt(0).toUpperCase() || 'V'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-slate-900">
                  {user?.name || 'Vendor'}
                </div>
                <div className="truncate text-xs text-slate-500">
                  {store?.store_name || 'No store yet'}
                </div>
              </div>
              <button
                onClick={logout}
                className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-white hover:text-red-600"
                aria-label="Logout"
                title="Logout"
              >
                <span className="material-symbols-outlined text-lg">logout</span>
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={logout}
            className="flex w-full items-center justify-center rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-red-600"
            title="Logout"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
          </button>
        )}
      </div>
    </aside>
  );
}