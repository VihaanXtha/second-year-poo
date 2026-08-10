"use client";

import React, { useState, useEffect } from 'react';

interface FloatingDockProps {
  onOpenRigBuilder: () => void;
  onOpenCart: () => void;
  onOpenFavorites: () => void;
  compareCount: number;
  cartCount: number;
}

export const FloatingDock: React.FC<FloatingDockProps> = ({
  onOpenRigBuilder,
  onOpenCart,
  onOpenFavorites,
  compareCount,
  cartCount,
}) => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 animate-fade-in-up">
      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="w-10 h-10 rounded-full bg-[#0f172a] text-white border border-[#1e293b] flex items-center justify-center shadow-xl hover:bg-[#dc2626] transition-all duration-300 hover:scale-110 btn-press cursor-pointer group"
          title="Back to Top"
        >
          <span className="material-symbols-outlined text-[20px] group-hover:-translate-y-0.5 transition-transform">
            arrow_upward
          </span>
        </button>
      )}

      {/* Floating Action Dock */}
      <div className="bg-[#0f172a]/90 glass text-white p-2 rounded-2xl border border-white/20 shadow-2xl flex items-center gap-1.5 backdrop-blur-md">
        
        {/* Rig Builder Button */}
        <button
          onClick={onOpenRigBuilder}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs font-mono font-bold transition-all hover:scale-105 btn-press cursor-pointer shadow-md"
          title="Open Custom PC Rig Builder"
        >
          <span className="material-symbols-outlined text-[18px]">construction</span>
          <span className="hidden sm:inline">Build Rig</span>
        </button>

        {/* Favorites */}
        <button
          onClick={onOpenFavorites}
          className="p-2 rounded-xl hover:bg-white/10 text-gray-300 hover:text-white transition-all cursor-pointer relative"
          title="Saved Specs"
        >
          <span className="material-symbols-outlined text-[20px]">favorite</span>
        </button>

        {/* Cart */}
        <button
          onClick={onOpenCart}
          className="p-2 rounded-xl hover:bg-white/10 text-gray-300 hover:text-white transition-all cursor-pointer relative"
          title="Shopping Cart"
        >
          <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#dc2626] text-white text-[10px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pop-in">
              {cartCount}
            </span>
          )}
        </button>

      </div>
    </div>
  );
};
