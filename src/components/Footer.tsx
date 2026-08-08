import React from 'react';

interface FooterProps {
  onOpenVendorPortal: () => void;
  onOpenRMA: () => void;
  onNavigateCategory: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenVendorPortal,
  onOpenRMA,
  onNavigateCategory,
}) => {
  return (
    <footer className="bg-[#e4e2e4] dark:bg-[#191b24] border-t border-[#c6c6cd] w-full py-10 px-4 md:px-6 flex flex-col items-center justify-center gap-4 text-center">
      <h2 className="text-2xl font-bold text-[#000000] tracking-tight">Circuit Bazaar</h2>

      <div className="flex flex-wrap justify-center gap-6 font-mono text-xs font-medium text-[#45464d]">
        <button onClick={onNavigateCategory} className="hover:underline hover:text-[#000000]">
          About Us
        </button>
        <button onClick={onOpenVendorPortal} className="hover:underline hover:text-[#000000]">
          Vendor Portal
        </button>
        <button onClick={onNavigateCategory} className="hover:underline hover:text-[#000000]">
          Shipping Policy
        </button>
        <button onClick={onNavigateCategory} className="hover:underline hover:text-[#000000]">
          Privacy Policy
        </button>
        <button onClick={onOpenRMA} className="hover:underline hover:text-[#000000]">
          Verify Specs
        </button>
        <button onClick={onOpenRMA} className="text-[#dc2626] font-bold hover:underline">
          RMA Support
        </button>
      </div>

      <p className="font-mono text-xs text-[#45464d] mt-2 leading-relaxed">
        © 2024 Circuit Bazaar. Nepal's Technical Hardware Hub.<br />
        <span className="opacity-75 text-[11px] mt-0.5 block">Affiliated with Pokhara University</span>
      </p>
    </footer>
  );
};
