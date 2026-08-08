import React from 'react';

export const TrustBar: React.FC = () => {
  return (
    <section className="border-b border-[#c6c6cd] bg-[#fcf8fa] py-4">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 flex flex-wrap justify-center gap-6 md:gap-12 items-center text-[#45464d] text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#000000] text-[20px]">verified</span>
          <span className="font-medium">100% Verified Vendors</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#000000] text-[20px]">local_shipping</span>
          <span className="font-medium">Nationwide Delivery</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#000000] text-[20px]">payments</span>
          <span className="font-medium">Local Payments (eSewa/Khalti)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#000000] text-[20px]">hardware</span>
          <span className="font-medium">Genuine Warranty</span>
        </div>
      </div>
    </section>
  );
};
