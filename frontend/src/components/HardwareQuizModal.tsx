"use client";

import React, { useState } from 'react';
import { PRODUCTS } from '../data/hardwareData';
import { Product } from '../types';

interface HardwareQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const HardwareQuizModal: React.FC<HardwareQuizModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  onAddToCart,
}) => {
  const [useCase, setUseCase] = useState<'gaming' | 'editing' | 'ai' | 'networking'>('gaming');
  const [budget, setBudget] = useState<number>(100000);

  if (!isOpen) return null;

  const matchedProducts = PRODUCTS.filter((p) => p.priceNpr <= budget).slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in-down overflow-y-auto">
      <div className="bg-[#ffffff] border border-[#c6c6cd] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto">
        
        {/* Header */}
        <div className="bg-[#0f172a] text-white p-4 sm:p-5 flex justify-between items-center border-b border-[#1e293b]">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#dc2626] text-2xl">auto_awesome</span>
            <div>
              <h3 className="font-bold text-lg text-white">Hardware Finder Quiz</h3>
              <p className="text-xs font-mono text-gray-300">Find perfect components matched to your workload</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Question 1: Use Case */}
          <div>
            <label className="block text-xs font-mono font-bold text-[#45464d] mb-2 uppercase">
              1. WHAT IS YOUR PRIMARY WORKLOAD?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              {[
                { id: 'gaming', label: 'AAA Gaming', icon: 'sports_esports' },
                { id: 'editing', label: 'Video / 3D', icon: 'movie' },
                { id: 'ai', label: 'AI & ML Dev', icon: 'psychology' },
                { id: 'networking', label: 'Networking', icon: 'router' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setUseCase(item.id as any)}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    useCase === item.id
                      ? 'border-[#000000] bg-[#000000] text-white shadow-md'
                      : 'border-[#c6c6cd] bg-white text-black hover:border-black'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  <span className="font-bold">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Question 2: Budget Slider */}
          <div className="font-mono text-xs space-y-2">
            <div className="flex justify-between items-center">
              <label className="font-bold text-[#45464d] uppercase">
                2. MAXIMUM BUDGET RANGE:
              </label>
              <span className="font-bold text-[#dc2626] text-sm tabular-nums">
                Rs. {budget.toLocaleString('en-IN')}
              </span>
            </div>
            <input
              type="range"
              min={15000}
              max={250000}
              step={5000}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
            />
          </div>

          {/* Matches Showcase */}
          <div>
            <span className="text-xs font-mono font-bold text-[#45464d] uppercase block mb-3">
              RECOMMENDED MATCHES ({matchedProducts.length} ITEMS):
            </span>

            <div className="space-y-3">
              {matchedProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="p-3 rounded-xl border border-[#c6c6cd] bg-[#fcf8fa] flex items-center justify-between gap-3 hover:border-black transition-all"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-12 h-12 object-cover rounded-lg border border-[#c6c6cd]"
                    />
                    <div>
                      <span className="text-[10px] font-mono text-[#dc2626] font-bold block">{prod.sku}</span>
                      <h4 className="font-bold text-xs text-black line-clamp-1">{prod.name}</h4>
                      <span className="text-[10px] font-mono text-emerald-600 font-bold">{prod.vendorName}</span>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <span className="font-bold text-xs text-black block tabular-nums">
                      Rs. {prod.priceNpr.toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => {
                        onClose();
                        onAddToCart(prod);
                      }}
                      className="mt-1 bg-[#000000] hover:bg-[#1f2937] text-white text-[10px] font-bold px-3 py-1 rounded-lg transition-all btn-press"
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
    </div>
  );
};
