"use client";
import React, { useState, useEffect } from "react";
import { Search, ShoppingBag, User, ChevronDown, Facebook, Instagram, Heart, Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import Logo from "./Logo";
import { getBrandSlug, getCategorySlug } from "../utils/slug";
import { API_ENDPOINTS, fetchData, normalizeCategories } from "../utils/api";

export default function Header() {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [brandsDropdownOpen, setBrandsDropdownOpen] = useState(false);
  const [mainCategories, setMainCategories] = useState([]);
  const [kbeautyBrands, setKbeautyBrands] = useState([]);
  const router = useRouter();

  const { cart } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const { wishlist } = useWishlist();

  useEffect(() => {
      const loadNavData = async () => {
        const [cats, brands] = await Promise.all([
          fetchData(API_ENDPOINTS.CATEGORIES),
          fetchData(API_ENDPOINTS.BRANDS),
        ]);
        if (cats && Array.isArray(cats)) setMainCategories(normalizeCategories(cats));
        if (brands && Array.isArray(brands)) setKbeautyBrands(brands);
      };
      loadNavData();
    }, []);

  const cartCount = (cart || []).reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = (wishlist || []).length;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (localSearch.trim()) {
      router.push(`/search?q=${encodeURIComponent(localSearch)}`);
    }
  };

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    router.push("/");
  };

  return (
    <header className="w-full bg-white z-50 font-sans text-gray-900 shadow-sm" id="pretty-header">
      {/* 1. Top Bar */}
      <div className="border-b border-gray-100 py-2 px-4 sm:px-8">
        <div className="max-w-[1300px] mx-auto flex justify-between items-center text-[12px] text-gray-600">
          <div className="flex items-center space-x-4">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-inherit">
              <Facebook className="w-4 h-4 cursor-pointer hover:text-orange-500 transition-colors" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-inherit">
              <Instagram className="w-4 h-4 cursor-pointer hover:text-orange-500 transition-colors" />
            </a>
            <a href="https://google.com" target="_blank" rel="noopener noreferrer" className="text-inherit">
              <Globe className="w-4 h-4 cursor-pointer hover:text-orange-500 transition-colors" />
            </a>
            <span className="ml-2 font-medium">Get Express Delivery All Over Nepal</span>
          </div>
          <div className="hidden md:flex items-center space-x-6 font-medium">
            <Link href="/stores" className="hover:text-orange-500 transition-colors">Our Stores</Link>
            <div className="h-3 w-[1px] bg-gray-300"></div>
            <Link href="/privacy" className="hover:text-orange-500 transition-colors">Privacy Policy</Link>
            <div className="h-3 w-[1px] bg-gray-300"></div>
            <Link href="/faq" className="hover:text-orange-500 transition-colors">FAQ</Link>
          </div>
        </div>
      </div>

      {/* 2. Main Header Bar */}
      <div className="py-4 pl-4 pr-4 sm:pl-8 sm:pr-8 lg:pl-16 lg:pr-8">
        <div className="max-w-[1300px] mx-auto flex items-center justify-between gap-8">
          {/* Logo & Brands/Shop Links */}
          <div className="flex items-center space-x-10">
            <Link href="/" className="shrink-0">
              <Logo />
            </Link>
            <div className="hidden lg:flex items-center space-x-8 text-[14px] font-bold text-gray-800 uppercase tracking-tight">
              <div
                className="relative"
                onMouseEnter={() => setBrandsDropdownOpen(true)}
                onMouseLeave={() => setBrandsDropdownOpen(false)}
                onFocus={() => setBrandsDropdownOpen(true)}
                onBlur={() => setBrandsDropdownOpen(false)}
              >
                <button
                  type="button"
                  className="flex items-center gap-1.5 bg-transparent border-none p-0 text-[14px] font-bold text-gray-800 uppercase tracking-tight hover:text-orange-500 transition-colors cursor-pointer"
                  aria-expanded={brandsDropdownOpen}
                  aria-haspopup="true"
                >
                  Brands <ChevronDown className={`w-4 h-4 transition-transform ${brandsDropdownOpen ? "rotate-180" : ""}`} />
                </button>
                {brandsDropdownOpen && (
                  <div className="absolute left-0 top-full z-[160] mt-4 w-[420px] rounded-lg border border-gray-100 bg-white p-5 shadow-2xl">
                    <div className="grid grid-cols-2 gap-3">
                      {kbeautyBrands.map((brand) => (
                        <Link
                          key={brand.name}
                          href={`/brand/${getBrandSlug(brand.name)}`}
                          className="block rounded-md p-2 text-[12px] font-bold text-gray-700 transition-colors hover:bg-orange-50 hover:text-orange-600"
                        >
                          <span className="truncate">{brand.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <Link href="/products" className="hover:text-orange-500 transition-colors">Our Shop</Link>
              <Link href="/products?sale=true" className="hover:text-orange-500 transition-colors">On Sale</Link>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl relative">
            <input
              type="text"
              placeholder="Search"
              className="w-full bg-[#f3f4f6] border-none rounded-md py-2.5 px-6 text-[14px] focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </form>

          {/* Actions */}
          <div className="flex items-center space-x-5">
            {/* User Dropdown / Sign In */}
            <div className="relative">
              {!isAuthenticated ? (
                <Link
                  href="/login"
                  className="bg-orange-500 text-white px-8 py-2.5 rounded-md text-[13px] font-bold uppercase tracking-wide hover:bg-orange-600 transition-colors decoration-none"
                >
                  SIGN IN
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors bg-transparent cursor-pointer focus:outline-none"
                  >
                    <User className="w-5 h-5 text-gray-700" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 w-56 bg-white shadow-2xl rounded-xl py-3 z-[100] border border-gray-100 animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-2 border-b border-gray-50 mb-2">
                        <p className="text-xs font-black text-gray-950 uppercase tracking-tight">{user.name || 'User'}</p>
                        <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                      </div>
                      <Link href="/profile" className="block px-4 py-2 text-xs font-bold text-gray-700 hover:bg-orange-50 hover:text-orange-600 decoration-none transition-colors">My Profile</Link>
                      <Link href="/orders" className="block px-4 py-2 text-xs font-bold text-gray-700 hover:bg-orange-50 hover:text-orange-600 decoration-none transition-colors">My Orders</Link>
                      <Link href="/rewards" className="block px-4 py-2 text-xs font-bold text-gray-700 hover:bg-orange-50 hover:text-orange-600 decoration-none transition-colors">Beauty Points</Link>
                      <div className="h-px bg-gray-50 my-2"></div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 decoration-none transition-colors bg-transparent border-none cursor-pointer"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Cart & Wishlist */}
            <div className="flex items-center space-x-4">
              <Link href="/cart" className="relative w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-700 decoration-none">
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link href="/wishlist" className="relative w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-700 decoration-none">
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                    {wishlistCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Mega Menu Category Bar */}
      <div
        className="bg-white border-t border-gray-100 relative overflow-visible"
        onMouseLeave={() => setActiveCategory(null)}
      >
        <div className="max-w-[1300px] mx-auto flex items-center justify-between px-4">
          <div className="flex items-center space-x-8 text-[13px] font-bold text-gray-800 uppercase tracking-tight">
            {mainCategories.map((cat) => (
              <div
                key={cat.name}
                className="relative py-3.5"
                onMouseEnter={() => setActiveCategory(cat.name)}
                onFocus={() => setActiveCategory(cat.name)}
              >
                <Link
                  href={`/category/${getCategorySlug(cat.name)}`}
                  className="hover:text-orange-500 transition-colors flex items-center gap-1.5"
                  aria-expanded={activeCategory === cat.name}
                  aria-haspopup="true"
                >
                  {cat.name} <ChevronDown className={`w-3 h-3 opacity-40 transition-transform ${activeCategory === cat.name ? "rotate-180" : ""}`} />
                </Link>
              </div>
            ))}
          </div>


        </div>
        {/* Mega Menu Dropdowns - rendered outside the constrained container */}
        {mainCategories.map((cat) => (
          <div
            key={`dropdown-${cat.name}`}
            className={`${activeCategory === cat.name ? "block" : "hidden"} absolute top-full left-0 right-0 max-w-[1300px] mx-auto bg-white shadow-2xl border-t border-gray-100 z-[150] animate-in fade-in slide-in-from-top-1 duration-200 pointer-events-auto overflow-hidden`}
            onMouseEnter={() => setActiveCategory(cat.name)}
          >
            <div className="max-w-[1300px] mx-auto px-8 py-12">
              <div className="grid grid-cols-5 gap-10">
                {cat.subcategories.map(sub => (
                  <div key={sub.name} className="flex flex-col min-w-0">
                    <Link
                      href={`/subcategory/${getCategorySlug(sub.name)}`}
                      className="text-[14px] font-black text-gray-950 uppercase tracking-tight hover:text-orange-500 mb-6 block border-b border-gray-50 pb-2 truncate"
                    >
                      {sub.name}
                    </Link>
                    <ul className="space-y-3">
                      {sub.types.map(type => (
                        <li key={type.id}>
                          <Link
                            href={`/type/${getCategorySlug(type.name)}`}
                            className="text-[12px] text-gray-500 hover:text-orange-600 transition-colors font-medium capitalize block truncate"
                          >
                            {type.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </header>
  );
}
