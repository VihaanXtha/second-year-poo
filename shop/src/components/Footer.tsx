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
  const links = [
    { label: 'About Us', onClick: onNavigateCategory },
    { label: 'Vendor Portal', onClick: onOpenVendorPortal },
    { label: 'Shipping Policy', onClick: onNavigateCategory },
    { label: 'Privacy Policy', onClick: onNavigateCategory },
    { label: 'Verify Specs', onClick: onOpenRMA },
  ];

  return (
    <footer className="bg-[#e4e2e4] dark:bg-[#191b24] border-t border-[#c6c6cd] w-full relative overflow-hidden">
      {/* Top gradient accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#dc2626]/40 to-transparent" />

      <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-10">
        <div className="flex flex-col items-center gap-6 text-center">
          {/* Logo */}
          <div className="group cursor-default">
            <h2 className="text-2xl font-bold text-[#000000] tracking-tight group-hover:tracking-normal transition-all duration-300">
              Circuit Bazaar
            </h2>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap justify-center gap-6 font-mono text-xs font-medium text-[#45464d]">
            {links.map((link) => (
              <button
                key={link.label}
                onClick={link.onClick}
                className="hover-underline-grow hover:text-[#000000] transition-colors duration-200 py-0.5"
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={onOpenRMA}
              className="text-[#dc2626] font-bold hover-underline-grow py-0.5"
            >
              RMA Support
            </button>
          </div>

          {/* Separator */}
          <div className="w-16 h-px bg-[#c6c6cd]" />

          {/* Copyright */}
          <p className="font-mono text-xs text-[#45464d] leading-relaxed">
            © 2024 Circuit Bazaar. Nepal's Technical Hardware Hub.<br />
            <span className="opacity-75 text-[11px] mt-0.5 block">Affiliated with Pokhara University</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
