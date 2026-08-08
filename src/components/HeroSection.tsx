import React from 'react';
import { HERO_IMAGE } from '../data/hardwareData';

interface HeroSectionProps {
  onBrowseClick: () => void;
  onVendorClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onBrowseClick, onVendorClick }) => {
  return (
    <section className="relative bg-[#ffffff] border-b border-[#c6c6cd] overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-12 md:py-20 grid md:grid-cols-2 gap-8 md:gap-12 items-center">
        <div className="z-10 flex flex-col items-start space-y-6">
          <div className="inline-flex items-center gap-2 bg-[#f0edef] px-3 py-1.5 rounded-full border border-[#c6c6cd]/60">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
            <span className="font-mono text-[11px] font-bold text-[#45464d] uppercase tracking-wider">
              Live Inventory System
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#000000] tracking-tight leading-[1.15]">
            Nepal's First <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#000000] via-[#dc2626] to-[#dc2626]">
              Specification-First
            </span><br />
            Hardware Marketplace
          </h1>

          <p className="text-base text-[#45464d] max-w-md leading-relaxed">
            Find genuine IT components and networking gear with verified local vendors. Filter by exact technical specifications, not marketing jargon.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={onBrowseClick}
              className="bg-[#dc2626] hover:bg-[#b91c1c] text-white text-sm font-bold px-6 py-3 rounded shadow-sm hover:shadow transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">manage_search</span>
              Browse Inventory
            </button>
            <button
              onClick={onVendorClick}
              className="bg-[#fcf8fa] border border-[#c6c6cd] hover:border-[#76777d] hover:bg-[#f6f3f5] text-[#000000] text-sm font-bold px-6 py-3 rounded transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">storefront</span>
              Become a Vendor
            </button>
          </div>
        </div>

        {/* Hero Image Container */}
        <div className="relative h-64 md:h-[380px] rounded bg-[#f6f3f5] border border-[#c6c6cd] overflow-hidden shadow-sm group">
          <img
            src={HERO_IMAGE}
            alt="Hero Hardware Array - High-end PC components and IoT hardware"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/40 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-3 right-3 bg-[#0f172a]/80 backdrop-blur-md px-3 py-1.5 rounded border border-white/20 text-white font-mono text-[11px] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]"></span>
            Verify Specs via SKU Code
          </div>
        </div>
      </div>
    </section>
  );
};
