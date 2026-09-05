export type CategoryType = 'PC Components' | 'IoT Gear' | 'Laptops' | 'Networking';

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: CategoryType;
  subCategory: string;
  priceNpr: number;
  image: string;
  vendorId: string;
  vendorName: string;
  vendorCode: string;
  isVerifiedVendor: boolean;
  stockStatus: 'In Stock' | 'Low Stock' | 'Pre-Order';
  stockCount: number;
  rating: number;
  reviewCount: number;
  specs: ProductSpec[];
  warranty: string;
  description: string;
  inBox: string[];
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
  targetDate: string; // ISO date string
  imageUrl: string;
}
