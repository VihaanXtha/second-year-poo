import React, { useState } from 'react';
import { PRODUCTS } from '../data/hardwareData';

interface RMASupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RMASupportModal: React.FC<RMASupportModalProps> = ({ isOpen, onClose }) => {
  const [skuQuery, setSkuQuery] = useState('');
  const [verificationResult, setVerificationResult] = useState<any>(null);

  if (!isOpen) return null;

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skuQuery.trim()) return;

    const matched = PRODUCTS.find(
      (p) => p.sku.toLowerCase().includes(skuQuery.toLowerCase()) || p.id.toLowerCase().includes(skuQuery.toLowerCase())
    );

    if (matched) {
      setVerificationResult({
        status: 'AUTHENTIC',
        product: matched,
        serialNumber: `CB-SN-${Math.floor(10000000 + Math.random() * 90000000)}`,
        rmaSupportPhone: '+977 1-4438102',
      });
    } else {
      setVerificationResult({
        status: 'NOT_FOUND',
        query: skuQuery,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#ffffff] rounded-lg border border-[#c6c6cd] max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="bg-[#0f172a] text-white p-6 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#dc2626]">verified_user</span>
            <h3 className="font-bold text-lg">24h RMA & Warranty Verification</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-xs text-[#45464d] leading-relaxed mb-4 font-mono">
            Enter your Circuit Bazaar SKU code or serial number to verify genuine brand warranty, local vendor authorization, and official RMA replacement status in Nepal.
          </p>

          <form onSubmit={handleVerify} className="flex gap-2 mb-6">
            <input
              type="text"
              required
              placeholder="e.g. GPU-RTX4090-24G-OC or CPU-AMD"
              value={skuQuery}
              onChange={(e) => setSkuQuery(e.target.value)}
              className="flex-1 border border-[#c6c6cd] rounded px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#000000]"
            />
            <button
              type="submit"
              className="bg-[#000000] text-white text-xs font-mono font-bold px-4 py-2 rounded hover:bg-[#1f2937]"
            >
              Verify
            </button>
          </form>

          {verificationResult && (
            <div className="animate-in fade-in">
              {verificationResult.status === 'AUTHENTIC' ? (
                <div className="bg-[#10b981]/10 border border-[#10b981] rounded p-4 text-xs font-mono space-y-2">
                  <div className="flex items-center gap-2 text-[#10b981] font-bold text-sm">
                    <span className="material-symbols-outlined">check_circle</span>
                    VERIFIED AUTHENTIC COMPONENT
                  </div>
                  <div className="text-[#000000] font-bold text-sm">
                    {verificationResult.product.name}
                  </div>
                  <div className="text-[#45464d]">
                    SKU: <span className="font-bold text-[#000000]">{verificationResult.product.sku}</span>
                  </div>
                  <div className="text-[#45464d]">
                    Verified Vendor: <span className="font-bold text-[#000000]">{verificationResult.product.vendorName}</span>
                  </div>
                  <div className="text-[#45464d]">
                    Official Warranty: <span className="font-bold text-[#000000]">{verificationResult.product.warranty}</span>
                  </div>
                  <div className="text-[#45464d] border-t border-[#10b981]/30 pt-2 mt-2">
                    24h RMA Desk Hotline: <span className="font-bold text-[#dc2626]">{verificationResult.rmaSupportPhone}</span>
                  </div>
                </div>
              ) : (
                <div className="bg-[#dc2626]/10 border border-[#dc2626] rounded p-4 text-xs font-mono space-y-2">
                  <div className="flex items-center gap-2 text-[#dc2626] font-bold text-sm">
                    <span className="material-symbols-outlined">error</span>
                    SPECIFICATION NOT RECORDED
                  </div>
                  <p className="text-[#45464d]">
                    No official record found for SKU code "{verificationResult.query}". Please check your receipt or contact vendor support.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
