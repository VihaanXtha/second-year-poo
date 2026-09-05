import {
  LayoutDashboard,
  BarChart3,
  Users,
  Store,
  Package,
  ShoppingCart,
  FileText,
  Settings,
} from 'lucide-react';
import { NavItem } from '../types';

export const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: 'dashboard' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, path: 'analytics' },
  { id: 'users', label: 'Users', icon: Users, path: 'users' },
  { id: 'vendors', label: 'Vendors', icon: Store, path: 'vendors' },
  { id: 'products', label: 'Products', icon: Package, path: 'products' },
  { id: 'orders', label: 'Orders', icon: ShoppingCart, path: 'orders' },
  { id: 'sales', label: 'Sales Reports', icon: FileText, path: 'sales' },
  { id: 'settings', label: 'Settings', icon: Settings, path: 'settings' },
];
