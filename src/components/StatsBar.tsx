import React from 'react';

export const StatsBar: React.FC = () => {
  return (
    <section className="bg-[#0f172a] text-white py-6 border-b border-[#1e293b]">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 flex flex-wrap justify-between items-center gap-6 text-center md:text-left">
        <div className="flex-1 min-w-[140px]">
          <div className="font-mono text-2xl lg:text-3xl font-bold text-[#dc2626] tracking-tight">500+</div>
          <div className="text-xs text-gray-300 mt-1 uppercase tracking-wider font-mono">Verified Components</div>
        </div>
        
        <div className="hidden md:block w-px h-10 bg-[#1e293b]" />
        
        <div className="flex-1 min-w-[140px]">
          <div className="font-mono text-2xl lg:text-3xl font-bold text-[#dc2626] tracking-tight">120+</div>
          <div className="text-xs text-gray-300 mt-1 uppercase tracking-wider font-mono">Active Vendors</div>
        </div>
        
        <div className="hidden md:block w-px h-10 bg-[#1e293b]" />
        
        <div className="flex-1 min-w-[140px]">
          <div className="font-mono text-2xl lg:text-3xl font-bold text-[#dc2626] tracking-tight">24h</div>
          <div className="text-xs text-gray-300 mt-1 uppercase tracking-wider font-mono">RMA & Support</div>
        </div>
        
        <div className="hidden md:block w-px h-10 bg-[#1e293b]" />
        
        <div className="flex-1 min-w-[140px]">
          <div className="font-mono text-2xl lg:text-3xl font-bold text-[#dc2626] tracking-tight">0%</div>
          <div className="text-xs text-gray-300 mt-1 uppercase tracking-wider font-mono">Counterfeit Risk</div>
        </div>
      </div>
    </section>
  );
};
