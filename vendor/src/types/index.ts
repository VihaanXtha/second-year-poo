export interface NavItem {
  id: string;
  label: string;
  icon: string;
}

export interface Product {
  id: number;
  name: string;
  sku?: string;
  description?: string;
  price: number;
  stock: number;
  category: string;
  image_url?: string;
  status?: 'active' | 'draft' | 'out_of_stock';
  created_at?: string;
  updated_at?: string;
}

export interface VendorOrder {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email?: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items_count?: number;
  created_at: string;
  shipping_address?: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
}

export interface VendorReview {
  id: number;
  product_id: number;
  product_name: string;
  customer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface SalesDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface CategoryStat {
  name: string;
  value: number;
}

export interface DashboardStats {
  total_revenue: number;
  total_orders: number;
  total_products: number;
  total_customers: number;
  revenue_change?: number;
  orders_change?: number;
  products_change?: number;
  customers_change?: number;
}