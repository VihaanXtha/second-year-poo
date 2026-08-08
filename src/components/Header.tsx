import React from 'react';
import { CategoryType } from '../types';

interface HeaderProps {
  activeCategory: CategoryType | 'All';
  onSelectCategory: (cat: CategoryType | 'All') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  cartCount: number;
  favoritesCount: number;
  onOpenCart: () => void;
  onOpenFavorites: () => void;
  onOpenBecomeVendor: () => void;
  onOpenRMA: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  cartCount,
  favoritesCount,
  onOpenCart,
  onOpenFavorites,
  onOpenBecomeVendor,
  onOpenRMA
}) => {
  return (
    <header className="bg-[#fcf8fa] dark:bg-[#1b1b1d] border-b border-[#c6c6cd] dark:border-[#76777d] sticky top-0 z-50 transition-colors">
      <div className="flex justify-between items-center w-full px-4 md:px-6 max-w-[1280px] mx-auto h-16">
        <div className="flex items-center gap-4 lg:gap-6">
          <button 
            onClick={() => onSelectCategory('All')} 
            className="flex items-center gap-2.5 text-left focus:outline-none group"
          >
            <div className="w-8 h-8 rounded bg-[#0f172a] flex items-center justify-center p-1 shadow-sm group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[#38bdf8] text-[20px]">hardware</span>
            </div>
            <span className="text-xl font-bold text-[#000000] dark:text-[#fcf8fa] tracking-tight">
              Circuit Bazaar
            </span>
          </button>

          {/* Search Bar */}
          <div className="hidden md:flex relative w-72 lg:w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#45464d] text-[20px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search components, specs, or SKUs..."
              className="w-full bg-[#f6f3f5] border border-[#c6c6cd] rounded pl-10 pr-4 py-1.5 font-mono text-xs text-[#1b1b1d] focus:outline-none focus:border-[#000000] focus:ring-1 focus:ring-[#000000] placeholder:text-[#45464d]/70 transition-colors"
            />
            {searchQuery && (
              <button 
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#76777d] hover:text-[#000000]"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Category Links */}
        <nav className="hidden lg:flex items-center gap-6">
          {(['PC Components', 'IoT Gear', 'Laptops', 'Networking'] as CategoryType[]).map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`text-sm transition-all duration-150 py-1 border-b-2 font-medium ${
                activeCategory === cat
                  ? 'text-[#000000] font-bold border-[#000000]'
                  : 'text-[#45464d] border-transparent hover:text-[#000000] hover:border-[#c6c6cd]'
              }`}
            >
              {cat}
            </button>
          ))}
        </nav>

        {/* Trailing Action Icons */}
        <div className="flex items-center gap-3 md:gap-4 text-[#45464d]">
          <button
            onClick={onOpenBecomeVendor}
            className="hidden sm:flex items-center gap-1.5 text-xs font-mono font-semibold text-[#000000] bg-[#f0edef] hover:bg-[#e4e2e4] px-2.5 py-1.5 rounded border border-[#c6c6cd] transition-colors"
            title="Become a Marketplace Vendor"
          >
            <span className="material-symbols-outlined text-[16px]">storefront</span>
            <span>Vendor Portal</span>
          </button>

          <button
            onClick={onOpenFavorites}
            className="hover:text-[#000000] transition-colors p-1.5 relative rounded hover:bg-[#f6f3f5]"
            title="Saved Specifications / Favorites"
            aria-label="Favorites"
          >
            <span className="material-symbols-outlined text-[22px]">favorite</span>
            {favoritesCount > 0 && (
              <span className="absolute top-0 right-0 bg-[#dc2626] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center -mt-0.5 -mr-0.5 font-mono">
                {favoritesCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenCart}
            className="hover:text-[#000000] transition-colors p-1.5 relative rounded hover:bg-[#f6f3f5]"
            title="Shopping Cart & Spec List"
            aria-label="Cart"
          >
            <span className="material-symbols-outlined text-[22px]">shopping_cart</span>
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-[#dc2626] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center -mt-0.5 -mr-0.5 font-mono">
                {cartCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenRMA}
            className="hover:text-[#dc2626] transition-colors p-1.5 rounded hover:bg-[#f6f3f5]"
            title="Warranty & RMA Support"
            aria-label="RMA Support"
          >
            <span className="material-symbols-outlined text-[22px]">verified_user</span>
          </button>
        </div>
      </div>

      {/* Mobile Search & Navigation Bar */}
      <div className="lg:hidden border-t border-[#c6c6cd]/50 px-4 py-2 bg-[#f6f3f5]">
        <div className="flex gap-2 items-center mb-2 md:hidden">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[#45464d] text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search specs, SKUs..."
              className="w-full bg-[#ffffff] border border-[#c6c6cd] rounded pl-8 pr-3 py-1 font-mono text-xs focus:outline-none"
            />
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          <button
            onClick={() => onSelectCategory('All')}
            className={`px-3 py-1 rounded-full font-mono whitespace-nowrap transition-colors ${
              activeCategory === 'All'
                ? 'bg-[#000000] text-white font-bold'
                : 'bg-[#ffffff] text-[#45464d] border border-[#c6c6cd]'
            }`}
          >
            All Hardware
          </button>
          {(['PC Components', 'IoT Gear', 'Laptops', 'Networking'] as CategoryType[]).map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-3 py-1 rounded-full font-mono whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? 'bg-[#000000] text-white font-bold'
                  : 'bg-[#ffffff] text-[#45464d] border border-[#c6c6cd]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
