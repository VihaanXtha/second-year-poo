import React from 'react';
import { NavItem } from '../types';
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Store,
  Package,
  ShoppingCart,
  FileText,
  Settings,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronDown,
  FolderTree,
  FileText as BlogIcon,
  Briefcase,
  Truck,
  Image,
  Shield,
  Star,
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  BarChart3,
  Users,
  Store,
  Package,
  ShoppingCart,
  FileText,
  Settings,
  FolderTree,
  BlogIcon,
  Briefcase,
  Truck,
  Image,
  Shield,
  Star,
  ChevronDown,
  ChevronLeft,
  Menu,
  LogOut,
};

interface SidebarProps {
  activeNav: string;
  setActiveNav: (id: string) => void;
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeNav, setActiveNav, collapsed, setCollapsed }) => {
  const [usersOpen, setUsersOpen] = React.useState(false);

  const userTabs = [
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'vendors', label: 'Vendors', icon: Store },
    { id: 'admins', label: 'Admins', icon: Shield },
  ];

  const isUsersActive = userTabs.some(tab => tab.id === activeNav);

  return (
    <aside
      className={`flex flex-col h-screen bg-white border-r border-slate-200 transition-all duration-300 fixed top-0 left-0 z-40 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className={`p-4 border-b border-slate-200 flex items-center justify-between ${collapsed ? 'justify-center' : ''}`}>
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold text-slate-900 whitespace-nowrap">Circuit Bazaar</span>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
            title="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {collapsed && (
        <div className="p-2 flex justify-center">
          <button
            onClick={() => setCollapsed(false)}
            className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-lg hover:bg-slate-100"
            title="Expand sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto px-2 space-y-1 min-h-0 scrollbar-thin">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeNav === item.id
                  ? 'bg-red-50 text-primary border border-red-100'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              } ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}

        {/* Users dropdown */}
        <div className="space-y-1">
          <button
            onClick={() => !collapsed && setUsersOpen(!usersOpen)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              isUsersActive
                ? 'bg-red-50 text-primary border border-red-100'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            } ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? 'Users' : undefined}
          >
            <Users className="w-[18px] h-[18px] flex-shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1 text-left">Users</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${usersOpen ? 'rotate-180' : ''}`} />
              </>
            )}
          </button>

          {!collapsed && usersOpen && (
            <div className="ml-4 space-y-1 border-l border-slate-200 pl-3">
              {userTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveNav(tab.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeNav === tab.id
                        ? 'bg-red-50 text-primary border border-red-100'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {[
          { id: 'products', label: 'Products', icon: Package },
          { id: 'categories', label: 'Categories', icon: FolderTree },
          { id: 'blog', label: 'Blog Posts', icon: BlogIcon },
          { id: 'careers', label: 'Job Postings', icon: Briefcase },
          { id: 'testimonials', label: 'Testimonials', icon: Star },
          { id: 'courier', label: 'Courier Info', icon: Truck },
          { id: 'sliders', label: 'Homepage Sliders', icon: Image },
          { id: 'orders', label: 'Orders', icon: ShoppingCart },
          { id: 'sales', label: 'Sales Reports', icon: FileText },
          { id: 'settings', label: 'Settings', icon: Settings },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeNav === item.id
                  ? 'bg-red-50 text-primary border border-red-100'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              } ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-200">
        <button
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-primary transition-all duration-200 cursor-pointer ${
            collapsed ? 'justify-center' : ''
          }`}
          title="Logout"
        >
          <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};
