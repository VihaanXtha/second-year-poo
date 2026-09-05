"use client";

import React, { useState, useEffect } from 'react';
import { CategoryType } from '../types';
import Link from 'next/link';

interface HeaderProps {
  activeCategory: CategoryType | 'All';
  onSelectCategory: (cat: CategoryType | 'All') => void;
  cartCount: number;
  favoritesCount: number;
  compareCount: number;
  onOpenCart: () => void;
  onOpenFavorites: () => void;
  onOpenBecomeVendor: () => void;
  onOpenRMA: () => void;
  onOpenRigBuilder: () => void;
  user: { name: string; email: string; role?: string } | null;
  onLogin: (email: string, password: string) => Promise<void>;
  onSignup: (name: string, email: string, password: string) => Promise<void>;
  onLogout: () => Promise<void>;
}

export const Header: React.FC<HeaderProps> = ({
  activeCategory,
  onSelectCategory,
  cartCount,
  favoritesCount,
  compareCount,
  onOpenCart,
  onOpenFavorites,
  onOpenBecomeVendor,
  onOpenRMA,
  onOpenRigBuilder,
  user,
  onLogout
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 border-b
        ${scrolled
          ? 'bg-[#fcf8fa]/90 glass border-[#c6c6cd] shadow-md'
          : 'bg-[#fcf8fa] border-[#c6c6cd]'
        }`}
    >
      <div className="flex justify-between items-center w-full px-4 md:px-6 max-w-[1280px] mx-auto h-16">
        <div className="flex items-center gap-4 lg:gap-6">
          {/* Logo */}
          <button 
            onClick={() => onSelectCategory('All')} 
            className="flex items-center gap-2.5 text-left focus:outline-none group focus-ring cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-[#0f172a] flex items-center justify-center p-1.5 shadow-sm group-hover:scale-105 group-hover:bg-[#dc2626] transition-all duration-300">
              <span className="material-symbols-outlined text-[#38bdf8] group-hover:text-white text-[20px]">hardware</span>
            </div>
            <div>
              <span className="text-xl font-bold text-[#000000] tracking-tight group-hover:text-[#dc2626] transition-colors duration-200 block leading-tight">
                Circuit Bazaar
              </span>
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#dc2626] block -mt-0.5">
                NEPAL HARDWARE HUB
              </span>
            </div>
          </button>
        </div>

        {/* Navigation Category Links */}
        <nav className="hidden lg:flex items-center gap-6">
          {(['PC Components', 'IoT Gear', 'Laptops', 'Networking'] as CategoryType[]).map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`relative text-xs font-mono tracking-tight transition-all duration-200 py-1 font-semibold focus-ring cursor-pointer ${
                activeCategory === cat
                  ? 'text-[#dc2626] font-bold'
                  : 'text-[#45464d] hover:text-[#000000]'
              }`}
            >
              {cat}
              <span
                className={`absolute left-0 -bottom-0.5 h-0.5 bg-[#dc2626] transition-all duration-300 ease-out ${
                  activeCategory === cat ? 'w-full' : 'w-0 group-hover:w-full'
                }`}
              />
            </button>
          ))}
        </nav>

        {/* Action Buttons & Portal Triggers */}
        <div className="flex items-center gap-2.5 md:gap-3 text-[#45464d]">
          
          {/* Rig Builder Button */}
          <button
            onClick={onOpenRigBuilder}
            className="hidden sm:flex items-center gap-1.5 text-xs font-mono font-bold text-[#dc2626] bg-[#dc2626]/10 hover:bg-[#dc2626]/20 px-3 py-1.5 rounded-xl border border-[#dc2626]/30 transition-all duration-200 btn-press cursor-pointer shadow-sm"
            title="Open Interactive Custom PC Rig Builder"
          >
            <span className="material-symbols-outlined text-[16px]">construction</span>
            <span>Build Rig</span>
          </button>

          {/* Vendor Portal Button */}
          <button
            onClick={onOpenBecomeVendor}
            className="hidden xl:flex items-center gap-1.5 text-xs font-mono font-semibold text-[#000000] bg-[#f0edef] hover:bg-[#e4e2e4] px-2.5 py-1.5 rounded-xl border border-[#c6c6cd] hover:border-[#76777d] transition-all duration-200 btn-press cursor-pointer"
            title="Become a Marketplace Vendor"
          >
            <span className="material-symbols-outlined text-[16px]">storefront</span>
            <span>Vendor Portal</span>
          </button>

          {/* User Profile */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 hover:bg-[#f6f3f5] rounded-xl px-2 py-1 transition-all duration-200 focus-ring cursor-pointer border border-[#c6c6cd]"
              >
                <span className="material-symbols-outlined text-[20px] text-[#dc2626]">account_circle</span>
                <span className="hidden md:block text-xs font-mono font-bold text-[#000000]">{user.name}</span>
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-[#c6c6cd] rounded-xl shadow-xl z-50 animate-fade-in-down overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-[#c6c6cd] bg-[#f6f3f5]">
                    <p className="text-xs font-mono font-bold text-[#000000]">{user.name}</p>
                    <p className="text-xs font-mono text-[#45464d]">{user.email}</p>
                    {user.role === 'admin' && (
                      <p className="text-[10px] font-mono text-[#dc2626] font-bold mt-0.5">ADMIN</p>
                    )}
                    {user.role === 'vendor' && (
                      <p className="text-[10px] font-mono text-[#38bdf8] font-bold mt-0.5">VENDOR</p>
                    )}
                  </div>
                  {user.role === 'admin' && (
                    <a href="http://admin.localhost" className="block w-full text-left px-4 py-2.5 text-xs font-mono text-[#dc2626] hover:bg-[#f6f3f5] transition-colors cursor-pointer">
                      Admin Dashboard
                    </a>
                  )}
                  {user.role === 'vendor' && (
                    <a href="http://vendor.localhost" className="block w-full text-left px-4 py-2.5 text-xs font-mono text-[#38bdf8] hover:bg-[#f6f3f5] transition-colors cursor-pointer">
                      Vendor Dashboard
                    </a>
                  )}
                  <button
                    onClick={() => {
                      onLogout();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs font-mono text-[#dc2626] hover:bg-[#f6f3f5] transition-colors cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="hidden md:flex items-center gap-1.5 text-xs font-mono font-bold text-white bg-[#0f172a] hover:bg-[#1f2937] px-3 py-1.5 rounded-xl transition-all duration-200 hover:shadow-md btn-press cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">login</span>
              <span>Sign In</span>
            </Link>
          )}

          {/* Compare Count Badge */}
          {compareCount > 0 && (
            <div className="bg-[#0f172a] text-white text-[11px] font-mono font-bold px-2.5 py-1 rounded-xl flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-amber-400">compare_arrows</span>
              <span>{compareCount}</span>
            </div>
          )}

          {/* Favorites Button */}
          <button
            onClick={onOpenFavorites}
            className="hover:text-[#000000] transition-all duration-200 p-2 relative rounded-xl hover:bg-[#f6f3f5] hover:shadow-sm focus-ring cursor-pointer"
            title="Saved Specifications / Favorites"
            aria-label="Favorites"
          >
            <span className="material-symbols-outlined text-[22px]">favorite</span>
            {favoritesCount > 0 && (
              <span className="absolute top-0.5 right-0.5 bg-[#dc2626] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center font-mono animate-pop-in">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Cart Drawer Button */}
          <button
            onClick={onOpenCart}
            className="hover:text-[#000000] transition-all duration-200 p-2 relative rounded-xl hover:bg-[#f6f3f5] hover:shadow-sm focus-ring cursor-pointer"
            title="Shopping Cart & Spec List"
            aria-label="Cart"
          >
            <span className="material-symbols-outlined text-[22px]">shopping_cart</span>
            {cartCount > 0 && (
              <span className="absolute top-0.5 right-0.5 bg-[#dc2626] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center font-mono animate-pop-in">
                {cartCount}
              </span>
            )}
          </button>

          {/* RMA Support Button */}
          <button
            onClick={onOpenRMA}
            className="hover:text-[#dc2626] transition-all duration-200 p-2 rounded-xl hover:bg-[#f6f3f5] hover:shadow-sm focus-ring cursor-pointer"
            title="Warranty & RMA Support Lookup"
            aria-label="RMA Support"
          >
            <span className="material-symbols-outlined text-[22px]">verified_user</span>
          </button>
        </div>
      </div>

      {/* Mobile Category Bar */}
      <div className="lg:hidden border-t border-[#c6c6cd]/50 px-4 py-2 bg-[#f6f3f5]">
        <div className="flex gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          <button
            onClick={() => onSelectCategory('All')}
            className={`px-3 py-1 rounded-full font-mono whitespace-nowrap transition-all duration-200 cursor-pointer ${
              activeCategory === 'All'
                ? 'bg-[#000000] text-white font-bold shadow-md'
                : 'bg-[#ffffff] text-[#45464d] border border-[#c6c6cd]'
            }`}
          >
            All Hardware
          </button>
          {(['PC Components', 'IoT Gear', 'Laptops', 'Networking'] as CategoryType[]).map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-3 py-1 rounded-full font-mono whitespace-nowrap transition-all duration-200 cursor-pointer ${
                activeCategory === cat
                  ? 'bg-[#000000] text-white font-bold shadow-md'
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
