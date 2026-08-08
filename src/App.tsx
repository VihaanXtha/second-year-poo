/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { StatsBar } from './components/StatsBar';
import { TrustBar } from './components/TrustBar';
import { HardwareDropSection } from './components/HardwareDropSection';
import { VendorsSection } from './components/VendorsSection';
import { CommunityBuildsSection } from './components/CommunityBuildsSection';
import { ProductCatalog } from './components/ProductCatalog';
import { Footer } from './components/Footer';

import { ProductModal } from './components/ProductModal';
import { PartsListModal } from './components/PartsListModal';
import { VendorModal } from './components/VendorModal';
import { CartDrawer } from './components/CartDrawer';
import { FavoritesModal } from './components/FavoritesModal';
import { BecomeVendorModal } from './components/BecomeVendorModal';
import { RMASupportModal } from './components/RMASupportModal';

import { PRODUCTS, VENDORS } from './data/hardwareData';
import { CategoryType, Product, Vendor, CommunityBuild, CartItem } from './types';

export default function App() {
  const [activeCategory, setActiveCategory] = useState<CategoryType | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Cart & Favorites State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>(['prod-1', 'prod-4']);

  // Active Modals State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedBuild, setSelectedBuild] = useState<CommunityBuild | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isBecomeVendorOpen, setIsBecomeVendorOpen] = useState(false);
  const [isRMAOpen, setIsRMAOpen] = useState(false);

  // Cart operations
  const handleAddToCart = (product: Product, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Add all parts from a community build to cart
  const handleAddBuildPartsToCart = (build: CommunityBuild) => {
    build.partsList.forEach((part) => {
      const matchedProd = PRODUCTS.find((p) => p.sku === part.sku);
      if (matchedProd) {
        handleAddToCart(matchedProd, 1);
      } else {
        // Construct fallback product representation
        const tempProd: Product = {
          id: `build-part-${part.sku}`,
          sku: part.sku,
          name: part.name,
          category: 'PC Components',
          subCategory: part.componentType,
          priceNpr: part.priceNpr,
          image: build.image,
          vendorId: 'ng',
          vendorName: part.vendorName,
          vendorCode: 'NG',
          isVerifiedVendor: true,
          stockStatus: 'In Stock',
          stockCount: 10,
          rating: 4.8,
          reviewCount: 12,
          specs: [{ label: 'COMPONENT TYPE', value: part.componentType }],
          warranty: 'Official Brand Warranty',
          description: `Component extracted from ${build.title} build list.`,
          inBox: [part.name],
        };
        handleAddToCart(tempProd, 1);
      }
    });
    setIsCartOpen(true);
  };

  // Favorites operations
  const handleToggleFavorite = (product: Product) => {
    setFavoriteIds((prev) =>
      prev.includes(product.id)
        ? prev.filter((id) => id !== product.id)
        : [...prev, product.id]
    );
  };

  const favoriteProducts = PRODUCTS.filter((p) => favoriteIds.includes(p.id));

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const scrollToInventory = () => {
    const el = document.getElementById('inventory');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#fcf8fa] text-[#1b1b1d] font-sans antialiased flex flex-col">
      {/* Top Header Navigation */}
      <Header
        activeCategory={activeCategory}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          scrollToInventory();
        }}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (q) scrollToInventory();
        }}
        cartCount={totalCartCount}
        favoritesCount={favoriteIds.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        onOpenBecomeVendor={() => setIsBecomeVendorOpen(true)}
        onOpenRMA={() => setIsRMAOpen(true)}
      />

      <main className="flex-1">
        {/* Hero Banner Section */}
        <HeroSection
          onBrowseClick={scrollToInventory}
          onVendorClick={() => setIsBecomeVendorOpen(true)}
        />

        {/* Dark Stats Bar */}
        <StatsBar />

        {/* Light Trust Markers Bar */}
        <TrustBar />

        {/* Hardware Drop Countdown */}
        <HardwareDropSection />

        {/* Top Local Vendors */}
        <VendorsSection
          onSelectVendor={(v) => setSelectedVendor(v)}
          onViewAllVendors={() => setSelectedVendor(VENDORS[0])}
        />

        {/* Main Hardware Inventory Catalog */}
        <ProductCatalog
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          searchQuery={searchQuery}
          onProductClick={(p) => setSelectedProduct(p)}
          onAddToCart={(p) => handleAddToCart(p, 1)}
          onToggleFavorite={handleToggleFavorite}
          favoriteIds={favoriteIds}
        />

        {/* Community Rig Builds */}
        <CommunityBuildsSection
          onSelectBuild={(b) => setSelectedBuild(b)}
        />
      </main>

      {/* Footer */}
      <Footer
        onOpenVendorPortal={() => setIsBecomeVendorOpen(true)}
        onOpenRMA={() => setIsRMAOpen(true)}
        onNavigateCategory={scrollToInventory}
      />

      {/* Slide-over & Modal Windows */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(p, q) => {
          handleAddToCart(p, q);
          setSelectedProduct(null);
        }}
        onToggleFavorite={handleToggleFavorite}
        isFavorite={selectedProduct ? favoriteIds.includes(selectedProduct.id) : false}
      />

      <PartsListModal
        build={selectedBuild}
        onClose={() => setSelectedBuild(null)}
        onAddAllPartsToCart={handleAddBuildPartsToCart}
      />

      <VendorModal
        vendor={selectedVendor}
        onClose={() => setSelectedVendor(null)}
        onProductClick={(p) => {
          setSelectedVendor(null);
          setSelectedProduct(p);
        }}
        onAddToCart={(p) => handleAddToCart(p, 1)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
      />

      <FavoritesModal
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favoriteProducts={favoriteProducts}
        onRemoveFavorite={handleToggleFavorite}
        onAddToCart={(p) => handleAddToCart(p, 1)}
      />

      <BecomeVendorModal
        isOpen={isBecomeVendorOpen}
        onClose={() => setIsBecomeVendorOpen(false)}
      />

      <RMASupportModal
        isOpen={isRMAOpen}
        onClose={() => setIsRMAOpen(false)}
      />
    </div>
  );
}
