"use client";

import React from 'react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onOpenCheckout?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOpenCheckout,
}) => {
  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.priceNpr * item.quantity, 0);
  const freeDeliveryThreshold = 10000;
  const progressPercent = Math.min(100, (subtotal / freeDeliveryThreshold) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end animate-fade-in-down">
      <div className="w-full max-w-md bg-[#ffffff] h-full shadow-2xl flex flex-col justify-between border-l border-[#c6c6cd] animate-slide-in-right">
        
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#c6c6cd] bg-[#0f172a] text-white flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#dc2626]">shopping_cart</span>
            <div>
              <h3 className="font-bold text-base text-white">Your Hardware Cart</h3>
              <p className="text-xs font-mono text-gray-300">
                {cartItems.length} Unique {cartItems.length === 1 ? 'Item' : 'Items'} Selected
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-all"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Free Shipping Meter */}
        <div className="bg-[#f0edef] p-3.5 border-b border-[#c6c6cd] font-mono text-xs">
          {subtotal >= freeDeliveryThreshold ? (
            <div className="text-[#10b981] font-bold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">local_shipping</span>
              <span>QUALIFIED FOR FREE KATHMANDU EXPRESS SHIPPING!</span>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex justify-between text-[#45464d]">
                <span>Add Rs. {(freeDeliveryThreshold - subtotal).toLocaleString('en-IN')} for Free Delivery</span>
                <span className="font-bold">{progressPercent.toFixed(0)}%</span>
              </div>
              <div className="w-full h-1.5 bg-[#c6c6cd] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#dc2626] transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cartItems.length === 0 ? (
            <div className="text-center py-16 text-[#76777d]">
              <span className="material-symbols-outlined text-5xl mb-2 text-gray-300">remove_shopping_cart</span>
              <p className="font-bold text-sm text-black">Your hardware cart is empty</p>
              <p className="text-xs font-mono mt-1 max-w-xs mx-auto">
                Explore components or custom builds to populate your order.
              </p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.product.id}
                className="bg-[#fcf8fa] border border-[#c6c6cd] rounded-xl p-3 flex gap-3 items-center justify-between hover:border-[#000000] transition-colors"
              >
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-14 h-14 object-cover rounded-lg border border-[#c6c6cd] shrink-0"
                />

                <div className="flex-1 overflow-hidden">
                  <span className="text-[10px] font-mono text-[#dc2626] font-bold block">{item.product.sku}</span>
                  <h4 className="font-bold text-xs text-black truncate">{item.product.name}</h4>
                  <p className="text-[10px] font-mono text-gray-500 truncate">{item.product.vendorName}</p>
                  
                  <div className="flex items-center gap-2 mt-2 font-mono">
                    <div className="flex items-center border border-[#c6c6cd] rounded-lg bg-white overflow-hidden">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                        className="px-2 py-0.5 hover:bg-gray-100 text-xs font-bold"
                      >
                        -
                      </button>
                      <span className="px-2 text-xs font-bold text-black">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        className="px-2 py-0.5 hover:bg-gray-100 text-xs font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono text-xs font-bold text-black block tabular-nums">
                    Rs. {(item.product.priceNpr * item.quantity).toLocaleString('en-IN')}
                  </span>
                  <button
                    onClick={() => onRemoveItem(item.product.id)}
                    className="text-[#dc2626] hover:bg-red-50 p-1 rounded transition-colors mt-2"
                    title="Remove item"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        {cartItems.length > 0 && (
          <div className="p-4 border-t border-[#c6c6cd] bg-[#f0edef] space-y-3 font-mono">
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-[#76777d]">ESTIMATED SUBTOTAL</span>
              <span className="text-lg font-bold text-[#dc2626] tabular-nums">
                Rs. {subtotal.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={onClearCart}
                className="py-2.5 border border-[#c6c6cd] text-xs font-bold text-[#45464d] rounded-xl hover:bg-white transition-all"
              >
                Clear Cart
              </button>
              <button
                onClick={() => {
                  onClose();
                  if (onOpenCheckout) onOpenCheckout();
                }}
                className="py-2.5 bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs font-bold rounded-xl transition-all btn-press shadow-md flex items-center justify-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">lock</span>
                Checkout Now
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
