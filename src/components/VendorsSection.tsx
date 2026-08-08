import React from 'react';
import { VENDORS } from '../data/hardwareData';
import { Vendor } from '../types';

interface VendorsSectionProps {
  onSelectVendor: (vendor: Vendor) => void;
  onViewAllVendors: () => void;
}

export const VendorsSection: React.FC<VendorsSectionProps> = ({ onSelectVendor, onViewAllVendors }) => {
  return (
    <section className="py-16 bg-[#fcf8fa] border-b border-[#c6c6cd]">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold text-[#000000] tracking-tight">Top Rated Local Vendors</h2>
            <p className="text-sm text-[#45464d] mt-1">Verified partners delivering authentic components.</p>
          </div>
          <button
            onClick={onViewAllVendors}
            className="text-[#dc2626] font-medium text-sm hover:underline flex items-center gap-1 group cursor-pointer"
          >
            <span>View All</span>
            <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {VENDORS.map((vendor) => (
            <div
              key={vendor.id}
              onClick={() => onSelectVendor(vendor)}
              className="bg-[#ffffff] border border-[#c6c6cd] rounded p-6 hover:shadow-md transition-all cursor-pointer group hover:border-[#000000]"
            >
              <div className="flex items-center gap-4 mb-4">
                <div
                  className={`w-12 h-12 ${vendor.badgeBg} rounded flex items-center justify-center text-white font-bold text-xl shadow-sm`}
                >
                  {vendor.code}
                </div>
                <div>
                  <h3 className="font-bold text-[#000000] group-hover:text-[#dc2626] transition-colors">
                    {vendor.name}
                  </h3>
                  <div className="flex items-center text-xs text-[#45464d] gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-[#f59e0b] text-[16px] font-fill">
                      star
                    </span>
                    <span className="font-bold text-[#000000]">{vendor.rating}</span>
                    <span>({vendor.reviewsCount} reviews)</span>
                  </div>
                </div>
              </div>

              <div className="font-mono text-xs text-[#45464d] bg-[#fcf8fa] px-2.5 py-1 inline-block rounded border border-[#c6c6cd]/60">
                {vendor.specialty}
              </div>

              <div className="mt-3 pt-3 border-t border-[#f0edef] flex justify-between items-center text-[11px] font-mono text-[#76777d]">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">location_on</span>
                  {vendor.location}
                </span>
                <span className="text-[#10b981] font-bold">Verified</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
