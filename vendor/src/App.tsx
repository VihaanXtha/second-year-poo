import React, { useMemo, useState } from 'react';
import { useVendorAuth, getApiUrl } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { StorePage } from './pages/Store';
import { Products } from './pages/Products';
import { Orders } from './pages/Orders';
import { Sales } from './pages/Sales';
import { Analytics } from './pages/Analytics';
import { Reviews } from './pages/Reviews';

export type ApiFetch = <T = any>(endpoint: string, options?: RequestInit) => Promise<T>;

export default function App() {
  const { isAuthenticated, loading, logout } = useVendorAuth();
  const [activeNav, setActiveNav] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);

  const apiFetch = useMemo<ApiFetch>(() => {
    return async <T = any,>(endpoint: string, options: RequestInit = {}): Promise<T> => {
      const token = localStorage.getItem('vendor-token');
      const headers: Record<string, string> = {
        Accept: 'application/json',
        ...(options.body && !(options.body instanceof FormData)
          ? { 'Content-Type': 'application/json' }
          : {}),
        ...(options.headers as Record<string, string> | undefined),
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${getApiUrl()}${endpoint}`, { ...options, headers });

      if (res.status === 401 || res.status === 403) {
        logout();
      }

      const contentType = res.headers.get('content-type') || '';
      const isJson = contentType.includes('application/json');
      const payload = isJson ? await res.json().catch(() => ({})) : await res.text();

      if (!res.ok) {
        const message =
          (isJson && (payload as any).message) || (typeof payload === 'string' ? payload : 'Request failed');
        throw new Error(message || 'Request failed');
      }
      return payload as T;
    };
  }, [logout]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-red-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  const renderPage = () => {
    switch (activeNav) {
      case 'dashboard':
        return <Dashboard apiFetch={apiFetch} setActiveNav={setActiveNav} />;
      case 'store':
        return <StorePage apiFetch={apiFetch} />;
      case 'products':
        return <Products apiFetch={apiFetch} />;
      case 'orders':
        return <Orders apiFetch={apiFetch} />;
      case 'sales':
        return <Sales apiFetch={apiFetch} />;
      case 'analytics':
        return <Analytics apiFetch={apiFetch} />;
      case 'reviews':
        return <Reviews apiFetch={apiFetch} />;
      default:
        return <Dashboard apiFetch={apiFetch} setActiveNav={setActiveNav} />;
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
          collapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <Header collapsed={collapsed} setCollapsed={setCollapsed} activeNav={activeNav} />
        <main className="flex-1 overflow-y-auto bg-slate-50">
          <div className="mx-auto max-w-7xl p-6 lg:p-8 fade-in">{renderPage()}</div>
        </main>
      </div>
    </div>
  );
}