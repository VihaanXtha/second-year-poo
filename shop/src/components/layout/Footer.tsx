import Link from "next/link";

const links = {
  shop: [
    { name: "All Products", href: "/products" },
    { name: "PC Components", href: "/products?category=PC+Components" },
    { name: "IoT Gear", href: "/products?category=IoT+Gear" },
    { name: "Laptops", href: "/products?category=Laptops" },
    { name: "Networking", href: "/products?category=Networking" },
  ],
  company: [
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "FAQ", href: "/faq" },
  ],
  account: [
    { name: "Account", href: "/account" },
    { name: "Orders", href: "/account/orders" },
    { name: "Wishlist", href: "/wishlist" },
    { name: "Cart", href: "/cart" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Shop</h3>
            <ul className="space-y-2">
              {links.shop.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-slate-600 hover:text-slate-900">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Company</h3>
            <ul className="space-y-2">
              {links.company.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-slate-600 hover:text-slate-900">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Account</h3>
            <ul className="space-y-2">
              {links.account.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-slate-600 hover:text-slate-900">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link href="/contact" className="text-sm text-slate-600 hover:text-slate-900">Contact</Link></li>
              <li><Link href="/faq" className="text-sm text-slate-600 hover:text-slate-900">FAQ</Link></li>
              <li><a href="mailto:support@circuitbazaar.com" className="text-sm text-slate-600 hover:text-slate-900">support@circuitbazaar.com</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-slate-200 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">© 2026 Circuit Bazaar. Nepal&apos;s Technical Hardware Hub.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <a href="#" className="hover:text-slate-600"><span className="material-symbols-outlined text-[20px]">public</span></a>
            <a href="#" className="hover:text-slate-600"><span className="material-symbols-outlined text-[20px]">mail</span></a>
            <a href="#" className="hover:text-slate-600"><span className="material-symbols-outlined text-[20px]">phone_in_talk</span></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
