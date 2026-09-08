import Link from "next/link";

const footerLinks = {
  marketplace: [
    { name: "PC Components", href: "/shop" },
    { name: "IoT Gear", href: "/shop" },
    { name: "Laptops", href: "/shop" },
    { name: "Networking", href: "/shop" },
  ],
  company: [
    { name: "About", href: "/" },
    { name: "Blog", href: "/blogs" },
    { name: "Careers", href: "/career" },
    { name: "Contact", href: "/" },
  ],
  support: [
    { name: "FAQ", href: "/" },
    { name: "Shipping", href: "/" },
    { name: "Returns", href: "/" },
    { name: "Warranty", href: "/" },
  ],
  vendors: [
    { name: "Become a Vendor", href: "/vendor" },
    { name: "Vendor Portal", href: process.env.NEXT_PUBLIC_VENDOR_URL || "http://localhost:3002" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/" },
    { name: "Terms of Service", href: "/" },
  ],
};

export default function Footer() {
  return (
    <footer className="glass-footer pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white">
                <span className="material-symbols-outlined text-red-600 text-[20px]">
                  hardware
                </span>
              </div>
              <div className="leading-tight">
                <span className="block text-lg font-bold tracking-tight text-white">
                  Circuit Bazaar
                </span>
                  <span className="block text-[10px] font-mono font-bold tracking-widest text-red-400">
                    Nepal hardware hub
                  </span>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-300 leading-relaxed max-w-xs">
              Nepal&apos;s specification-first hardware marketplace. Verified vendors, transparent specs, local warranty.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Marketplace</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.marketplace.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Company</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="mt-6 text-sm font-semibold text-white">Vendors</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.vendors.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Support</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="mt-6 text-sm font-semibold text-white">Legal</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-400">
            &copy; 2024 Circuit Bazaar. Nepal&apos;s Technical Hardware Hub.
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <button type="button" className="hover:text-white transition-colors" aria-label="Website">
              <span className="material-symbols-outlined text-[20px]">
                public
              </span>
            </button>
            <button type="button" className="hover:text-white transition-colors" aria-label="Email">
              <span className="material-symbols-outlined text-[20px]">
                mail
              </span>
            </button>
            <button type="button" className="hover:text-white transition-colors" aria-label="Phone">
              <span className="material-symbols-outlined text-[20px]">
                phone_in_talk
              </span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
