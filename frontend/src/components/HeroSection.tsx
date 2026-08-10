"use client";

import React, { useState, useEffect } from 'react';

interface HeroSectionProps {
  onBrowseClick: () => void;
  onVendorClick: () => void;
  onOpenRigBuilder?: () => void;
}

const SPOTLIGHT_ITEMS = [
  {
    title: 'NVIDIA RTX 4080 Super 16GB',
    sku: 'SKU-GPU-4080S',
    tag: 'GRAPHICS HEAVYWEIGHT',
    spec: '16GB GDDR6X | 10240 CUDA Cores | DLSS 3.5',
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=800',
    price: 'Rs. 185,000',
  },
  {
    title: 'AMD Ryzen 7 7800X3D Processor',
    sku: 'SKU-CPU-7800X3D',
    tag: 'GAMING KING',
    spec: '8 Cores / 16 Threads | 104MB Cache | 5.0GHz',
    image: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&q=80&w=800',
    price: 'Rs. 58,500',
  },
  {
    title: 'MikroTik RB5009UG+S+IN Enterprise Router',
    sku: 'SKU-[#000000]-RB5009',
    tag: 'ENTERPRISE NETWORKING',
    spec: 'Marvell Armada 7040 Quad-Core | 10G SFP+ | PoE',
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=800',
    price: 'Rs. 38,000',
  },
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  onBrowseClick,
  onVendorClick,
  onOpenRigBuilder,
}) => {
  const [spotlightIndex, setSpotlightIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSpotlightIndex((prev) => (prev + 1) % SPOTLIGHT_ITEMS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const currentItem = SPOTLIGHT_ITEMS[spotlightIndex];

  return (
    <section className="relative bg-[#ffffff] border-b border-[#c6c6cd] overflow-hidden py-10 md:py-16">
      {/* Decorative background dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #000000 1px, transparent 0)`,
          backgroundSize: '28px 28px',
        }}
      />

      <div className="max-w-[1280px] mx-auto px-4 md:px-6 grid md:grid-cols-12 gap-8 lg:gap-12 items-center relative">
        
        {/* Left Column: Hero Intro */}
        <div className="md:col-span-7 z-10 flex flex-col items-start space-y-6">
          
          {/* Trust pill badge */}
          <div className="animate-fade-in-up inline-flex flex-wrap items-center gap-2 bg-[#f0edef] px-3.5 py-1.5 rounded-full border border-[#c6c6cd] shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse relative">
              <span className="absolute inset-0 rounded-full bg-[#10b981] animate-ping opacity-40" />
            </span>
            <span className="font-mono text-[11px] font-bold text-[#000000] uppercase tracking-wider">
              Nepal's Specification-First Hardware Exchange
            </span>
          </div>

          <h1 className="animate-fade-in-up stagger-2 text-3xl sm:text-4xl lg:text-5xl font-bold text-[#000000] tracking-tight leading-[1.15]">
            Build & Source Genuine <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#000000] via-[#dc2626] to-[#dc2626]">
              IT Hardware & Rigs
            </span><br />
            With Verified Vendors
          </h1>

          <p className="animate-fade-in-up stagger-3 text-sm sm:text-base text-[#45464d] max-w-lg leading-relaxed font-medium">
            Discover genuine PC components, server hardware, networking gear, and custom rigs backed by verified Nepal vendor warranties. Filter by technical SKU specs without marketing fluff.
          </p>

          {/* Action Button Row */}
          <div className="animate-fade-in-up stagger-4 flex flex-wrap gap-3 pt-2">
            <button
              onClick={onBrowseClick}
              className="bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 active:scale-95 flex items-center gap-2 cursor-pointer btn-press"
            >
              <span className="material-symbols-outlined text-[20px]">manage_search</span>
              Explore Hardware Inventory
            </button>

            {onOpenRigBuilder && (
              <button
                onClick={onOpenRigBuilder}
                className="bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-xl shadow-md transition-all duration-300 active:scale-95 flex items-center gap-2 cursor-pointer btn-press"
              >
                <span className="material-symbols-outlined text-[#38bdf8] text-[20px]">construction</span>
                Custom Rig Builder
              </button>
            )}

            <button
              onClick={onVendorClick}
              className="bg-[#fcf8fa] border border-[#c6c6cd] hover:border-[#000000] hover:bg-[#f6f3f5] text-[#000000] text-xs sm:text-sm font-bold px-5 py-3 rounded-xl transition-all duration-300 active:scale-95 flex items-center gap-2 cursor-pointer btn-press"
            >
              <span className="material-symbols-outlined text-[18px]">storefront</span>
              Vendor Portal
            </button>
          </div>

          {/* Key Feature Badges */}
          <div className="animate-fade-in-up stagger-5 pt-4 border-t border-[#c6c6cd]/50 w-full grid grid-cols-3 gap-4 font-mono text-[11px] text-[#45464d]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#10b981] text-[18px]">verified</span>
              <span>100% Genuine Warranty</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#000000] text-[18px]">local_shipping</span>
              <span>Express Valley Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#dc2626] text-[18px]">security</span>
              <span>Verified SKU Lookup</span>
            </div>
          </div>

        </div>

        {/* Right Column: Dynamic Hardware Spotlight Slider */}
        <div className="md:col-span-5 animate-fade-in-up stagger-5 relative">
          <div className="h-80 sm:h-[400px] rounded-2xl bg-[#f6f3f5] border border-[#c6c6cd] overflow-hidden shadow-xl group img-zoom relative flex flex-col justify-between">
            <img
              src={currentItem.image}
              alt={currentItem.title}
              className="w-full h-full object-cover transition-opacity duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/90 via-[#0f172a]/30 to-transparent pointer-events-none" />
            
            {/* Top Indicator */}
            <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-10">
              <span className="bg-[#0f172a]/90 glass text-white font-mono text-[10px] font-bold px-3 py-1 rounded-xl border border-white/20">
                {currentItem.tag}
              </span>

              {/* Slide Nav Dots */}
              <div className="flex gap-1.5 bg-black/50 glass px-2 py-1 rounded-full border border-white/20">
                {SPOTLIGHT_ITEMS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSpotlightIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                      spotlightIndex === idx ? 'bg-[#dc2626] w-4' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Bottom Info Card */}
            <div className="absolute bottom-4 left-4 right-4 bg-[#0f172a]/95 glass p-4 rounded-xl border border-white/20 text-white font-mono shadow-2xl z-10">
              <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] font-bold text-[#dc2626]">{currentItem.sku}</span>
                <span className="font-bold text-sm text-white">{currentItem.price}</span>
              </div>
              <h4 className="font-bold text-sm text-white truncate mb-1">{currentItem.title}</h4>
              <p className="text-[11px] text-gray-300 font-sans truncate">{currentItem.spec}</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
