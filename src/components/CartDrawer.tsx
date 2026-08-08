import React, { useState } from 'react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart
}) => {
  const [selectedPayment, setSelectedPayment] = useState<'esewa' | 'khalti' | 'bank' | 'cod'>('esewa');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.priceNpr * item.quantity, 0);
  const vatAmount = Math.round(subtotal * 0.13); // 13% VAT in Nepal
  const grandTotal = subtotal + vatAmount;

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;
    setOrderConfirmed(true);
    setTimeout(() => {
      onClearCart();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#ffffff] shadow-2xl border-l border-[#c6c6cd] flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-4 bg-[#0f172a] text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#38bdf8]">shopping_cart</span>
              <h2 className="font-bold text-base">Your Cart & Spec Summary</h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>

          {orderConfirmed ? (
            <div className="p-8 text-center flex-1 flex flex-col justify-center items-center">
              <div className="w-16 h-16 bg-[#10b981]/20 rounded-full flex items-center justify-center text-[#10b981] mb-4">
                <span className="material-symbols-outlined text-4xl">verified</span>
              </div>
              <h3 className="text-xl font-bold text-[#000000] mb-1">Order Confirmed!</h3>
              <p className="text-xs font-mono text-[#45464d] mb-4">
                Order ID: <span className="font-bold text-[#dc2626]">#CB-NP-{Math.floor(100000 + Math.random() * 900000)}</span>
              </p>
              <p className="text-xs text-[#45464d] mb-6 leading-relaxed bg-[#f0edef] p-3 rounded border border-[#c6c6cd]/60">
                A verification invoice has been generated. The verified vendor will dispatch your hardware with genuine manufacturer warranty docs to <span className="font-bold text-[#000000]">{shippingAddress || 'your address'}</span>.
              </p>
              <button
                onClick={() => {
                  setOrderConfirmed(false);
                  setIsCheckingOut(false);
                  onClose();
                }}
                className="w-full bg-[#000000] text-white font-mono text-xs font-bold py-3 rounded hover:bg-[#1f2937]"
              >
                Continue Browsing
              </button>
            </div>
          ) : (
            <>
              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cartItems.length === 0 ? (
                  <div className="text-center py-12 text-[#76777d]">
                    <span className="material-symbols-outlined text-4xl mb-2">shopping_bag</span>
                    <p className="font-mono text-xs">Your cart is currently empty.</p>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center text-xs font-mono pb-2 border-b border-[#c6c6cd]">
                      <span className="text-[#45464d]">SELECTED HARDWARE ({cartItems.length})</span>
                      <button onClick={onClearCart} className="text-[#dc2626] hover:underline">
                        Clear All
                      </button>
                    </div>

                    {cartItems.map((item) => (
                      <div
                        key={item.product.id}
                        className="bg-[#f6f3f5] border border-[#c6c6cd] rounded p-3 flex gap-3 text-xs"
                      >
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-14 h-14 object-cover rounded border border-[#c6c6cd]"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-mono text-[10px] text-[#dc2626] font-bold">{item.product.sku}</div>
                          <h4 className="font-bold text-[#000000] text-xs truncate">{item.product.name}</h4>
                          <div className="text-[10px] text-[#76777d] font-mono mt-0.5">Vendor: {item.product.vendorName}</div>

                          <div className="flex justify-between items-center mt-2">
                            <span className="font-mono font-bold text-[#000000]">
                              Rs. {(item.product.priceNpr * item.quantity).toLocaleString('en-IN')}
                            </span>

                            <div className="flex items-center gap-2">
                              <div className="flex items-center border border-[#c6c6cd] rounded bg-white font-mono text-xs">
                                <button
                                  onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                                  className="px-2 py-0.5 hover:bg-gray-100"
                                >
                                  -
                                </button>
                                <span className="px-2 font-bold">{item.quantity}</span>
                                <button
                                  onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                                  className="px-2 py-0.5 hover:bg-gray-100"
                                >
                                  +
                                </button>
                              </div>

                              <button
                                onClick={() => onRemoveItem(item.product.id)}
                                className="text-[#dc2626] hover:text-[#b91c1c] p-0.5"
                              >
                                <span className="material-symbols-outlined text-[16px]">delete</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>

              {/* Checkout Form & Total Footer */}
              {cartItems.length > 0 && (
                <div className="p-4 bg-[#f0edef] border-t border-[#c6c6cd] space-y-3 font-mono text-xs">
                  {isCheckingOut ? (
                    <form onSubmit={handleCheckout} className="space-y-3 animate-in fade-in">
                      <div>
                        <label className="block text-[10px] font-bold text-[#45464d] mb-1">DELIVERY ADDRESS (NEPAL)</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. House 42, Maitighar, Kathmandu"
                          value={shippingAddress}
                          onChange={(e) => setShippingAddress(e.target.value)}
                          className="w-full border border-[#c6c6cd] rounded px-2.5 py-1.5 bg-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#45464d] mb-1">CONTACT PHONE NUMBER</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 9841234567"
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          className="w-full border border-[#c6c6cd] rounded px-2.5 py-1.5 bg-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-[#45464d] mb-1">PAYMENT GATEWAY</label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: 'esewa', label: 'eSewa (Fonepay)', badge: 'eSewa' },
                            { id: 'khalti', label: 'Khalti Wallet', badge: 'Khalti' },
                            { id: 'bank', label: 'Bank Transfer', badge: 'Bank' },
                            { id: 'cod', label: 'Cash on Delivery', badge: 'COD' }
                          ].map((pay) => (
                            <button
                              key={pay.id}
                              type="button"
                              onClick={() => setSelectedPayment(pay.id as any)}
                              className={`p-2 rounded border text-left font-bold transition-all ${
                                selectedPayment === pay.id
                                  ? 'border-[#000000] bg-[#000000] text-white'
                                  : 'border-[#c6c6cd] bg-white text-[#45464d]'
                              }`}
                            >
                              <div className="text-[10px]">{pay.badge}</div>
                              <div className="text-[11px] truncate">{pay.label}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsCheckingOut(false)}
                          className="w-1/3 py-2.5 border border-[#c6c6cd] font-bold rounded bg-white hover:bg-gray-50"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          className="w-2/3 py-2.5 bg-[#dc2626] text-white font-bold rounded hover:bg-[#b91c1c]"
                        >
                          Place Order (Rs. {grandTotal.toLocaleString('en-IN')})
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between text-[#45464d]">
                          <span>Subtotal:</span>
                          <span>Rs. {subtotal.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-[#45464d]">
                          <span>13% VAT (Nepal Tax):</span>
                          <span>Rs. {vatAmount.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between font-bold text-sm text-[#000000] pt-1 border-t border-[#c6c6cd]">
                          <span>Total Amount:</span>
                          <span>Rs. {grandTotal.toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setIsCheckingOut(true)}
                        className="w-full bg-[#dc2626] hover:bg-[#b91c1c] text-white font-bold py-3 rounded text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">verified</span>
                        Proceed to Specification Checkout
                      </button>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
