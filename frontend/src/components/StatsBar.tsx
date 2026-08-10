import React from 'react';

export const StatsBar: React.FC = () => {
  const stats = [
    { value: '500+', label: 'Verified Components' },
    { value: '120+', label: 'Active Vendors' },
    { value: '24h', label: 'RMA & Support' },
    { value: '0%', label: 'Counterfeit Risk' },
  ];

  return (
    <section className="relative bg-[#0f172a] text-white py-6 border-b border-[#1e293b] overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a] via-[#0f172a]/95 to-[#0f172a] pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-4 md:px-6 flex flex-wrap justify-between items-center gap-6 text-center md:text-left relative z-10">
        {stats.map((stat, idx) => (
          <React.Fragment key={stat.label}>
            {idx > 0 && (
              <div className="hidden md:block w-px h-10 bg-[#1e293b]" />
            )}
            <div className={`flex-1 min-w-[140px] animate-fade-in-up stagger-${idx + 1}`}>
              <div className="font-mono text-2xl lg:text-3xl font-bold text-[#dc2626] tracking-tight tabular-nums">
                {stat.value}
              </div>
              <div className="text-xs text-gray-300 mt-1 uppercase tracking-wider font-mono">
                {stat.label}
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>
    </section>
  );
};
