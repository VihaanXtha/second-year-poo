export interface StatCardData {
  id: number;
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: string;
  color: string;
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
  icon: string;
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

export interface SidebarState {
  collapsed: boolean;
}
