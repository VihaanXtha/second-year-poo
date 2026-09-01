import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { Analytics } from './pages/Analytics';
import { Orders } from './pages/Orders';
import { Inventory } from './pages/Inventory';
import { Login } from './pages/Login';
import { useVendorAuth } from './context/AuthContext';
import { getVendorToken, getApiUrl } from './context/AuthContext';
import './styles.css';

export default function App() {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const { isAuthenticated, logout } = useVendorAuth();

  const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const token = getVendorToken();
    const res = await fetch(`${getApiUrl()}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
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

  const renderPage = () => {
    switch (activeNav) {
      case 'dashboard':
        return <Dashboard apiFetch={apiFetch} />;
      case 'analytics':
        return <Analytics apiFetch={apiFetch} />;
      case 'orders':
        return <Orders apiFetch={apiFetch} />;
      case 'inventory':
        return <Inventory apiFetch={apiFetch} />;
      case 'settings':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Settings</h2>
            <div className="rounded-2xl border border-[#1e293b] bg-[#0f172a] p-8">
              <p className="text-slate-400">Settings panel coming soon.</p>
            </div>
          </div>
        );
      default:
        return <Dashboard apiFetch={apiFetch} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#020617] text-slate-100 overflow-hidden font-sans">
      <Sidebar
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'}`}>
        <Header collapsed={collapsed} setCollapsed={setCollapsed} />

        <main className="flex-1 overflow-y-auto bg-[#020617]">
          <div className="p-6">
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
}
