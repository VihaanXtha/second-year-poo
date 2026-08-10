"use client";

import React, { useState } from 'react';
import { PRODUCTS } from '../data/hardwareData';
import { Product } from '../types';

interface RMASupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RMASupportModal: React.FC<RMASupportModalProps> = ({ isOpen, onClose }) => {
  const [skuQuery, setSkuQuery] = useState('');
  const [searchedResult, setSearchedResult] = useState<Product | null | 'not_found'>(null);

  if (!isOpen) return null;

  const handleVerifySku = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skuQuery.trim()) return;

    const matched = PRODUCTS.find(
      (p) => p.sku.toLowerCase() === skuQuery.trim().toLowerCase()
    );
    setSearchedResult(matched || 'not_found');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in-down overflow-y-auto">
      <div className="bg-[#ffffff] border border-[#c6c6cd] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-auto">
        
        {/* Header */}
        <div className="bg-[#0f172a] text-white p-4 sm:p-5 flex justify-between items-center border-b border-[#1e293b]">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#dc2626] text-2xl">verified_user</span>
            <div>
              <h3 className="font-bold text-lg text-white">RMA & Warranty Verification Desk</h3>
              <p className="text-xs font-mono text-gray-300">Instant SKU & Serial Warranty Lookup</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <form onSubmit={handleVerifySku} className="space-y-3 font-mono">
            <label className="block text-xs font-bold text-[#45464d]">
              ENTER HARDWARE SKU OR SERIAL CODE
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                placeholder="e.g. SKU-GPU-4080S or SKU-CPU-7800X3D"
                value={skuQuery}
                onChange={(e) => setSkuQuery(e.target.value)}
                className="flex-1 border border-[#c6c6cd] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#000000] uppercase"
              />
              <button
                type="submit"
                className="bg-[#000000] hover:bg-[#1f2937] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all btn-press"
              >
                Verify Spec
              </button>
            </div>
          </form>

          {/* Search Result Feedback */}
          {searchedResult && searchedResult !== 'not_found' && (
            <div className="bg-[#10b981]/10 border border-[#10b981] rounded-xl p-4 font-mono text-xs space-y-2 animate-scale-in">
              <div className="flex items-center gap-2 text-[#047857] font-bold">
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                <span>AUTHENTIC HARDWARE SKU VERIFIED</span>
              </div>
              <p className="text-black font-bold text-sm">{searchedResult.name}</p>
              <div className="text-gray-600 space-y-1 text-[11px]">
                <p>Authorized Vendor: <strong>{searchedResult.vendorName}</strong></p>
                <p>Warranty Status: <strong className="text-[#10b981]">{searchedResult.warranty}</strong></p>
              </div>
            </div>
          )}

          {searchedResult === 'not_found' && (
            <div className="bg-[#dc2626]/10 border border-[#dc2626] rounded-xl p-4 font-mono text-xs text-[#dc2626] flex items-center gap-2 animate-scale-in">
              <span className="material-symbols-outlined text-[20px]">error</span>
              <span>No active SKU found matching "{skuQuery}". Check your invoice serial.</span>
            </div>
          )}

          <div className="bg-[#f0edef] rounded-xl p-4 border border-[#c6c6cd] font-mono text-xs space-y-2">
            <h4 className="font-bold text-black flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">support_agent</span>
              RMA Claim Hotline Nepal
            </h4>
            <p className="text-[#45464d]">
              For physical warranty inspection & express replacement in Kathmandu, visit our hub or email <strong>rma@circuitbazaar.np</strong>.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
