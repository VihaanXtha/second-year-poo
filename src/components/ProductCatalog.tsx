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
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  activeCategory,
  onSelectCategory,
  searchQuery,
  onProductClick,
  onAddToCart,
  onToggleFavorite,
  favoriteIds
}) => {
  const [selectedVendorId, setSelectedVendorId] = useState<string>('All');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'recommended' | 'price-low' | 'price-high' | 'rating'>('recommended');

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((p) => {
      // Category filter
      if (activeCategory !== 'All' && p.category !== activeCategory) {
        return false;
      }
      // Vendor filter
      if (selectedVendorId !== 'All' && p.vendorId !== selectedVendorId) {
        return false;
      }
      // Stock filter
      if (inStockOnly && p.stockStatus !== 'In Stock') {
        return false;
      }
      // Search query (SKU, Name, Category, or Spec values)
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
  }, [activeCategory, selectedVendorId, inStockOnly, searchQuery, sortBy]);

  return (
    <section id="inventory" className="py-12 bg-[#f6f3f5] border-b border-[#c6c6cd]">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#000000]">tune</span>
              <h2 className="text-2xl font-bold text-[#000000] tracking-tight">
                Hardware Inventory
              </h2>
            </div>
            <p className="text-xs text-[#45464d] font-mono mt-1">
              Showing {filteredProducts.length} verified technical items
              {searchQuery ? ` matching "${searchQuery}"` : ''}
            </p>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            {/* Vendor Dropdown Filter */}
            <div className="flex items-center gap-1.5 bg-[#ffffff] border border-[#c6c6cd] rounded px-2.5 py-1.5">
              <span className="text-[#76777d]">VENDOR:</span>
              <select
                value={selectedVendorId}
                onChange={(e) => setSelectedVendorId(e.target.value)}
                className="bg-transparent font-bold focus:outline-none cursor-pointer"
              >
                <option value="All">All Vendors ({VENDORS.length})</option>
                {VENDORS.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>

            {/* In Stock Toggle */}
            <label className="flex items-center gap-2 bg-[#ffffff] border border-[#c6c6cd] rounded px-3 py-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded accent-[#000000]"
              />
              <span className="font-semibold text-[#1b1b1d]">In-Stock Only</span>
            </label>

            {/* Sort By Dropdown */}
            <div className="flex items-center gap-1.5 bg-[#ffffff] border border-[#c6c6cd] rounded px-2.5 py-1.5">
              <span className="text-[#76777d]">SORT:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent font-bold focus:outline-none cursor-pointer"
              >
                <option value="recommended">Recommended</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-[#c6c6cd] pb-4">
          <button
            onClick={() => onSelectCategory('All')}
            className={`px-3.5 py-1.5 rounded text-xs font-mono transition-all cursor-pointer ${
              activeCategory === 'All'
                ? 'bg-[#000000] text-white font-bold shadow-sm'
                : 'bg-[#ffffff] text-[#45464d] border border-[#c6c6cd] hover:border-[#000000]'
            }`}
          >
            All Categories
          </button>
          {(['PC Components', 'IoT Gear', 'Laptops', 'Networking'] as CategoryType[]).map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-3.5 py-1.5 rounded text-xs font-mono transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-[#000000] text-white font-bold shadow-sm'
                  : 'bg-[#ffffff] text-[#45464d] border border-[#c6c6cd] hover:border-[#000000]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-[#ffffff] border border-[#c6c6cd] rounded p-12 text-center my-8">
            <span className="material-symbols-outlined text-4xl text-[#76777d] mb-2">search_off</span>
            <h3 className="font-bold text-lg text-[#000000]">No components found matching specifications</h3>
            <p className="text-xs font-mono text-[#76777d] mt-1 max-w-md mx-auto">
              Try resetting your vendor or category filters, or search using a broader keyword.
            </p>
            <button
              onClick={() => {
                onSelectCategory('All');
                setSelectedVendorId('All');
                setInStockOnly(false);
              }}
              className="mt-4 px-4 py-2 bg-[#000000] text-white text-xs font-mono font-bold rounded hover:bg-[#1f2937]"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const isFav = favoriteIds.includes(product.id);
              return (
                <div
                  key={product.id}
                  className="bg-[#ffffff] border border-[#c6c6cd] rounded overflow-hidden hover:border-[#000000] hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  {/* Card Header & Image */}
                  <div>
                    <div className="p-3 bg-[#f0edef] border-b border-[#c6c6cd]/60 flex justify-between items-center text-[10px] font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
                        <span className="font-bold text-[#000000]">{product.vendorName}</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded font-bold ${
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

                    <div
                      onClick={() => onProductClick(product)}
                      className="relative h-44 bg-[#f6f3f5] overflow-hidden cursor-pointer group-hover:opacity-95"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(product);
                        }}
                        className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md transition-colors ${
                          isFav ? 'bg-[#dc2626] text-white' : 'bg-white/80 text-[#45464d] hover:text-[#dc2626]'
                        }`}
                        title={isFav ? 'Remove from saved' : 'Save hardware spec'}
                      >
                        <span className="material-symbols-outlined text-[18px]">favorite</span>
                      </button>
                    </div>

                    {/* Card Details */}
                    <div className="p-4">
                      <div className="text-[11px] font-mono text-[#dc2626] font-bold tracking-tight mb-1">
                        {product.sku}
                      </div>

                      <h3
                        onClick={() => onProductClick(product)}
                        className="font-bold text-[#000000] text-sm leading-snug line-clamp-2 hover:text-[#dc2626] cursor-pointer transition-colors mb-3 h-10"
                      >
                        {product.name}
                      </h3>

                      {/* Technical Specs Box (JetBrains Mono Key-Value Grid) */}
                      <div className="bg-[#f0edef] border border-[#c6c6cd]/50 rounded p-2.5 space-y-1 text-[11px] mb-4">
                        {product.specs.slice(0, 3).map((s, idx) => (
                          <div key={idx} className="spec-grid">
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
                        <span className="font-mono text-base font-bold text-[#000000]">
                          Rs. {product.priceNpr.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex items-center text-xs font-mono text-[#45464d]">
                        <span className="material-symbols-outlined text-[#f59e0b] text-[15px] font-fill mr-0.5">
                          star
                        </span>
                        <span className="font-bold">{product.rating}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onProductClick(product)}
                        className="border border-[#c6c6cd] text-[#000000] hover:bg-[#f0edef] text-xs font-mono font-bold py-2 rounded transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">info</span>
                        Specs
                      </button>
                      <button
                        onClick={() => onAddToCart(product)}
                        className="bg-[#000000] hover:bg-[#1f2937] text-white text-xs font-mono font-bold py-2 rounded transition-colors flex items-center justify-center gap-1 cursor-pointer"
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
        )}
      </div>
    </section>
  );
};
