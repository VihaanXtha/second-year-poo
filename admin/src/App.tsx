import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { Analytics } from './pages/Analytics';
import { UsersPage } from './pages/UsersPage';
import { VendorsPage } from './pages/VendorsPage';
import { ProductsPage } from './pages/ProductsPage';
import { OrdersPage } from './pages/OrdersPage';
import { SalesReports } from './pages/SalesReports';
import { Login } from './pages/Login';
import { useAdminAuth } from './context/AuthContext';
import { getAdminToken, getApiUrl } from './context/AuthContext';
import './styles.css';

export default function App() {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const { isAuthenticated, logout } = useAdminAuth();

  const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const token = getAdminToken();
    const res = await fetch(`${getApiUrl()}/api${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        logout();
      }
      const error = await res.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || 'Request failed');
    }

    return res.json();
  };

  if (!isAuthenticated) {
    return <Login />;
  }

  const getTitle = () => {
    const titles: Record<string, string> = {
      dashboard: 'Dashboard',
      analytics: 'Analytics',
      users: 'Users',
      vendors: 'Vendors',
      products: 'Products',
      orders: 'Orders',
      sales: 'Sales Reports',
      settings: 'Settings',
    };
    return titles[activeNav] || 'Dashboard';
  };

  const renderPage = () => {
    switch (activeNav) {
      case 'dashboard':
        return <Dashboard apiFetch={apiFetch} />;
      case 'analytics':
        return <Analytics apiFetch={apiFetch} />;
      case 'users':
        return <UsersPage apiFetch={apiFetch} />;
      case 'vendors':
        return <VendorsPage apiFetch={apiFetch} />;
      case 'products':
        return <ProductsPage apiFetch={apiFetch} />;
      case 'orders':
        return <OrdersPage apiFetch={apiFetch} />;
      case 'sales':
        return <SalesReports apiFetch={apiFetch} />;
      case 'settings':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
              <p className="text-slate-500">Settings panel coming soon.</p>
            </div>
          </div>
        );
      default:
        return <Dashboard apiFetch={apiFetch} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      <Sidebar
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
          collapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        <Header collapsed={collapsed} setCollapsed={setCollapsed} title={getTitle()} />

        <main className="flex-1 overflow-y-auto bg-slate-50">
          <div className="p-6 max-w-[1600px] mx-auto">
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
}
