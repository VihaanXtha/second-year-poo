import React from 'react';
import { Search, Bell, Moon, Sun, LogOut } from 'lucide-react';
import { useAdminAuth } from '../context/AuthContext';

interface HeaderProps {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ collapsed, setCollapsed }) => {
  const [darkMode, setDarkMode] = React.useState(true);
  const { user, logout } = useAdminAuth();

  return (
    <header className="border-b border-slate-800 bg-slate-900 px-6 py-3 flex items-center justify-between h-16">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-slate-400 hover:text-slate-200 transition-colors p-1"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <span className="material-symbols-outlined text-[18px]">
            {collapsed ? 'menu' : 'menu_open'}
          </span>
        </button>
        <h1 className="text-xl font-bold text-white font-mono">Dashboard</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-1.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#dc2626] transition-colors"
          />
        </div>

        <button
          onClick={() => setDarkMode(!darkMode)}
          className="text-slate-400 hover:text-slate-200 transition-colors p-2 border border-slate-800 rounded-lg"
          title={darkMode ? "Light mode" : "Dark mode"}
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <button
          className="text-slate-400 hover:text-slate-200 transition-colors p-2 border border-slate-800 rounded-lg relative"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#dc2626] rounded-full"></span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#dc2626] flex items-center justify-center text-white text-[10px] font-bold">
            {user?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <span className="text-sm text-slate-300 hidden lg:block">{user?.name}</span>
          <button
            onClick={logout}
            className="text-slate-400 hover:text-red-400 transition-colors p-1"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
