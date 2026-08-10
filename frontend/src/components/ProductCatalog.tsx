"use client";

import React, { useState, useMemo } from 'react';
import { PRODUCTS, VENDORS } from '../data/hardwareData';
import { Product, CategoryType } from '../types';

interface ProductCatalogProps {
  activeCategory: CategoryType | 'All';
  onSelectCategory: (cat: CategoryType | 'All') => void;
  searchQuery: string;
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onToggleFavorite: (product: Product) => void;
  favoriteIds: string[];
  compareIds: string[];
  onToggleCompare: (product: Product) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  activeCategory,
  onSelectCategory,
  searchQuery,
  onProductClick,
  onAddToCart,
  onToggleFavorite,
  favoriteIds,
  compareIds,
  onToggleCompare,
}) => {
  const [selectedVendorId, setSelectedVendorId] = useState<string>('All');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(300000);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'recommended' | 'price-low' | 'price-high' | 'rating'>('recommended');

  const maxAvailablePrice = 300000;

  const categoryIcons: Record<string, string> = {
    'All': 'apps',
    'PC Components': 'memory',
    'IoT Gear': 'developer_board',
    'Laptops': 'laptop_mac',
    'Networking': 'router',
  };

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((p) => {
      if (activeCategory !== 'All' && p.category !== activeCategory) {
        return false;
      }
      if (selectedVendorId !== 'All' && p.vendorId !== selectedVendorId) {
        return false;
      }
      if (inStockOnly && p.stockStatus !== 'In Stock') {
        return false;
      }
      if (p.priceNpr > maxPriceFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesSku = p.sku.toLowerCase().includes(q);
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesCategory = p.category.toLowerCase().includes(q) || p.subCategory.toLowerCase().includes(q);
        const matchesVendor = p.vendorName.toLowerCase().includes(q);
        const matchesSpecs = p.specs.some(
          (s) => s.label.toLowerCase().includes(q) || s.value.toLowerCase().includes(q)
        );
        return matchesSku || matchesName || matchesCategory || matchesVendor || matchesSpecs;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.priceNpr - b.priceNpr;
      if (sortBy === 'price-high') return b.priceNpr - a.priceNpr;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });
  }, [activeCategory, selectedVendorId, inStockOnly, maxPriceFilter, searchQuery, sortBy]);

  return (
    <section id="inventory" className="py-12 bg-[#f6f3f5] border-b border-[#c6c6cd]">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6">
        
        {/* Visual Category Feature Cards */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-mono font-bold text-[#45464d] uppercase tracking-wider">
              HARDWARE CATEGORY EXPLORER
            </h3>
            <span className="text-xs font-mono text-[#76777d]">
              Showing {filteredProducts.length} verified items
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {(['All', 'PC Components', 'IoT Gear', 'Laptops', 'Networking'] as const).map((cat) => {
              const count = cat === 'All' ? PRODUCTS.length : PRODUCTS.filter(p => p.category === cat).length;
              const isSelected = activeCategory === cat;
              return (
                <div
                  key={cat}
                  onClick={() => onSelectCategory(cat)}
                  className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
                    isSelected
                      ? 'bg-[#000000] border-[#000000] text-white shadow-md'
                      : 'bg-[#ffffff] border-[#c6c6cd] text-[#1b1b1d] hover:border-[#000000] hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`material-symbols-outlined text-[24px] ${isSelected ? 'text-[#38bdf8]' : 'text-[#dc2626]'}`}>
                      {categoryIcons[cat]}
                    </span>
                    <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-[#f0edef] text-[#45464d]'}`}>
                      {count} SKUs
                    </span>
                  </div>
                  <span className="font-bold text-xs leading-tight truncate">
                    {cat === 'All' ? 'All Hardware' : cat}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Controls & Multi-Facet Filters */}
        <div className="bg-[#ffffff] border border-[#c6c6cd] rounded-2xl p-4 md:p-5 mb-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Filter Group 1: Vendor & Stock */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
              <div className="flex items-center gap-1.5 bg-[#f6f3f5] border border-[#c6c6cd] rounded-xl px-3 py-2">
                <span className="text-[#76777d]">VENDOR:</span>
                <select
                  value={selectedVendorId}
                  onChange={(e) => setSelectedVendorId(e.target.value)}
                  className="bg-transparent font-bold focus:outline-none cursor-pointer text-[#000000]"
                >
                  <option value="All">All Local Vendors ({VENDORS.length})</option>
                  {VENDORS.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2 bg-[#f6f3f5] border border-[#c6c6cd] rounded-xl px-3 py-2 cursor-pointer select-none hover:border-[#76777d]">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded accent-[#000000]"
                />
                <span className="font-bold text-[#1b1b1d]">In-Stock Only</span>
              </label>

              {/* View Mode Toggle */}
              <div className="flex items-center border border-[#c6c6cd] rounded-xl bg-[#f6f3f5] p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[#000000] text-white' : 'text-[#76777d] hover:text-black'}`}
                  title="Grid View"
                >
                  <span className="material-symbols-outlined text-[18px]">grid_view</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[#000000] text-white' : 'text-[#76777d] hover:text-black'}`}
                  title="Compact Spec List View"
                >
                  <span className="material-symbols-outlined text-[18px]">view_list</span>
                </button>
              </div>
            </div>

            {/* Filter Group 2: Price Range & Sort */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-2 min-w-[200px]">
                <span className="text-[#76777d] text-[11px]">MAX PRICE:</span>
                <input
                  type="range"
                  min={1000}
                  max={maxAvailablePrice}
                  step={5000}
                  value={maxPriceFilter}
                  onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="font-bold text-[#dc2626] tabular-nums">
                  Rs. {(maxPriceFilter / 1000).toFixed(0)}k
                </span>
              </div>

              <div className="flex items-center gap-1.5 bg-[#f6f3f5] border border-[#c6c6cd] rounded-xl px-3 py-2">
                <span className="text-[#76777d]">SORT:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent font-bold focus:outline-none cursor-pointer text-[#000000]"
                >
                  <option value="recommended">Recommended</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>

          </div>
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 ? (
          <div className="bg-[#ffffff] border border-[#c6c6cd] rounded-2xl p-12 text-center my-8 animate-scale-in">
            <span className="material-symbols-outlined text-4xl text-[#76777d] mb-2">search_off</span>
            <h3 className="font-bold text-lg text-[#000000]">No components matching these criteria</h3>
            <p className="text-xs font-mono text-[#76777d] mt-1 max-w-md mx-auto">
              Try adjusting your max price slider, vendor selections, or category filters.
            </p>
            <button
              onClick={() => {
                onSelectCategory('All');
                setSelectedVendorId('All');
                setInStockOnly(false);
                setMaxPriceFilter(maxAvailablePrice);
              }}
              className="mt-4 px-5 py-2.5 bg-[#000000] text-white text-xs font-mono font-bold rounded-xl hover:bg-[#1f2937] transition-all duration-200 btn-press cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View Mode */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, idx) => {
              const isFav = favoriteIds.includes(product.id);
              const isCompared = compareIds.includes(product.id);

              return (
                <div
                  key={product.id}
                  className={`animate-fade-in-up stagger-${(idx % 8) + 1} bg-[#ffffff] border border-[#c6c6cd] rounded-2xl overflow-hidden card-hover-lift flex flex-col justify-between group relative`}
                >
                  <div>
                    {/* Header bar */}
                    <div className="p-3 bg-[#f0edef] border-b border-[#c6c6cd]/60 flex justify-between items-center text-[10px] font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
                        <span className="font-bold text-[#000000] truncate max-w-[120px]">{product.vendorName}</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold ${
                          product.stockStatus === 'In Stock'
                            ? 'bg-[#10b981]/15 text-[#047857]'
                            : product.stockStatus === 'Low Stock'
                            ? 'bg-[#f59e0b]/15 text-[#b45309]'
                            : 'bg-[#dc2626]/15 text-[#dc2626]'
                        }`}
                      >
                        {product.stockStatus} ({product.stockCount})
                      </span>
                    </div>

                    {/* Image Area */}
                    <div
                      onClick={() => onProductClick(product)}
                      className="relative h-48 bg-[#f6f3f5] overflow-hidden cursor-pointer img-zoom"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Top Action Buttons */}
                      <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(product);
                          }}
                          className={`p-1.5 rounded-full glass transition-all duration-200 hover:scale-110 ${
                            isFav ? 'bg-[#dc2626] text-white shadow-md' : 'bg-white/80 text-[#45464d] hover:text-[#dc2626]'
                          }`}
                          title={isFav ? 'Remove from saved' : 'Save spec'}
                        >
                          <span className="material-symbols-outlined text-[18px]">favorite</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleCompare(product);
                          }}
                          className={`p-1.5 rounded-full glass transition-all duration-200 hover:scale-110 ${
                            isCompared ? 'bg-[#0f172a] text-amber-400 shadow-md' : 'bg-white/80 text-[#45464d] hover:text-black'
                          }`}
                          title={isCompared ? 'Remove from compare' : 'Compare spec'}
                        >
                          <span className="material-symbols-outlined text-[18px]">compare_arrows</span>
                        </button>
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono text-[#dc2626] font-bold tracking-tight bg-[#dc2626]/10 px-2 py-0.5 rounded">
                          {product.sku}
                        </span>
                        <div className="flex items-center text-xs font-mono text-[#45464d]">
                          <span className="material-symbols-outlined text-[#f59e0b] text-[15px] font-fill mr-0.5">
                            star
                          </span>
                          <span className="font-bold">{product.rating}</span>
                        </div>
                      </div>

                      <h3
                        onClick={() => onProductClick(product)}
                        className="font-bold text-[#000000] text-sm leading-snug line-clamp-2 hover:text-[#dc2626] cursor-pointer transition-colors duration-200 mb-3 h-10"
                      >
                        {product.name}
                      </h3>

                      {/* Technical Specs List */}
                      <div className="bg-[#f0edef] border-l-2 border-[#000000] rounded-r-xl p-2.5 space-y-1 text-[11px] mb-2">
                        {product.specs.slice(0, 3).map((s, specIdx) => (
                          <div key={specIdx} className="spec-grid">
                            <span className="spec-label">{s.label}:</span>
                            <span className="spec-value truncate" title={s.value}>
                              {s.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="p-4 pt-0 border-t border-[#f0edef] mt-auto">
                    <div className="flex items-baseline justify-between mb-3 pt-3">
                      <div>
                        <span className="text-[10px] font-mono text-[#76777d] block">VERIFIED PRICE</span>
                        <span className="font-mono text-base font-bold text-[#000000] tabular-nums">
                          Rs. {product.priceNpr.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-[#10b981] font-semibold">
                        {product.warranty}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onProductClick(product)}
                        className="border border-[#c6c6cd] text-[#000000] hover:bg-[#f0edef] text-xs font-mono font-bold py-2 rounded-xl transition-all duration-200 flex items-center justify-center gap-1 cursor-pointer btn-press"
                      >
                        <span className="material-symbols-outlined text-[16px]">info</span>
                        Specs
                      </button>
                      <button
                        onClick={() => onAddToCart(product)}
                        className="bg-[#000000] hover:bg-[#1f2937] text-white text-xs font-mono font-bold py-2 rounded-xl transition-all duration-200 flex items-center justify-center gap-1 cursor-pointer btn-press hover:shadow-md"
                      >
                        <span className="material-symbols-outlined text-[16px]">add_shopping_cart</span>
                        Add
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          /* Compact Technical List View Mode */
          <div className="space-y-3">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-[#ffffff] border border-[#c6c6cd] rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-[#000000] transition-all card-hover-lift"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-xl border border-[#c6c6cd] cursor-pointer"
                    onClick={() => onProductClick(product)}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-[#dc2626] font-bold bg-[#dc2626]/10 px-2 py-0.5 rounded">
                        {product.sku}
                      </span>
                      <span className="text-xs font-mono text-[#76777d]">{product.vendorName}</span>
                    </div>
                    <h4
                      onClick={() => onProductClick(product)}
                      className="font-bold text-sm text-[#000000] hover:text-[#dc2626] cursor-pointer transition-colors"
                    >
                      {product.name}
                    </h4>
                    <p className="text-xs font-mono text-[#45464d] mt-0.5">
                      {product.specs.map(s => `${s.label}: ${s.value}`).join(' | ')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto pt-2 md:pt-0 border-t md:border-0 border-[#c6c6cd]/50">
                  <div className="text-right font-mono">
                    <span className="text-base font-bold text-[#000000] block tabular-nums">
                      Rs. {product.priceNpr.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-[#10b981] font-bold">{product.stockStatus}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onToggleCompare(product)}
                      className={`p-2 rounded-xl border transition-all ${
                        compareIds.includes(product.id)
                          ? 'bg-[#0f172a] text-amber-400 border-black'
                          : 'border-[#c6c6cd] text-[#45464d] hover:text-black'
                      }`}
                      title="Compare specs"
                    >
                      <span className="material-symbols-outlined text-[18px]">compare_arrows</span>
                    </button>
                    <button
                      onClick={() => onAddToCart(product)}
                      className="bg-[#000000] hover:bg-[#1f2937] text-white text-xs font-mono font-bold px-4 py-2 rounded-xl transition-all btn-press flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">add_shopping_cart</span>
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
