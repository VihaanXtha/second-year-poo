"use client";

import React, { useState } from 'react';
import { CartItem } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onClearCart: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onClearCart,
}) => {
  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');
  const [paymentMethod, setPaymentMethod] = useState<'esewa' | 'khalti' | 'cod' | 'bank'>('esewa');
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    city: 'Kathmandu',
    address: '',
    notes: '',
  });

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.priceNpr * item.quantity, 0);
  const deliveryCharge = formData.city === 'Kathmandu' || formData.city === 'Lalitpur' ? (subtotal >= 10000 ? 0 : 250) : 450;
  const grandTotal = subtotal + deliveryCharge;

  const handleNextToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.fullName && formData.phone && formData.address) {
      setStep('payment');
    }
  };

  const handlePlaceOrder = () => {
    setStep('success');
    onClearCart();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in-down overflow-y-auto">
      <div className="bg-[#ffffff] border border-[#c6c6cd] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto">
        
        {/* Header */}
        <div className="bg-[#0f172a] text-white p-4 sm:p-5 flex justify-between items-center border-b border-[#1e293b]">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#dc2626] text-2xl">local_shipping</span>
            <div>
              <h3 className="font-bold text-lg text-white">Circuit Bazaar Checkout</h3>
              <p className="text-xs text-gray-300 font-mono">Nepal Verified Hardware Dispatch</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:rotate-90 transition-all p-1"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Step indicators */}
        <div className="bg-[#f0edef] px-6 py-3 border-b border-[#c6c6cd] flex justify-between font-mono text-xs">
          <span className={`font-bold flex items-center gap-1 ${step === 'details' ? 'text-[#dc2626]' : 'text-black'}`}>
            1. Shipping Details
          </span>
          <span className={`font-bold flex items-center gap-1 ${step === 'payment' ? 'text-[#dc2626]' : step === 'success' ? 'text-black' : 'text-gray-400'}`}>
            2. Payment Method
          </span>
          <span className={`font-bold flex items-center gap-1 ${step === 'success' ? 'text-[#10b981]' : 'text-gray-400'}`}>
            3. Order Receipt
          </span>
        </div>

        {/* Body content */}
        <div className="p-6">
          {step === 'details' && (
            <form onSubmit={handleNextToPayment} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-[#45464d] mb-1">FULL NAME *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sujan Shrestha"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full border border-[#c6c6cd] rounded-lg px-3 py-2 text-sm font-mono focus:border-[#000000] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono font-bold text-[#45464d] mb-1">PHONE NUMBER *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9841000000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border border-[#c6c6cd] rounded-lg px-3 py-2 text-sm font-mono focus:border-[#000000] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-[#45464d] mb-1">CITY / REGION *</label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full border border-[#c6c6cd] rounded-lg px-3 py-2 text-sm font-mono focus:border-[#000000] focus:outline-none bg-white"
                  >
                    <option value="Kathmandu">Kathmandu Valley</option>
                    <option value="Lalitpur">Lalitpur</option>
                    <option value="Bhaktapur">Bhaktapur</option>
                    <option value="Pokhara">Pokhara</option>
                    <option value="Chitwan">Chitwan</option>
                    <option value="Outside Valley">Outside Valley Express Courier</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono font-bold text-[#45464d] mb-1">EMAIL ADDRESS</label>
                  <input
                    type="email"
                    placeholder="e.g. customer@domain.np"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-[#c6c6cd] rounded-lg px-3 py-2 text-sm font-mono focus:border-[#000000] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#45464d] mb-1">DELIVERY ADDRESS *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Street name, landmark, building name..."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full border border-[#c6c6cd] rounded-lg px-3 py-2 text-sm font-mono focus:border-[#000000] focus:outline-none"
                />
              </div>

              <div className="bg-[#f6f3f5] border border-[#c6c6cd] rounded-xl p-4 space-y-1.5 font-mono text-xs">
                <div className="flex justify-between text-[#45464d]">
                  <span>Subtotal ({cartItems.length} items):</span>
                  <span>Rs. {subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[#45464d]">
                  <span>Estimated Shipping ({formData.city}):</span>
                  <span>{deliveryCharge === 0 ? <strong className="text-[#10b981]">FREE</strong> : `Rs. ${deliveryCharge}`}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-black border-t border-[#c6c6cd] pt-2">
                  <span>Grand Total:</span>
                  <span className="text-[#dc2626]">Rs. {grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-[#c6c6cd] text-xs font-mono font-bold rounded-lg hover:bg-[#f6f3f5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs font-mono font-bold rounded-lg btn-press shadow-md"
                >
                  Proceed to Payment &rarr;
                </button>
              </div>
            </form>
          )}

          {step === 'payment' && (
            <div className="space-y-6">
              <h4 className="font-bold text-sm text-black font-mono">SELECT PAYMENT METHOD</h4>

              <div className="grid grid-cols-2 gap-4 font-mono text-xs">
                <button
                  onClick={() => setPaymentMethod('esewa')}
                  className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                    paymentMethod === 'esewa'
                      ? 'border-[#10b981] bg-[#10b981]/10 ring-2 ring-[#10b981]'
                      : 'border-[#c6c6cd] hover:border-black'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-[#60bb46] text-white font-bold flex items-center justify-center text-xs">
                    eS
                  </div>
                  <span className="font-bold text-black">eSewa Wallet</span>
                  <span className="text-[10px] text-gray-500">Instant Digital Direct Pay</span>
                </button>

                <button
                  onClick={() => setPaymentMethod('khalti')}
                  className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                    paymentMethod === 'khalti'
                      ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-600'
                      : 'border-[#c6c6cd] hover:border-black'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-purple-700 text-white font-bold flex items-center justify-center text-xs">
                    Kh
                  </div>
                  <span className="font-bold text-black">Khalti Digital Wallet</span>
                  <span className="text-[10px] text-gray-500">Instant Web/Mobile Pay</span>
                </button>

                <button
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-black bg-black/5 ring-2 ring-black'
                      : 'border-[#c6c6cd] hover:border-black'
                  }`}
                >
                  <span className="material-symbols-outlined text-2xl text-black">payments</span>
                  <span className="font-bold text-black">Cash on Delivery</span>
                  <span className="text-[10px] text-gray-500">Pay on inspect at delivery</span>
                </button>

                <button
                  onClick={() => setPaymentMethod('bank')}
                  className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                    paymentMethod === 'bank'
                      ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600'
                      : 'border-[#c6c6cd] hover:border-black'
                  }`}
                >
                  <span className="material-symbols-outlined text-2xl text-blue-700">account_balance</span>
                  <span className="font-bold text-black">Bank FONEPAY QR</span>
                  <span className="text-[10px] text-gray-500">Mobile banking scan</span>
                </button>
              </div>

              <div className="bg-[#f0edef] p-4 rounded-xl border border-[#c6c6cd] text-xs font-mono space-y-1">
                <div className="flex justify-between text-gray-600">
                  <span>Recipient:</span>
                  <span className="font-bold text-black">{formData.fullName} ({formData.phone})</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping Address:</span>
                  <span className="font-bold text-black">{formData.address}, {formData.city}</span>
                </div>
                <div className="flex justify-between text-black font-bold pt-2 border-t border-[#c6c6cd] text-sm">
                  <span>Total Payable:</span>
                  <span className="text-[#dc2626]">Rs. {grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex justify-between gap-3 pt-2">
                <button
                  onClick={() => setStep('details')}
                  className="px-4 py-2 border border-[#c6c6cd] text-xs font-mono font-bold rounded-lg hover:bg-[#f6f3f5]"
                >
                  &larr; Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  className="px-6 py-2.5 bg-[#10b981] hover:bg-emerald-700 text-white text-xs font-mono font-bold rounded-lg btn-press shadow-md flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  Confirm & Place Order
                </button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-6 space-y-4 animate-scale-in">
              <div className="w-16 h-16 bg-[#10b981]/20 text-[#10b981] rounded-full flex items-center justify-center mx-auto border border-[#10b981]">
                <span className="material-symbols-outlined text-4xl">check_circle</span>
              </div>

              <div>
                <h4 className="font-bold text-xl text-black">Order Placed Successfully!</h4>
                <p className="text-xs font-mono text-gray-600 mt-1">
                  Order ID: <strong className="text-black">CB-NP-2026-{Math.floor(1000 + Math.random() * 9000)}</strong>
                </p>
              </div>

              <div className="bg-[#f6f3f5] p-4 rounded-xl border border-[#c6c6cd] max-w-md mx-auto text-left text-xs font-mono space-y-2">
                <p className="text-[#10b981] font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  Verified Vendor Notification Sent
                </p>
                <p className="text-gray-600">
                  Your hardware order has been dispatched to vendor partners in {formData.city}. Estimated arrival: <strong>1 to 2 Working Days</strong>.
                </p>
              </div>

              <button
                onClick={onClose}
                className="px-8 py-3 bg-[#000000] text-white text-xs font-mono font-bold rounded-xl hover:bg-gray-800 transition-all btn-press shadow-md"
              >
                Back to Hardware Bazaar
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
