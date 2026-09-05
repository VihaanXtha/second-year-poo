export type CategoryType = 'PC Components' | 'IoT Gear' | 'Laptops' | 'Networking';

export type StockStatus = 'In Stock' | 'Low Stock' | 'Pre-Order';

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  category: CategoryType;
  subCategory: string;
  priceNpr: number;
  originalPriceNpr?: number;
  discountPercent?: number;
  image: string;
  images?: string[];
  badges?: string[];
  vendorId: string;
  vendorName: string;
  vendorCode: string;
  isVerifiedVendor: boolean;
  stockStatus: StockStatus;
  stockCount: number;
  rating: number;
  reviewCount: number;
  warranty: string;
  description: string;
  inBox: string[];
  specs: ProductSpec[];
  tags?: string[];
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  hasDeal?: boolean;
  comingSoonDate?: string;
}

export interface Vendor {
  id: string;
  code: string;
  name: string;
  rating: number;
  reviewsCount: number;
  specialty: string;
  badgeBg: string;
  location: string;
  verifiedSince: string;
  address: string;
  phone: string;
  description: string;
  totalProducts: number;
}

export interface BuildPart {
  componentType: string;
  name: string;
  sku: string;
  priceNpr: number;
  vendorName: string;
}

export interface CommunityBuild {
  id: string;
  title: string;
  subtitle: string;
  priceNpr: number;
  image: string;
  builder: string;
  partsList: BuildPart[];
  likes: number;
  description: string;
  category: 'Gaming & Streaming' | 'IoT Node' | 'Server / NAS' | 'Workstation';
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface HardwareDrop {
  id: string;
  title: string;
  tag: string;
  description: string;
  targetDate: string;
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface OrderItem {
  product: Product;
  quantity: number;
  priceAtPurchase: number;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  total: number;
  status: OrderStatus;
  paymentMethod: 'card' | 'cod' | 'eSewa' | 'Khalti' | 'bank_transfer';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingAddress: Address;
  trackingNumber?: string;
  placedAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  email_verified: boolean;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  callToAction: string;
  href: string;
  image: string;
  align?: 'left' | 'center' | 'right';
}

export interface Brand {
  id: string;
  name: string;
  image: string;
  href: string;
  isPremium?: boolean;
}

export interface CategoryInfo {
  id: string;
  name: string;
  icon: string;
  href: string;
  image: string;
  productCount: number;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  readTimeMinutes: number;
  image: string;
  tags: string[];
}

export interface CareerPost {
  id: string;
  slug: string;
  title: string;
  department: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Internship' | 'Contract';
  level: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  postedAt: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}
