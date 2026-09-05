"use client";

import React from 'react';
import { Product } from '../types';

interface CompareDrawerProps {
  compareProducts: Product[];
  onRemoveCompare: (productId: string) => void;
  onClearCompare: () => void;
  onAddToCart: (product: Product) => void;
}

export const CompareDrawer: React.FC<CompareDrawerProps> = ({
  compareProducts,
  onRemoveCompare,
  onClearCompare,
  onAddToCart,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  if (compareProducts.length === 0) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-[#0f172a] text-white border-t border-[#1e293b] shadow-2xl animate-slide-in-up transition-all duration-300">
      {/* Header bar */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#dc2626] flex items-center justify-center font-bold text-white text-xs font-mono">
            {compareProducts.length}
          </div>
          <div>
            <h4 className="font-bold text-sm text-white tracking-tight flex items-center gap-2">
              <span>Hardware Specification Comparison</span>
              <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded text-gray-300">
                Max 3 Items
              </span>
            </h4>
            <p className="text-[11px] text-gray-400 font-mono hidden sm:block">
              Comparing SKUs side-by-side by verified specifications
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">
              {isExpanded ? 'expand_more' : 'expand_less'}
            </span>
            {isExpanded ? 'Collapse' : 'Compare Specs Side-by-Side'}
          </button>
          <button
            onClick={onClearCompare}
            className="text-xs font-mono text-gray-400 hover:text-white transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Expanded Side-by-Side View */}
      {isExpanded && (
        <div className="bg-[#1e293b] border-t border-white/10 max-w-[1280px] mx-auto p-4 sm:p-6 overflow-x-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 min-w-[600px]">
            {compareProducts.map((prod) => (
              <div
                key={prod.id}
                className="bg-[#0f172a] border border-white/10 rounded-xl p-4 flex flex-col justify-between relative group"
              >
                <button
                  onClick={() => onRemoveCompare(prod.id)}
                  className="absolute top-2 right-2 p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all"
                  title="Remove from comparison"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>

                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-14 h-14 object-cover rounded-lg border border-white/10"
                    />
                    <div>
                      <span className="text-[10px] font-mono text-[#dc2626] font-bold block">{prod.sku}</span>
                      <h5 className="font-bold text-xs text-white leading-tight line-clamp-2">{prod.name}</h5>
                      <span className="text-[10px] font-mono text-emerald-400 font-semibold">{prod.vendorName}</span>
                    </div>
                  </div>

                  {/* Specification Breakdown */}
                  <div className="bg-white/5 border border-white/10 rounded-lg p-2.5 space-y-1.5 text-[11px] font-mono mb-4">
                    {prod.specs.map((s, idx) => (
                      <div key={idx} className="flex justify-between items-baseline border-b border-white/5 pb-1 last:border-0">
                        <span className="text-gray-400 uppercase text-[10px]">{s.label}:</span>
                        <span className="text-white font-medium text-right truncate ml-2 max-w-[130px]">{s.value}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-baseline pt-1">
                      <span className="text-gray-400 uppercase text-[10px]">WARRANTY:</span>
                      <span className="text-emerald-400 font-semibold text-right truncate ml-2">{prod.warranty}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-gray-400 block">PRICE</span>
                    <span className="font-mono text-sm font-bold text-white tabular-nums">
                      Rs. {prod.priceNpr.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <button
                    onClick={() => onAddToCart(prod)}
                    className="bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs font-mono font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 btn-press cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">add_shopping_cart</span>
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
