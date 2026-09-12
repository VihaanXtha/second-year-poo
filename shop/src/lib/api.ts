// Server-only (non-NEXT_PUBLIC) when available so SSR inside Docker uses the
// resolvable service name (e.g. http://backend:8000/api). Falls back to the
// client-inlined NEXT_PUBLIC_API_URL for browser-side code paths.
const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

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

/**
 * The subset of Product fields that cart/wishlist mutations actually need.
 * Context methods accept this so callers can pass a full Product, a cart line,
 * or a wishlist item interchangeably without forcing a `stock` field that
 * derived views don't have.
 */
export interface ProductLike {
  id: number;
  name: string;
  price: string | number;
  image?: string;
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

export interface SearchProductsOptions {
  page?: number;
  sort?: "newest" | "popular" | "price_asc" | "price_desc";
  minPrice?: number | null;
  maxPrice?: number | null;
}

export async function searchProducts(query: string, options: SearchProductsOptions = {}) {
  const params = new URLSearchParams({ search: query, page: String(options.page ?? 1) });
  if (options.sort) params.set("sort", options.sort);
  if (options.minPrice != null && options.minPrice !== undefined) params.set("min_price", String(options.minPrice));
  if (options.maxPrice != null && options.maxPrice !== undefined) params.set("max_price", String(options.maxPrice));
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

// ---------------------------------------------------------------------------
// Cart & Wishlist — localStorage shapes (guest mode)
// ---------------------------------------------------------------------------
// A guest's cart item mirrors just enough Product data to render a line item
// without a backend round-trip. `id` is the product id.

export interface LocalCartItem {
  id: number;
  name: string;
  price: string | number;
  image?: string;
  quantity: number;
}

export interface LocalWishlistItem {
  id: number;
  name: string;
  price: string | number;
  image?: string;
}

export function getLocalCart(): LocalCartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(CART_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function setLocalCart(items: LocalCartItem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function getLocalWishlist(): LocalWishlistItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(WISHLIST_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function setLocalWishlist(items: LocalWishlistItem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
}

// ---------------------------------------------------------------------------
// Cart API
// ---------------------------------------------------------------------------

export interface CartItemResponse {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  product: Product;
}

export async function fetchCart(): Promise<{ cart_items: CartItemResponse[] }> {
  return apiClient<{ cart_items: CartItemResponse[] }>('/cart');
}

export async function addToCart(product_id: number, quantity = 1) {
  return apiClient<{ cart_item: CartItemResponse }>('/cart', {
    method: 'POST',
    body: JSON.stringify({ product_id, quantity }),
  });
}

export async function updateCartItem(cartItemId: number, quantity: number) {
  return apiClient<{ cart_item: CartItemResponse }>(`/cart/${cartItemId}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity }),
  });
}

export async function removeFromCart(cartItemId: number) {
  return apiClient(`/cart/${cartItemId}`, { method: 'DELETE' });
}

export async function clearCart() {
  return apiClient('/cart', { method: 'DELETE' });
}

/** Push a guest's localStorage cart into the backend cart (additive on conflict). */
export async function mergeCart(items: { product_id: number; quantity: number }[]) {
  return apiClient<{ cart_items: CartItemResponse[] }>('/cart/merge', {
    method: 'POST',
    body: JSON.stringify({ items }),
  });
}

// ---------------------------------------------------------------------------
// Wishlist API
// ---------------------------------------------------------------------------

export interface WishlistItemResponse {
  id: number;
  user_id: number;
  product_id: number;
  product: Product;
}

export async function fetchWishlist(): Promise<{ wishlist_items: WishlistItemResponse[] }> {
  return apiClient<{ wishlist_items: WishlistItemResponse[] }>('/wishlist');
}

export async function addToWishlist(product_id: number) {
  return apiClient<{ wishlist_item: WishlistItemResponse }>('/wishlist', {
    method: 'POST',
    body: JSON.stringify({ product_id }),
  });
}

export async function toggleWishlist(product_id: number) {
  return apiClient<{ added: boolean }>('/wishlist/toggle', {
    method: 'POST',
    body: JSON.stringify({ product_id }),
  });
}

export async function removeFromWishlist(wishlistItemId: number) {
  return apiClient(`/wishlist/${wishlistItemId}`, { method: 'DELETE' });
}

/** Push a guest's localStorage wishlist into the backend wishlist. */
export async function mergeWishlist(items: { product_id: number }[]) {
  return apiClient<{ wishlist_items: WishlistItemResponse[] }>('/wishlist/merge', {
    method: 'POST',
    body: JSON.stringify({ items }),
  });
}

// ---------------------------------------------------------------------------
// Auth — profile & password
// ---------------------------------------------------------------------------

export interface ProfileData {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  address?: string;
  city?: string;
  province?: string;
  district?: string;
  municipality?: string;
  ward?: string;
  postal_code?: string;
  country?: string;
  email_verified: boolean;
  phone_verified: boolean;
}

export async function fetchProfile(): Promise<ProfileData> {
  const res = await apiClient<{ user: ProfileData }>('/auth/me');
  return res.user;
}

export async function updateProfile(profile: {
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  district?: string;
  municipality?: string;
  ward?: string;
  postal_code?: string;
  country?: string;
}): Promise<ProfileData> {
  const res = await apiClient<{ user: ProfileData }>('/auth/update-profile', {
    method: 'POST',
    body: JSON.stringify(profile),
  });
  return res.user;
}

export async function changePassword(current_password: string, password: string, password_confirmation: string) {
  return apiClient('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ current_password, password, password_confirmation }),
  });
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  name?: string;
  product_sku: string;
  unit_price: string | number;
  price?: string | number;
  quantity: number;
  subtotal: string | number;
  product?: Product;
}

export interface Order {
  id: number;
  order_number: string;
  status: string;
  total: string | number;
  payment_method: string;
  payment_status: string;
  shipping_address: string;
  shipping_city: string;
  shipping_phone: string;
  tracking_number?: string;
  created_at: string;
  updated_at?: string;
  items?: OrderItem[];
}

export async function fetchOrders(page = 1): Promise<PaginatedResponse<Order>> {
  return apiClient<PaginatedResponse<Order>>(`/orders?page=${page}`);
}

export async function fetchOrder(orderId: number): Promise<{ order: Order }> {
  return apiClient<{ order: Order }>(`/orders/${orderId}`);
}

