import React, { useState } from 'react';
import { VENDORS } from '../data/hardwareData';
import { Vendor } from '../types';

interface VendorsSectionProps {
  onSelectVendor: (vendor: Vendor) => void;
  onViewAllVendors: () => void;
}

export const VendorsSection: React.FC<VendorsSectionProps> = ({ onSelectVendor, onViewAllVendors }) => {
  const [selectedCity, setSelectedCity] = useState<string>('All');

  const filteredVendors = VENDORS.filter((v) => {
    if (selectedCity === 'All') return true;
    return v.location.toLowerCase().includes(selectedCity.toLowerCase());
  });

  return (
    <section className="py-16 bg-[#fcf8fa] border-b border-[#c6c6cd] relative overflow-hidden">
      {/* Background glow accent */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#dc2626]/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />

      <div className="max-w-[1280px] mx-auto px-4 md:px-6 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 animate-fade-in-up">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-ping" />
              <span className="material-symbols-outlined text-[#000000]">verified</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#000000] tracking-tight">
                Top Verified Nepal Vendors
              </h2>
            </div>
            <p className="text-sm text-[#45464d] mt-1 font-medium">
              Directly partner with verified IT hardware distributors across Nepal.
            </p>
          </div>

          {/* City Filter Tabs */}
          <div className="flex items-center gap-2 font-mono text-xs overflow-x-auto pb-1 no-scrollbar">
            {['All', 'Kathmandu', 'Lalitpur', 'Pokhara'].map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                  selectedCity === city
                    ? 'bg-[#000000] text-white font-bold shadow-md'
                    : 'bg-[#ffffff] text-[#45464d] border border-[#c6c6cd] hover:border-black'
                }`}
              >
                {city === 'All' ? 'All Cities' : city}
              </button>
            ))}
          </div>
        </div>

        {/* Vendor Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredVendors.map((vendor, idx) => (
            <div
              key={vendor.id}
              onClick={() => onSelectVendor(vendor)}
              className={`animate-fade-in-up stagger-${idx + 1} bg-[#ffffff] border border-[#c6c6cd] rounded-2xl p-6 card-hover-lift cursor-pointer group hover:border-[#000000] flex flex-col justify-between relative overflow-hidden`}
            >
              {/* Top Accent Stripe on hover */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#dc2626] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div>
                {/* Vendor Logo & Name */}
                <div className="flex items-center gap-3.5 mb-4">
                  <div
                    className={`w-12 h-12 ${vendor.badgeBg} rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                  >
                    {vendor.code}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#000000] text-sm group-hover:text-[#dc2626] transition-colors duration-200">
                      {vendor.name}
                    </h3>
                    <div className="flex items-center text-xs text-[#45464d] gap-1 mt-0.5 font-mono">
                      <span className="material-symbols-outlined text-[#f59e0b] text-[15px] font-fill">
                        star
                      </span>
                      <span className="font-bold text-[#000000]">{vendor.rating}</span>
                      <span>({vendor.reviewsCount} reviews)</span>
                    </div>
                  </div>
                </div>

                {/* Specialty Pill */}
                <div className="font-mono text-xs text-[#45464d] bg-[#f0edef] px-3 py-1 inline-block rounded-xl border border-[#c6c6cd]/60 mb-3 font-semibold">
                  {vendor.specialty}
                </div>

                <div className="text-[11px] font-mono text-[#76777d] space-y-1.5 mb-4">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]">schedule</span>
                    <span>Avg Response: <strong className="text-black">&lt; 15 mins</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                    <span className="material-symbols-outlined text-[14px]">verified</span>
                    <span>Genuine Brand Invoice Guaranteed</span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-[#f0edef] flex justify-between items-center text-[11px] font-mono text-[#76777d]">
                <span className="flex items-center gap-1 font-semibold text-black">
                  <span className="material-symbols-outlined text-[14px] text-[#dc2626]">location_on</span>
                  {vendor.location}
                </span>
                <span className="text-[#dc2626] font-bold group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                  Browse Catalog &rarr;
                </span>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
