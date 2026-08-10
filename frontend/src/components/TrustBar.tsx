import React from 'react';

const trustItems = [
  { icon: 'verified', text: '100% Verified Vendors' },
  { icon: 'local_shipping', text: 'Nationwide Delivery' },
  { icon: 'payments', text: 'Local Payments (eSewa/Khalti)' },
  { icon: 'hardware', text: 'Genuine Warranty' },
];

export const TrustBar: React.FC = () => {
  return (
    <section className="border-b border-[#c6c6cd] bg-[#fcf8fa] py-4">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6">
        <div className="flex flex-wrap justify-center gap-6 md:gap-10 items-center text-[#45464d] text-xs sm:text-sm bg-[#ffffff]/60 rounded-xl px-4 py-3 border border-[#c6c6cd]/40 shadow-sm">
          {trustItems.map((item, idx) => (
            <div
              key={item.icon}
              className={`flex items-center gap-2 group cursor-default animate-fade-in-up stagger-${idx + 1} ${
                idx > 0 ? 'md:pl-10 md:border-l md:border-[#c6c6cd]/40' : ''
              }`}
            >
              <span className="material-symbols-outlined text-[#000000] text-[20px] group-hover:scale-110 transition-transform duration-200">
                {item.icon}
              </span>
              <span className="font-medium group-hover:text-[#000000] transition-colors duration-200">
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
