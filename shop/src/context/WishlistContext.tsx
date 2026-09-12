"use client";

/**
 * WishlistContext — single source of truth for the wishlist.
 *
 * Storage strategy (mirrors CartContext — both guest and logged-in are
 * supported so the behaviour is consistent and documented):
 *   • Guest (not logged in): wishlist lives in localStorage under WISHLIST_KEY.
 *   • Logged in: wishlist lives in the backend (wishlist_items table).
 *   • Guest → logged in transition: localStorage wishlist is merged into the
 *     backend (POST /wishlist/merge), then the localStorage copy is cleared.
 *   • Logged in → guest (logout): backend wishlist untouched; local state
 *     resets to the (empty) localStorage wishlist.
 *
 * DECISION: wishlist is available to guests (same as cart), merging on login.
 * This is the consistent choice — both features behave identically w.r.t.
 * auth, which is what a shopper expects.
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { useAuth } from "@/context/AuthContext";
import {
  fetchWishlist,
  addToWishlist as apiAddToWishlist,
  toggleWishlist as apiToggleWishlist,
  removeFromWishlist as apiRemoveFromWishlist,
  mergeWishlist as apiMergeWishlist,
  getLocalWishlist,
  setLocalWishlist,
  type LocalWishlistItem,
  type WishlistItemResponse,
  type ProductLike,
} from "@/lib/api";

export interface WishlistItem {
  lineId?: number; // backend wishlist_items.id — undefined for guest items
  productId: number;
  name: string;
  price: number;
  image?: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  loading: boolean;
  count: number;
  addItem: (product: ProductLike) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  toggle: (product: ProductLike) => Promise<boolean>; // returns true if now present
  has: (productId: number) => boolean;
  refresh: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

function normalizeLocal(items: LocalWishlistItem[]): WishlistItem[] {
  return items.map((it) => ({
    productId: it.id,
    name: it.name,
    price: Number(it.price),
    image: it.image,
  }));
}

function normalizeRemote(items: WishlistItemResponse[]): WishlistItem[] {
  return items.map((it) => ({
    lineId: it.id,
    productId: it.product_id,
    name: it.product.name,
    price: Number(it.product.price),
    image: it.product.image,
  }));
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const didInitialLoad = useRef(false);
  const prevAuthRef = useRef<boolean | null>(null);

  const loadFromBackend = useCallback(async () => {
    setLoading(true);
    try {
      const { wishlist_items } = await fetchWishlist();
      setItems(normalizeRemote(wishlist_items));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadFromStorage = useCallback(() => {
    setItems(normalizeLocal(getLocalWishlist()));
    setLoading(false);
  }, []);

  const mergeGuestWishlist = useCallback(async () => {
    const guest = getLocalWishlist();
    if (guest.length === 0) {
      await loadFromBackend();
      return;
    }
    try {
      const merged = await apiMergeWishlist(guest.map((g) => ({ product_id: g.id })));
      setItems(normalizeRemote(merged.wishlist_items));
      setLocalWishlist([]);
    } catch {
      await loadFromBackend();
    } finally {
      setLoading(false);
    }
  }, [loadFromBackend]);

  // ----- initial load -----
  useEffect(() => {
    if (didInitialLoad.current) return;
    didInitialLoad.current = true;
    prevAuthRef.current = isAuthenticated;
    if (isAuthenticated) {
      loadFromBackend();
    } else {
      loadFromStorage();
    }
  }, [isAuthenticated, loadFromBackend, loadFromStorage]);

  // ----- react to auth transitions -----
  useEffect(() => {
    const prev = prevAuthRef.current;
    if (prev === null) return;
    if (isAuthenticated === prev) return;
    prevAuthRef.current = isAuthenticated;

    if (isAuthenticated) {
      mergeGuestWishlist();
    } else {
      loadFromStorage();
    }
  }, [isAuthenticated, mergeGuestWishlist, loadFromStorage]);

  // ----- guest mutations (localStorage) -----
  const addLocal = useCallback((product: ProductLike) => {
    const list = getLocalWishlist();
    if (!list.some((it) => it.id === product.id)) {
      list.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
      });
      setLocalWishlist(list);
    }
    setItems(normalizeLocal(list));
  }, []);

  const removeLocal = useCallback((productId: number) => {
    const list = getLocalWishlist().filter((it) => it.id !== productId);
    setLocalWishlist(list);
    setItems(normalizeLocal(list));
  }, []);

  const toggleLocal = useCallback((product: ProductLike): boolean => {
    const list = getLocalWishlist();
    const exists = list.some((it) => it.id === product.id);
    if (exists) {
      const next = list.filter((it) => it.id !== product.id);
      setLocalWishlist(next);
      setItems(normalizeLocal(next));
      return false;
    }
    list.push({ id: product.id, name: product.name, price: product.price, image: product.image });
    setLocalWishlist(list);
    setItems(normalizeLocal(list));
    return true;
  }, []);

  // ----- logged-in mutations (backend) -----
  const addRemote = useCallback(async (product: ProductLike) => {
    try {
      const { wishlist_item } = await apiAddToWishlist(product.id);
      const line = normalizeRemote([wishlist_item])[0];
      setItems((prev) =>
        prev.some((p) => p.productId === product.id) ? prev : [...prev, line]
      );
    } catch {
      /* swallow */
    }
  }, []);

  const removeRemote = useCallback(async (productId: number) => {
    const line = items.find((p) => p.productId === productId);
    if (line?.lineId) {
      await apiRemoveFromWishlist(line.lineId);
    }
    setItems((prev) => prev.filter((p) => p.productId !== productId));
  }, [items]);

  const toggleRemote = useCallback(async (product: ProductLike): Promise<boolean> => {
    const exists = items.some((p) => p.productId === product.id);
    try {
      const res = await apiToggleWishlist(product.id);
      const added = res.added;
      if (added) {
        // Re-fetch to get the authoritative lineId/product data.
        const { wishlist_items } = await fetchWishlist();
        setItems(normalizeRemote(wishlist_items));
      } else {
        setItems((prev) => prev.filter((p) => p.productId !== product.id));
      }
      return added;
    } catch {
      return !exists; // report no change on failure
    }
  }, [items]);

  // ----- public API -----
  const addItem = useCallback(
    async (product: ProductLike) => {
      if (isAuthenticated) await addRemote(product);
      else addLocal(product);
    },
    [isAuthenticated, addRemote, addLocal]
  );

  const removeItem = useCallback(
    async (productId: number) => {
      if (isAuthenticated) await removeRemote(productId);
      else removeLocal(productId);
    },
    [isAuthenticated, removeRemote, removeLocal]
  );

  const toggle = useCallback(
    async (product: ProductLike): Promise<boolean> => {
      if (isAuthenticated) return toggleRemote(product);
      return toggleLocal(product);
    },
    [isAuthenticated, toggleRemote, toggleLocal]
  );

  const has = useCallback(
    (productId: number) => items.some((p) => p.productId === productId),
    [items]
  );

  const refresh = useCallback(async () => {
    if (isAuthenticated) await loadFromBackend();
    else loadFromStorage();
  }, [isAuthenticated, loadFromBackend, loadFromStorage]);

  const count = items.length;

  return (
    <WishlistContext.Provider
      value={{ items, loading, count, addItem, removeItem, toggle, has, refresh }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextType {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within a WishlistProvider");
  return ctx;
}
