export interface StatCardData {
  id: number;
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

export interface RevenueDataPoint {
  month: string;
  revenue: number;
  orders: number;
}

export interface CategoryData {
  name: string;
  value: number;
  color: string;
}

export interface ActivityItem {
  id: number;
  userName: string;
  userAvatar: string;
  action: string;
  target: string;
  time: string;
  status: 'Active' | 'Pending' | 'Completed';
  amount: string;
  statusColor: string;
}

export interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive';
  joinDate: string;
  avatar: string;
}

export interface Vendor {
  id: number;
  store_name: string;
  user: { name: string; email: string };
  status: string;
  products_count: number;
  total_sales: number;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  stock: number;
  status: string;
  vendor_store: { store_name: string };
  category: { name: string };
  created_at: string;
}

export interface Order {
  id: number;
  order_number: string;
  status: string;
  total: number;
  payment_status: string;
  shipping_city: string;
  created_at: string;
  user: { name: string };
  items?: any[];
}

export interface SalesReport {
  month: string;
  year: number;
  revenue: number;
  orders: number;
  customers: number;
}
