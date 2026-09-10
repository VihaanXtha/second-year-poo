import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { Analytics } from './pages/Analytics';
import { CustomersPage } from './pages/CustomersPage';
import { AdminsPage } from './pages/AdminsPage';
import { VendorsPage } from './pages/VendorsPage';
import { ProductsPage } from './pages/ProductsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { OrdersPage } from './pages/OrdersPage';
import { SalesReports } from './pages/SalesReports';
import { BlogPostsPage } from './pages/BlogPostsPage';
import { JobPostingsPage } from './pages/JobPostingsPage';
import { TestimonialsPage } from './pages/TestimonialsPage';
import { CourierPage } from './pages/CourierPage';
import { SlidersPage } from './pages/SlidersPage';
import { AdvertisementsPage } from './pages/AdvertisementsPage';
import Settings from './pages/Settings';
import { Login } from './pages/Login';
import { SubCategoriesPage } from './pages/SubCategoriesPage';
import { SuperSubCategoriesPage } from './pages/SuperSubCategoriesPage';
import { BrandsPage } from './pages/BrandsPage';
import { FaqPage } from './pages/FaqPage';
import { useAdminAuth } from './context/AuthContext';
import { getAdminToken, getApiUrl } from './context/AuthContext';
import './styles.css';

export default function App() {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const { isAuthenticated, logout } = useAdminAuth();

  const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const token = getAdminToken();
    const isFormData = options.body instanceof FormData;
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    const res = await fetch(`${getApiUrl()}/api${endpoint}`, {
      ...options,
      headers: {
        ...headers,
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

  const getTitle = () => {
    const titles: Record<string, string> = {
      dashboard: 'Dashboard',
      analytics: 'Analytics',
      customers: 'Customers',
      vendors: 'Vendors',
      admins: 'Admins',
      products: 'Products',
      categories: 'Categories',
      orders: 'Orders',
      sales: 'Sales Reports',
      blog: 'Blog Posts',
      careers: 'Job Postings',
      testimonials: 'Testimonials',
      courier: 'Courier Info',
      sliders: 'Homepage Sliders',
      advertisements: 'Advertisements',
      settings: 'Settings',
      subcategories: 'Sub Categories',
      supersubcategories: 'Super Sub Categories',
      brands: 'Brands',
      faq: 'FAQ',
    };
    return titles[activeNav] || 'Dashboard';
  };

  const renderPage = () => {
    switch (activeNav) {
      case 'dashboard':
        return <Dashboard apiFetch={apiFetch} />;
      case 'analytics':
        return <Analytics apiFetch={apiFetch} />;
      case 'customers':
        return <CustomersPage apiFetch={apiFetch} />;
      case 'vendors':
        return <VendorsPage apiFetch={apiFetch} />;
      case 'admins':
        return <AdminsPage apiFetch={apiFetch} />;
      case 'products':
        return <ProductsPage apiFetch={apiFetch} />;
      case 'categories':
        return <CategoriesPage apiFetch={apiFetch} />;
      case 'orders':
        return <OrdersPage apiFetch={apiFetch} />;
      case 'sales':
        return <SalesReports apiFetch={apiFetch} />;
      case 'blog':
        return <BlogPostsPage apiFetch={apiFetch} />;
      case 'careers':
        return <JobPostingsPage apiFetch={apiFetch} />;
      case 'testimonials':
        return <TestimonialsPage apiFetch={apiFetch} />;
      case 'courier':
        return <CourierPage apiFetch={apiFetch} />;
      case 'sliders':
        return <SlidersPage apiFetch={apiFetch} />;
      case 'advertisements':
        return <AdvertisementsPage apiFetch={apiFetch} />;
      case 'settings':
        return <Settings />;
      case 'subcategories':
        return <SubCategoriesPage apiFetch={apiFetch} />;
      case 'supersubcategories':
        return <SuperSubCategoriesPage apiFetch={apiFetch} />;
      case 'brands':
        return <BrandsPage apiFetch={apiFetch} />;
      case 'faq':
        return <FaqPage apiFetch={apiFetch} />;
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
