import React from 'react';
import { Product } from '../types';

interface FavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
  favoriteProducts: Product[];
  onRemoveFavorite: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const FavoritesModal: React.FC<FavoritesModalProps> = ({
  isOpen,
  onClose,
  favoriteProducts,
  onRemoveFavorite,
  onAddToCart
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#ffffff] rounded-lg border border-[#c6c6cd] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="bg-[#f0edef] border-b border-[#c6c6cd] px-6 py-4 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#dc2626]">favorite</span>
            <h3 className="text-lg font-bold text-[#000000]">Saved Specifications ({favoriteProducts.length})</h3>
          </div>
          <button onClick={onClose} className="text-[#76777d] hover:text-[#000000]">
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {favoriteProducts.length === 0 ? (
            <div className="text-center py-12 text-[#76777d]">
              <span className="material-symbols-outlined text-4xl mb-2">favorite_border</span>
              <p className="font-mono text-xs">No saved hardware specifications yet.</p>
              <p className="text-xs text-[#45464d] mt-1">Click the heart icon on any product card to bookmark it here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {favoriteProducts.map((p) => (
                <div
                  key={p.id}
                  className="bg-[#f6f3f5] border border-[#c6c6cd] rounded p-3 flex gap-4 items-center justify-between"
                >
                  <img src={p.image} alt={p.name} className="w-16 h-16 object-cover rounded border border-[#c6c6cd]" />
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-[10px] text-[#dc2626] font-bold">{p.sku}</div>
                    <h4 className="font-bold text-xs text-[#000000] truncate">{p.name}</h4>
                    <div className="font-mono text-xs font-bold text-[#000000] mt-0.5">
                      Rs. {p.priceNpr.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onAddToCart(p)}
                      className="bg-[#000000] text-white text-xs font-mono font-bold px-3 py-1.5 rounded hover:bg-[#1f2937]"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={() => onRemoveFavorite(p)}
                      className="text-[#dc2626] hover:bg-[#dc2626]/10 p-1.5 rounded"
                      title="Remove"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
