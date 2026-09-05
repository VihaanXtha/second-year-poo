"use client";

import React, { useState } from 'react';
import { Product } from '../types';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onToggleFavorite: (product: Product) => void;
  isFavorite: boolean;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onToggleFavorite,
  isFavorite,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'inbox' | 'warranty'>('specs');

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in-down overflow-y-auto">
      <div className="bg-[#ffffff] border border-[#c6c6cd] rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col my-auto">
        
        {/* Header */}
        <div className="bg-[#0f172a] text-white p-4 sm:p-5 flex justify-between items-start border-b border-[#1e293b]">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#dc2626] text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                {product.sku}
              </span>
              <span className="text-xs font-mono text-gray-300">
                Vendor: <strong>{product.vendorName}</strong>
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white mt-1 leading-snug">
              {product.name}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:rotate-90 transition-all p-1"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
            <div className="sm:col-span-5 bg-[#f6f3f5] rounded-xl overflow-hidden border border-[#c6c6cd] h-56 sm:h-64 flex items-center justify-center relative">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => onToggleFavorite(product)}
                className={`absolute top-2.5 right-2.5 p-2 rounded-full glass transition-all ${
                  isFavorite ? 'bg-[#dc2626] text-white shadow-md' : 'bg-white/80 text-gray-700 hover:text-[#dc2626]'
                }`}
                title={isFavorite ? 'Remove favorite' : 'Save spec'}
              >
                <span className="material-symbols-outlined text-[20px]">favorite</span>
              </button>
            </div>

            <div className="sm:col-span-7 space-y-3 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#76777d]">VERIFIED NEPAL PRICE</span>
                <span className="text-2xl font-bold text-[#000000] tabular-nums">
                  Rs. {product.priceNpr.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span
                  className={`px-2.5 py-1 rounded-lg font-bold ${
                    product.stockStatus === 'In Stock'
                      ? 'bg-[#10b981]/15 text-[#047857]'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {product.stockStatus} ({product.stockCount} Available)
                </span>
                <div className="flex items-center text-amber-500 font-bold">
                  <span className="material-symbols-outlined text-[16px] mr-0.5">star</span>
                  <span>{product.rating} ({product.reviewCount} Reviews)</span>
                </div>
              </div>

              <p className="text-xs text-[#45464d] leading-relaxed font-sans pt-1">
                {product.description}
              </p>

              {/* Quantity Picker & Add button */}
              <div className="pt-3 border-t border-[#c6c6cd]/60 flex items-center gap-3">
                <div className="flex items-center border border-[#c6c6cd] rounded-xl bg-[#f0edef] overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1.5 hover:bg-gray-200 text-sm font-bold"
                  >
                    -
                  </button>
                  <span className="px-3 py-1.5 font-bold text-xs text-black">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1.5 hover:bg-gray-200 text-sm font-bold"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => onAddToCart(product, quantity)}
                  className="flex-1 bg-[#000000] hover:bg-[#1f2937] text-white text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer btn-press shadow-md"
                >
                  <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                  Add {quantity} to Cart
                </button>
              </div>

            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-[#c6c6cd] flex gap-4 font-mono text-xs font-bold">
            <button
              onClick={() => setActiveTab('specs')}
              className={`pb-2 border-b-2 transition-all ${
                activeTab === 'specs' ? 'border-[#dc2626] text-[#dc2626]' : 'border-transparent text-[#76777d]'
              }`}
            >
              Technical Specs
            </button>
            <button
              onClick={() => setActiveTab('inbox')}
              className={`pb-2 border-b-2 transition-all ${
                activeTab === 'inbox' ? 'border-[#dc2626] text-[#dc2626]' : 'border-transparent text-[#76777d]'
              }`}
            >
              In The Box ({product.inBox?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('warranty')}
              className={`pb-2 border-b-2 transition-all ${
                activeTab === 'warranty' ? 'border-[#dc2626] text-[#dc2626]' : 'border-transparent text-[#76777d]'
              }`}
            >
              Vendor & Warranty
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'specs' && (
            <div className="bg-[#f0edef] border border-[#c6c6cd] rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              {product.specs.map((s, idx) => (
                <div key={idx} className="spec-grid bg-white p-2.5 rounded-lg border border-[#c6c6cd]/50">
                  <span className="spec-label">{s.label}:</span>
                  <span className="spec-value">{s.value}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'inbox' && (
            <div className="bg-[#f0edef] border border-[#c6c6cd] rounded-xl p-4 font-mono text-xs space-y-2">
              <span className="text-[#76777d] block font-bold">INCLUDED PACKAGE ACCESSORIES:</span>
              <ul className="list-disc list-inside space-y-1 text-black">
                {product.inBox?.map((item, idx) => (
                  <li key={idx}>{item}</li>
                )) || <li>Main Hardware Unit</li>}
              </ul>
            </div>
          )}

          {activeTab === 'warranty' && (
            <div className="bg-[#f0edef] border border-[#c6c6cd] rounded-xl p-4 font-mono text-xs space-y-2">
              <div className="flex items-center gap-2 text-[#10b981] font-bold">
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>{product.warranty}</span>
              </div>
              <p className="text-[#45464d]">
                Fulfilled by official partner <strong>{product.vendorName}</strong>. Includes direct RMA claim support via Circuit Bazaar RMA desk.
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
