const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const TOKEN_KEY = 'circuit-bazaar-token';
export const USER_KEY = 'circuit-bazaar-auth';
export const CART_KEY = 'circuit-bazaar-cart';
export const WISHLIST_KEY = 'circuit-bazaar-wishlist';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
}

export async function apiClient<T = unknown>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const token = getToken();
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    let errorMessage = `Request failed: ${response.status} ${response.statusText}`;
    try {
      const text = await response.text();
      if (text.trim()) {
        try {
          const error = JSON.parse(text);
          errorMessage = typeof error?.message === 'string' ? error.message : errorMessage;
        } catch {
          errorMessage = text.trim().slice(0, 200) || errorMessage;
        }
      }
    } catch {
      // Response body unreadable
    }
    const error = new Error(errorMessage) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  const text = await response.text();
  if (!text.trim()) {
    return {} as T;
  }

  return JSON.parse(text) as T;
}

// Three-level taxonomy, as returned by GET /categories (nested tree, snake_case keys).
export interface SuperSubCategory {
  id: number;
  sub_category_id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  display_order?: number;
  is_active: boolean;
}

export interface SubCategory {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  display_order?: number;
  is_active: boolean;
  super_sub_categories?: SuperSubCategory[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  display_order?: number;
  is_active: boolean;
  sub_categories?: SubCategory[];
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  website?: string;
  is_active: boolean;
}

export interface Product {
  id: number;
  name: string;
  sku?: string;
  description?: string;
  price: string | number;
  image?: string;
  stock: number;
  featured?: boolean;
  total_sold?: number;
  order_count?: number;
}

export interface Slider {
  id: number;
  title: string;
  subtitle?: string | null;
  image_url: string;
  headline?: string | null;
  link_url?: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface Advertisement {
  id: number;
  title?: string | null;
  image: string;
  link_type: 'product' | 'category' | 'subcategory' | 'external_url';
  link_target_id?: number | null;
  external_url?: string | null;
  link_url?: string | null;
  link_label?: string | null;
  sort_order: number;
  is_active: boolean;
}

// Laravel's plain ->paginate() JSON: { data: [...], current_page, last_page, per_page, total, ... }
export interface PaginatedResponse<T = unknown> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export async function getCategories() {
  return apiClient<{ categories: Category[] }>('/categories');
}

export async function getBrands() {
  return apiClient<{ brands: Brand[] }>('/brands');
}

export async function searchProducts(query: string, page = 1) {
  const params = new URLSearchParams({ search: query, page: String(page) });
  return apiClient<PaginatedResponse<Product>>(`/products?${params.toString()}`);
}

export async function getSliders() {
  return apiClient<{ sliders: Slider[] }>('/sliders');
}

export async function getAdvertisements() {
  return apiClient<{ advertisements: Advertisement[] }>('/advertisements');
}

export async function getFeaturedProducts() {
  return apiClient<PaginatedResponse<Product>>('/products?featured=1');
}

export async function getBestSellingProducts(perPage = 12) {
  const params = new URLSearchParams({ sort: 'popular', per_page: String(perPage) });
  return apiClient<PaginatedResponse<Product>>(`/products?${params.toString()}`);
}

export async function getProducts(page = 1, perPage = 24) {
  const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
  return apiClient<PaginatedResponse<Product>>(`/products?${params.toString()}`);
}

export function formatPrice(price: string | number): string {
  return `Rs. ${Number(price).toLocaleString('en-IN')}`;
}
