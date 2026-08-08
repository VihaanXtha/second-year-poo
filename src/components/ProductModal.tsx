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
  const [activeTab, setActiveTab] = useState<'specs' | 'box' | 'vendor'>('specs');

  if (!product) return null;

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#ffffff] rounded-lg border border-[#c6c6cd] max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="sticky top-0 bg-[#f0edef] border-b border-[#c6c6cd] px-6 py-4 flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold bg-[#000000] text-white px-2.5 py-1 rounded">
              SKU: {product.sku}
            </span>
            <span className="text-xs font-mono text-[#45464d] border-l border-[#c6c6cd] pl-3">
              {product.category} &gt; {product.subCategory}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[#76777d] hover:text-[#000000] p-1 rounded hover:bg-[#e4e2e4]"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 grid md:grid-cols-2 gap-6">
          {/* Left Column: Image & Stock */}
          <div>
            <div className="bg-[#f6f3f5] rounded border border-[#c6c6cd] overflow-hidden h-64 relative mb-4">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-2 left-2 bg-[#0f172a]/90 text-white font-mono text-[11px] px-2.5 py-1 rounded">
                Verified Vendor: {product.vendorName}
              </span>
            </div>

            <div className="bg-[#f0edef] p-3 rounded border border-[#c6c6cd]/60 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-[#45464d]">Stock Availability:</span>
                <span className="font-bold text-[#10b981]">{product.stockStatus} ({product.stockCount} units)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#45464d]">Warranty:</span>
                <span className="font-bold text-[#000000]">{product.warranty}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#45464d]">Rating:</span>
                <span className="font-bold text-[#000000] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[#f59e0b] text-[14px]">star</span>
                  {product.rating} ({product.reviewCount} verified reviews)
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Title, Specs, Tabs & Actions */}
          <div className="flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#000000] mb-2 leading-tight">
                {product.name}
              </h2>
              <p className="text-xs text-[#45464d] leading-relaxed mb-4">
                {product.description}
              </p>

              {/* Specs Tabs */}
              <div className="flex border-b border-[#c6c6cd] mb-3 text-xs font-mono">
                <button
                  onClick={() => setActiveTab('specs')}
                  className={`pb-2 px-3 font-bold border-b-2 cursor-pointer ${
                    activeTab === 'specs'
                      ? 'border-[#000000] text-[#000000]'
                      : 'border-transparent text-[#76777d] hover:text-[#000000]'
                  }`}
                >
                  Technical Specs
                </button>
                <button
                  onClick={() => setActiveTab('box')}
                  className={`pb-2 px-3 font-bold border-b-2 cursor-pointer ${
                    activeTab === 'box'
                      ? 'border-[#000000] text-[#000000]'
                      : 'border-transparent text-[#76777d] hover:text-[#000000]'
                  }`}
                >
                  In The Box ({product.inBox.length})
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'specs' && (
                <div className="bg-[#f0edef] border border-[#c6c6cd] rounded p-3 space-y-2 text-xs max-h-48 overflow-y-auto">
                  {product.specs.map((s, idx) => (
                    <div key={idx} className="grid grid-cols-3 gap-2 border-b border-[#c6c6cd]/40 pb-1.5 last:border-0 last:pb-0">
                      <span className="font-mono text-[11px] text-[#45464d] uppercase font-bold">{s.label}:</span>
                      <span className="col-span-2 font-mono text-[11px] text-[#000000] font-semibold">{s.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'box' && (
                <ul className="bg-[#f0edef] border border-[#c6c6cd] rounded p-3 text-xs font-mono space-y-1.5 max-h-48 overflow-y-auto">
                  {product.inBox.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-[#000000]">
                      <span className="material-symbols-outlined text-[16px] text-[#10b981]">check_circle</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Price & Cart Actions */}
            <div className="pt-4 border-t border-[#c6c6cd] mt-4">
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-xs font-mono text-[#76777d]">NPR Price (Tax Incl.):</span>
                <span className="text-2xl font-mono font-bold text-[#000000]">
                  Rs. {(product.priceNpr * quantity).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex gap-3 items-center">
                <div className="flex items-center border border-[#c6c6cd] rounded bg-[#f6f3f5]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 font-mono text-sm hover:bg-[#e4e2e4]"
                  >
                    -
                  </button>
                  <span className="px-4 font-mono text-sm font-bold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stockCount, quantity + 1))}
                    className="px-3 py-2 font-mono text-sm hover:bg-[#e4e2e4]"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-[#dc2626] hover:bg-[#b91c1c] text-white font-mono text-xs font-bold py-3 px-4 rounded flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                  Add {quantity} to Cart
                </button>

                <button
                  onClick={() => onToggleFavorite(product)}
                  className={`p-3 rounded border transition-colors ${
                    isFavorite
                      ? 'bg-[#dc2626] border-[#dc2626] text-white'
                      : 'border-[#c6c6cd] bg-[#f6f3f5] text-[#45464d] hover:text-[#dc2626]'
                  }`}
                  title={isFavorite ? 'Saved in favorites' : 'Save hardware spec'}
                >
                  <span className="material-symbols-outlined text-[20px]">favorite</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
