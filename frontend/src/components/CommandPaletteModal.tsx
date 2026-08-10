"use client";

import React, { useState, useEffect } from 'react';
import { PRODUCTS, VENDORS } from '../data/hardwareData';
import { Product } from '../types';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  onOpenRigBuilder: () => void;
  onOpenBottleneckCalc: () => void;
  onOpenQuiz: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  onOpenRigBuilder,
  onOpenBottleneckCalc,
  onOpenQuiz,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredProds = PRODUCTS.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.sku.toLowerCase().includes(query.toLowerCase()) ||
    p.category.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-16 px-4 animate-fade-in-down">
      <div className="bg-[#ffffff] border border-[#c6c6cd] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
        
        {/* Command Search Input */}
        <div className="p-4 border-b border-[#c6c6cd] flex items-center gap-3 bg-[#f6f3f5]">
          <span className="material-symbols-outlined text-gray-500">search</span>
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a SKU, component, vendor, or tool..."
            className="w-full bg-transparent font-mono text-sm text-black focus:outline-none placeholder:text-gray-400"
          />
          <span className="font-mono text-[10px] text-gray-400 border border-gray-300 px-1.5 py-0.5 rounded">
            ESC
          </span>
        </div>

        {/* Quick Tools Commands */}
        <div className="p-3 border-b border-[#c6c6cd] bg-[#fcf8fa]">
          <span className="text-[10px] font-mono font-bold text-gray-400 uppercase px-2 block mb-2">
            QUICK SYSTEM TOOLS
          </span>
          <div className="grid grid-cols-3 gap-2 font-mono text-xs">
            <button
              onClick={() => {
                onClose();
                onOpenRigBuilder();
              }}
              className="p-2 rounded-xl bg-white border border-[#c6c6cd] hover:border-black flex items-center gap-1.5 text-black font-bold transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-[#dc2626]">construction</span>
              <span>Rig Builder</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenBottleneckCalc();
              }}
              className="p-2 rounded-xl bg-white border border-[#c6c6cd] hover:border-black flex items-center gap-1.5 text-black font-bold transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-blue-600">speed</span>
              <span>Bottleneck Calc</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenQuiz();
              }}
              className="p-2 rounded-xl bg-white border border-[#c6c6cd] hover:border-black flex items-center gap-1.5 text-black font-bold transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-purple-600">auto_awesome</span>
              <span>Hardware Quiz</span>
            </button>
          </div>
        </div>

        {/* Product Results */}
        <div className="p-3 max-h-72 overflow-y-auto space-y-1">
          <span className="text-[10px] font-mono font-bold text-gray-400 uppercase px-2 block mb-1">
            HARDWARE INVENTORY ({filteredProds.length})
          </span>
          {filteredProds.map((prod) => (
            <div
              key={prod.id}
              onClick={() => {
                onClose();
                onSelectProduct(prod);
              }}
              className="p-2.5 rounded-xl hover:bg-[#f0edef] flex items-center justify-between gap-3 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <img src={prod.image} alt={prod.name} className="w-10 h-10 object-cover rounded-lg border border-[#c6c6cd]" />
                <div>
                  <span className="text-[10px] font-mono text-[#dc2626] font-bold block">{prod.sku}</span>
                  <h4 className="font-bold text-xs text-black line-clamp-1">{prod.name}</h4>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-black tabular-nums">
                Rs. {prod.priceNpr.toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
