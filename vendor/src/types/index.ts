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
  day: string;
  sales: number;
  orders: number;
}

export interface CategoryData {
  name: string;
  value: number;
  color: string;
}

export interface OrderItem {
  id: number;
  orderId: string;
  customerName: string;
  customerAvatar: string;
  product: string;
  date: string;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  amount: string;
  statusColor: string;
}

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
}

export interface ListingItem {
  id: number;
  sku: string;
  name: string;
  category: string;
  price: string;
  stock: number;
  status: 'active' | 'draft';
}
