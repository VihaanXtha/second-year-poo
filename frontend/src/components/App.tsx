/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
"use client";

import { useState, useEffect } from 'react';
import { Header } from './Header';
import { HeroSection } from './HeroSection';
import { StatsBar } from './StatsBar';
import { TrustBar } from './TrustBar';
import { HardwareDropSection } from './HardwareDropSection';
import { VendorsSection } from './VendorsSection';
import { CommunityBuildsSection } from './CommunityBuildsSection';
import { ReviewsSection } from './ReviewsSection';
import { ProductCatalog } from './ProductCatalog';
import { Footer } from './Footer';

import { ProductModal } from './ProductModal';
import { PartsListModal } from './PartsListModal';
import { VendorModal } from './VendorModal';
import { CartDrawer } from './CartDrawer';
import { FavoritesModal } from './FavoritesModal';
import { BecomeVendorModal } from './BecomeVendorModal';
import { RMASupportModal } from './RMASupportModal';
import { RigBuilderModal } from './RigBuilderModal';
import { CompareDrawer } from './CompareDrawer';
import { CheckoutModal } from './CheckoutModal';
import { LiveTrustTicker } from './LiveTrustTicker';
import { FloatingDock } from './FloatingDock';
import { BottleneckCalculatorModal } from './BottleneckCalculatorModal';
import { HardwareQuizModal } from './HardwareQuizModal';
import { CommandPaletteModal } from './CommandPaletteModal';

import { PRODUCTS, VENDORS } from '../data/hardwareData';
import { CategoryType, Product, Vendor, CommunityBuild, CartItem } from '../types';

