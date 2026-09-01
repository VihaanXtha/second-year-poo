import React from 'react';
import { navItems } from '../data/mockData';

interface SidebarProps {
  activeNav: string;
  setActiveNav: (id: string) => void;
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeNav, setActiveNav, collapsed, setCollapsed }) => {
  return (
    <aside className="flex flex-col h-screen bg-[#0f172a] border-r border-[#1e293b] transition-all duration-300 fixed top-0 left-0 z-40">
      <div className={`p-4 border-b border-[#1e293b] flex items-center justify-between transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
        <div className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-lg bg-[#dc2626] flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-white text-[18px]">
              storefront
            </span>
          </div>
          {!collapsed && (
            <span className="text-xl font-bold text-white whitespace-nowrap">Vendor Portal</span>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="text-slate-500 hover:text-slate-300 transition-colors p-1"
            title="Collapse sidebar"
          >
            <span className="material-symbols-outlined text-[16px]">menu_open</span>
          </button>
        )}
      </div>

      {collapsed && (
        <div className="mb-4 mx-auto">
          <button
            onClick={() => setCollapsed(false)}
            className="text-slate-500 hover:text-slate-300 transition-colors p-2 border border-[#1e293b] rounded-lg"
            title="Expand sidebar"
          >
            <span className="material-symbols-outlined text-[16px]">menu</span>
          </button>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto px-2 space-y-1 min-h-0">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveNav(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-mono transition-all duration-200 ${
              activeNav === item.id
                ? 'bg-[#dc2626]/15 text-[#dc2626] border border-[#dc2626]/30'
                : 'text-slate-400 hover:bg-[#1e293b] hover:text-slate-200'
            } ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? item.label : undefined}
          >
            <span className="material-symbols-outlined text-[16px] flex-shrink-0">{item.icon}</span>
            {!collapsed && <span className={activeNav === item.id ? 'font-bold' : ''}>{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-[#1e293b] mt-auto">
        <button
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-mono text-slate-400 hover:bg-[#1e293b] hover:text-red-400 transition-all duration-200 cursor-pointer ${collapsed ? 'justify-center' : ''}`}
          title="Logout"
        >
          <span className="material-symbols-outlined text-[16px]">logout</span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};
