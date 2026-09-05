"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { Product } from '@/types';
import { apiClient } from '@/lib/api';

interface WishlistItem {
  product: Product;
  addedAt: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  addItem: (product: Product) => Promise<void>;
  removeItem: (productId: string) => void;
  hasItem: (productId: string) => boolean;
  toggleItem: (product: Product) => Promise<void>;
  clearWishlist: () => void;
  count: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = 'circuit-bazaar-wishlist';

function readWishlist(): WishlistItem[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? (parsed as WishlistItem[]) : [];
  } catch {
    localStorage.removeItem(WISHLIST_STORAGE_KEY);
    return [];
  }
}

function storeWishlist(items: WishlistItem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>(readWishlist);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    storeWishlist(items);
  }, [items]);

  const addItem = useCallback(
    async (product: Product) => {
      try {
        await apiClient('/wishlist', {
          method: 'POST',
          body: JSON.stringify({ product_id: product.id }),
        });
      } catch {
        // ignore
      }
      setItems((prev) => {
        if (prev.some((i) => i.product.id === product.id)) return prev;
        return [...prev, { product, addedAt: new Date().toISOString() }];
      });
    },
    []
  );

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const hasItem = useCallback(
    (productId: string) => items.some((i) => i.product.id === productId),
    [items]
  );

  const toggleItem = useCallback(
    async (product: Product) => {
      if (hasItem(product.id)) {
        removeItem(product.id);
      } else {
        await addItem(product);
      }
    },
    [hasItem, addItem, removeItem]
  );

  const clearWishlist = useCallback(() => {
    setItems([]);
  }, []);

  const count = items.length;

  if (!hydrated) {
    return null;
  }

  return (
    <WishlistContext.Provider
      value={{ items, addItem, removeItem, hasItem, toggleItem, clearWishlist, count }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
