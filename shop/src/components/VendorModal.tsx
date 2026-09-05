import React from 'react';
import { Vendor, Product } from '../types';
import { PRODUCTS } from '../data/hardwareData';

interface VendorModalProps {
  vendor: Vendor | null;
  onClose: () => void;
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const VendorModal: React.FC<VendorModalProps> = ({ vendor, onClose, onProductClick, onAddToCart }) => {
  if (!vendor) return null;

  const vendorProducts = PRODUCTS.filter((p) => p.vendorId === vendor.id);

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#ffffff] rounded-lg border border-[#c6c6cd] max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="bg-[#0f172a] text-white p-6 sticky top-0 z-10 flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 ${vendor.badgeBg} border border-white/20 rounded flex items-center justify-center font-bold text-2xl shadow-inner`}>
              {vendor.code}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{vendor.name}</h2>
                <span className="bg-[#10b981] text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">verified</span> Verified Partner
                </span>
              </div>
              <p className="text-xs text-gray-300 font-mono mt-1">{vendor.specialty} • Verified Since {vendor.verifiedSince}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        {/* Info Body */}
        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-4 bg-[#f6f3f5] border border-[#c6c6cd] p-4 rounded mb-6 text-xs font-mono">
            <div>
              <span className="text-[#76777d] block uppercase text-[10px]">STORE LOCATION</span>
              <span className="font-bold text-[#000000]">{vendor.address}</span>
            </div>
            <div>
              <span className="text-[#76777d] block uppercase text-[10px]">DIRECT CONTACT</span>
              <span className="font-bold text-[#000000]">{vendor.phone}</span>
            </div>
            <div>
              <span className="text-[#76777d] block uppercase text-[10px]">RATING & REVIEWS</span>
              <span className="font-bold text-[#000000] flex items-center gap-1">
                <span className="material-symbols-outlined text-[#f59e0b] text-[14px]">star</span>
                {vendor.rating} / 5.0 ({vendor.reviewsCount} verified reviews)
              </span>
            </div>
          </div>

          <p className="text-xs text-[#45464d] leading-relaxed mb-6">
            {vendor.description}
          </p>

          <h3 className="font-mono text-xs font-bold text-[#000000] uppercase tracking-wider mb-3 flex items-center gap-2 border-b border-[#c6c6cd] pb-2">
            <span className="material-symbols-outlined text-[16px] text-[#dc2626]">inventory_2</span>
            Inventory Catalog ({vendorProducts.length} items)
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            {vendorProducts.map((product) => (
              <div
                key={product.id}
                className="border border-[#c6c6cd] rounded p-3 flex gap-3 bg-[#f0edef] hover:bg-[#ffffff] hover:border-[#000000] transition-colors"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded border border-[#c6c6cd] cursor-pointer"
                  onClick={() => onProductClick(product)}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-mono text-[#dc2626] font-bold">{product.sku}</div>
                  <h4
                    onClick={() => onProductClick(product)}
                    className="font-bold text-xs text-[#000000] truncate cursor-pointer hover:text-[#dc2626]"
                  >
                    {product.name}
                  </h4>
                  <div className="font-mono text-xs font-bold text-[#000000] mt-1">
                    Rs. {product.priceNpr.toLocaleString('en-IN')}
                  </div>
                  <button
                    onClick={() => onAddToCart(product)}
                    className="mt-2 text-[10px] font-mono font-bold bg-[#000000] text-white px-2.5 py-1 rounded hover:bg-[#dc2626] transition-colors"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
