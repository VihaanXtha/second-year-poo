import React from 'react';
import { Search, Bell, Sun, LogOut, Menu } from 'lucide-react';
import { useAdminAuth } from '../context/AuthContext';

interface HeaderProps {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ collapsed, setCollapsed, title }) => {
  const { user, logout } = useAdminAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-slate-500 hover:text-slate-700 transition-colors p-1.5 rounded-lg hover:bg-slate-100"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-64 bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
          />
        </div>

        <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full ring-2 ring-white" />
        </button>

        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
            {user?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <span className="text-sm font-medium text-slate-700 hidden lg:block">{user?.name}</span>
          <button
            onClick={logout}
            className="text-slate-400 hover:text-primary transition-colors p-1.5 rounded-lg hover:bg-slate-100"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
