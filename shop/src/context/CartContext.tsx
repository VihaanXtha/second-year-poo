"use client";

/**
 * CartContext — single source of truth for the shopping cart.
 *
 * Storage strategy (and the merge-on-login behaviour this prompt asked for):
 *   • Guest (not logged in): cart lives entirely in localStorage under CART_KEY.
 *   • Logged in: cart lives in the backend (cart_items table).
 *   • Guest → logged in transition: the localStorage cart is merged into the
 *     backend cart (POST /cart/merge, additive on conflict), then the
 *     localStorage copy is cleared so the guest cart is never double-counted.
 *   • Logged in → guest (logout): the backend cart is untouched; the local
 *     state resets to the (empty) localStorage cart.
 *
 * Other components (Header, product page, cart page) consume this context and
 * never touch localStorage directly.
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
  fetchCart,
  addToCart as apiAddToCart,
  updateCartItem as apiUpdateCartItem,
  removeFromCart as apiRemoveFromCart,
  clearCart as apiClearCart,
  mergeCart as apiMergeCart,
  getLocalCart,
  setLocalCart,
  type LocalCartItem,
  type CartItemResponse,
  type ProductLike,
} from "@/lib/api";

export interface CartLineItem {
  lineId?: number; // backend cart_items.id — undefined for guest items
  productId: number;
  name: string;
  price: number;
  image?: string;
  quantity: number;
}

interface CartContextType {
  items: CartLineItem[];
  loading: boolean;
  count: number; // total quantity across all lines (matches old header badge)
  subtotal: number;
  addItem: (product: ProductLike, quantity?: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refresh: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function normalizeLocal(items: LocalCartItem[]): CartLineItem[] {
  return items.map((it) => ({
    productId: it.id,
    name: it.name,
    price: Number(it.price),
    image: it.image,
    quantity: it.quantity,
  }));
}

function normalizeRemote(items: CartItemResponse[]): CartLineItem[] {
  return items.map((it) => ({
    lineId: it.id,
    productId: it.product_id,
// ----- normalize helpers -----


    name: it.product.name,
    price: Number(it.product.price),
    image: it.product.image,
    quantity: it.quantity,
  }));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartLineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const didInitialLoad = useRef(false);
  const prevAuthRef = useRef<boolean | null>(null);

  // ----- load from the correct source -----
  const loadFromBackend = useCallback(async () => {
    setLoading(true);
    try {
      const { cart_items } = await fetchCart();
      setItems(normalizeRemote(cart_items));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadFromStorage = useCallback(() => {
    setItems(normalizeLocal(getLocalCart()));
    setLoading(false);
  }, []);

  // ----- merge guest cart into backend on login -----
  const mergeGuestCart = useCallback(async () => {
    const guest = getLocalCart();
    if (guest.length === 0) {
      await loadFromBackend();
      return;
    }
    try {
      const merged = await apiMergeCart(
        guest.map((g) => ({ product_id: g.id, quantity: g.quantity }))
      );
      setItems(normalizeRemote(merged.cart_items));
      setLocalCart([]); // guest cart consumed — don't double-count
    } catch {
      // Merge failed: fall back to a backend load and keep the local copy
      // around so the user's items aren't silently lost.
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
    if (prev === null) return; // initial load handles first render
    if (isAuthenticated === prev) return;
    prevAuthRef.current = isAuthenticated;

    if (isAuthenticated) {
      // Guest -> logged in: merge the guest cart into the backend.
      mergeGuestCart();
    } else {
      // Logged out: drop back to (empty) localStorage cart.
      loadFromStorage();
    }
  }, [isAuthenticated, mergeGuestCart, loadFromStorage]);

  // ----- guest mutations (localStorage) -----
  const addLocal = useCallback((product: ProductLike, quantity = 1) => {
    const cart = getLocalCart();
    const existing = cart.find((it) => it.id === product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity,
      });
    }
    setLocalCart(cart);
    setItems(normalizeLocal(cart));
  }, []);

  const removeLocal = useCallback((productId: number) => {
    const cart = getLocalCart().filter((it) => it.id !== productId);
    setLocalCart(cart);
    setItems(normalizeLocal(cart));
  }, []);

  const updateLocal = useCallback((productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeLocal(productId);
      return;
    }
    const cart = getLocalCart();
    const existing = cart.find((it) => it.id === productId);
    if (existing) {
      existing.quantity = quantity;
    }
    setLocalCart(cart);
    setItems(normalizeLocal(cart));
  }, [removeLocal]);

  const clearLocal = useCallback(() => {
    setLocalCart([]);
    setItems([]);
  }, []);

  // ----- logged-in mutations (backend) -----
  const addRemote = useCallback(
    async (product: ProductLike, quantity = 1) => {
      try {
        const { cart_item } = await apiAddToCart(product.id, quantity);
        const line = normalizeRemote([cart_item])[0];
        setItems((prev) => {
          const idx = prev.findIndex((p) => p.productId === product.id);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = line; // refreshed with authoritative quantity
            return next;
          }
          return [...prev, line];
        });
      } catch {
        /* network/auth failure — keep UI state untouched */
      }
    },
    []
  );

  const removeRemote = useCallback(async (productId: number) => {
    const line = items.find((p) => p.productId === productId);
    if (line?.lineId) {
      await apiRemoveFromCart(line.lineId);
    }
    setItems((prev) => prev.filter((p) => p.productId !== productId));
  }, [items]);

  const updateRemote = useCallback(
    async (productId: number, quantity: number) => {
      if (quantity <= 0) {
        await removeRemote(productId);
        return;
      }
      const line = items.find((p) => p.productId === productId);
      if (line?.lineId) {
        try {
          await apiUpdateCartItem(line.lineId, quantity);
        } catch {
          /* keep optimistic value on failure */
        }
      }
      setItems((prev) =>
        prev.map((p) => (p.productId === productId ? { ...p, quantity } : p))
      );
    },
    [items, removeRemote]
  );

  const clearRemote = useCallback(async () => {
    await apiClearCart();
    setItems([]);
  }, []);

  // ----- public API -----
  const addItem = useCallback(
    async (product: ProductLike, quantity = 1) => {
      if (isAuthenticated) await addRemote(product, quantity);
      else addLocal(product, quantity);
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

  const updateQuantity = useCallback(
    async (productId: number, quantity: number) => {
      if (isAuthenticated) await updateRemote(productId, quantity);
      else updateLocal(productId, quantity);
    },
    [isAuthenticated, updateRemote, updateLocal]
  );

  const clearCart = useCallback(async () => {
    if (isAuthenticated) await clearRemote();
    else clearLocal();
  }, [isAuthenticated, clearRemote, clearLocal]);

  const refresh = useCallback(async () => {
    if (isAuthenticated) await loadFromBackend();
    else loadFromStorage();
  }, [isAuthenticated, loadFromBackend, loadFromStorage]);

  const count = items.reduce((n, it) => n + it.quantity, 0);
  const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, loading, count, subtotal, addItem, removeItem, updateQuantity, clearCart, refresh }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
