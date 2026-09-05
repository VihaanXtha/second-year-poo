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
    { name: "Vendor Portal", href: "https://vendercircuit.vercel.app" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/" },
    { name: "Terms of Service", href: "/" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-slate-900 pt-16 pb-8">
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
                <span className="block text-[10px] font-mono font-bold uppercase tracking-widest text-red-500">
                  Nepal Hardware Hub
                </span>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-400 leading-relaxed max-w-xs">
              Nepal&apos;s specification-first hardware marketplace. Verified vendors, transparent specs, local warranty.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Marketplace</h4>
            <ul className="mt-4 space-y-2">
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
            <h4 className="text-sm font-semibold text-white">Company</h4>
            <ul className="mt-4 space-y-2">
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
            <h4 className="mt-6 text-sm font-semibold text-white">Vendors</h4>
            <ul className="mt-4 space-y-2">
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
            <h4 className="text-sm font-semibold text-white">Support</h4>
            <ul className="mt-4 space-y-2">
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
            <h4 className="mt-6 text-sm font-semibold text-white">Legal</h4>
            <ul className="mt-4 space-y-2">
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
          <p className="text-sm text-slate-500">
            &copy; 2024 Circuit Bazaar. Nepal&apos;s Technical Hardware Hub.
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <a href="#" className="hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[20px]">
                public
              </span>
            </a>
            <a href="#" className="hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[20px]">
                mail
              </span>
            </a>
            <a href="#" className="hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[20px]">
                phone_in_talk
              </span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