export default function App() {
  const [activeCategory, setActiveCategory] = useState<CategoryType | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Cart & Favorites State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>(['prod-1', 'prod-4']);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  // Auth State
  const [user, setUser] = useState<{ name: string; email: string; role?: string } | null>(null);

  // Active Modals State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedBuild, setSelectedBuild] = useState<CommunityBuild | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isBecomeVendorOpen, setIsBecomeVendorOpen] = useState(false);
  const [isRMAOpen, setIsRMAOpen] = useState(false);
  const [isRigBuilderOpen, setIsRigBuilderOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isBottleneckOpen, setIsBottleneckOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Listen for Ctrl+K or / key to open command palette
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  const handleLogin = async (email: string, password: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    setUser({ name: data.user.name, email: data.user.email, role: data.user.role });
  };

  const handleSignup = async (name: string, email: string, password: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, password_confirmation: password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Signup failed');
    setUser({ name: data.user.name, email: data.user.email, role: data.user.role });
  };

  const handleLogout = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/logout`, { method: 'POST' });
    setUser(null);
  };

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

  const handleAddMultipleToCart = (products: Product[]) => {
    products.forEach((p) => handleAddToCart(p, 1));
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

  // Community Build Clone
  const handleAddBuildPartsToCart = (build: CommunityBuild) => {
    build.partsList.forEach((part) => {
      const matchedProd = PRODUCTS.find((p) => p.sku === part.sku);
      if (matchedProd) {
        handleAddToCart(matchedProd, 1);
      } else {
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

  // Compare operations
  const handleToggleCompare = (product: Product) => {
    setCompareIds((prev) => {
      if (prev.includes(product.id)) {
        return prev.filter((id) => id !== product.id);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), product.id];
      }
      return [...prev, product.id];
    });
  };

  const compareProducts = PRODUCTS.filter((p) => compareIds.includes(p.id));
  const favoriteProducts = PRODUCTS.filter((p) => favoriteIds.includes(p.id));
  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const scrollToInventory = () => {
    const el = document.getElementById('inventory');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#fcf8fa] text-[#1b1b1d] font-sans antialiased flex flex-col relative selection:bg-red-500/20">
      
      {/* Top Header Navigation */}
       <Header
        activeCategory={activeCategory}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          scrollToInventory();
        }}
        cartCount={totalCartCount}
        favoritesCount={favoriteIds.length}
        compareCount={compareIds.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        onOpenBecomeVendor={() => setIsBecomeVendorOpen(true)}
        onOpenRMA={() => setIsRMAOpen(true)}
        onOpenRigBuilder={() => setIsRigBuilderOpen(true)}
        user={user}
        onLogin={handleLogin}
        onSignup={handleSignup}
        onLogout={handleLogout}
      />

      <main className="flex-1">
        {/* Hero Banner Section */}
        <HeroSection
          onBrowseClick={scrollToInventory}
          onVendorClick={() => setIsBecomeVendorOpen(true)}
          onOpenRigBuilder={() => setIsRigBuilderOpen(true)}
        />

        {/* Dark Stats Bar */}
        <StatsBar />

        {/* Light Trust Markers Bar */}
        <TrustBar />

        {/* Quick Tools Promo Banner Bar */}
        <section className="bg-[#0f172a] text-white py-3 border-y border-[#1e293b] font-mono text-xs">
          <div className="max-w-[1280px] mx-auto px-4 md:px-6 flex flex-wrap justify-between items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#dc2626] animate-ping" />
              <span className="font-bold text-gray-200">INTERACTIVE SYSTEM TOOLS:</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsBottleneckOpen(true)}
                className="hover:text-[#38bdf8] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">speed</span>
                <span>Bottleneck Calc</span>
              </button>
              <span className="text-gray-600">|</span>
              <button
                onClick={() => setIsQuizOpen(true)}
                className="hover:text-purple-400 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                <span>Hardware Finder Quiz</span>
              </button>
              <span className="text-gray-600">|</span>
              <button
                onClick={() => setIsCommandPaletteOpen(true)}
                className="hover:text-emerald-400 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">search</span>
                <span>Cmd+K Palette</span>
              </button>
            </div>
          </div>
        </section>

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
          compareIds={compareIds}
          onToggleCompare={handleToggleCompare}
        />

        {/* Community Rig Builds */}
        <CommunityBuildsSection
          onSelectBuild={(b) => setSelectedBuild(b)}
          onCloneBuild={handleAddBuildPartsToCart}
        />

        {/* Verified Nepal Buyer Reviews */}
        <ReviewsSection />
      </main>

      {/* Footer */}
      <Footer
        onOpenVendorPortal={() => setIsBecomeVendorOpen(true)}
        onOpenRMA={() => setIsRMAOpen(true)}
        onNavigateCategory={scrollToInventory}
      />

      {/* Side-by-Side Spec Compare Drawer */}
      <CompareDrawer
        compareProducts={compareProducts}
        onRemoveCompare={(id) => setCompareIds((prev) => prev.filter((pId) => pId !== id))}
        onClearCompare={() => setCompareIds([])}
        onAddToCart={(p) => handleAddToCart(p, 1)}
      />

      {/* Floating Action Dock */}
      <FloatingDock
        onOpenRigBuilder={() => setIsRigBuilderOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        compareCount={compareIds.length}
        cartCount={totalCartCount}
      />

      {/* Live Social Proof Purchase Ticker */}
      <LiveTrustTicker />

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
        onOpenCheckout={() => setIsCheckoutOpen(true)}
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

      <RigBuilderModal
        isOpen={isRigBuilderOpen}
        onClose={() => setIsRigBuilderOpen(false)}
        onAddBuildToCart={handleAddMultipleToCart}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        onClearCart={handleClearCart}
      />

      <BottleneckCalculatorModal
        isOpen={isBottleneckOpen}
        onClose={() => setIsBottleneckOpen(false)}
        onOpenRigBuilder={() => setIsRigBuilderOpen(true)}
      />

      <HardwareQuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        onSelectProduct={(p) => setSelectedProduct(p)}
        onAddToCart={(p) => handleAddToCart(p, 1)}
      />

      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectProduct={(p) => setSelectedProduct(p)}
        onOpenRigBuilder={() => setIsRigBuilderOpen(true)}
        onOpenBottleneckCalc={() => setIsBottleneckOpen(true)}
        onOpenQuiz={() => setIsQuizOpen(true)}
      />
    </div>
  );
}
