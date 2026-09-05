import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const faqs = [
  { q: "How do I place an order?", a: "Browse products, add them to cart, and checkout using Cash on Delivery, eSewa, or Khalti." },
  { q: "Do you offer warranty?", a: "Yes, most products come with official manufacturer warranties. Warranty terms are listed on each product page." },
  { q: "What payment methods are supported?", a: "We support Cash on Delivery, eSewa, Khalti, and bank transfers." },
  { q: "How can I become a vendor?", a: "Apply through the vendor registration form on our frontend. Our team will review and verify your store." },
  { q: "Where do you deliver?", a: "We deliver across Nepal. Shipping costs and delivery times vary by location." },
];

export const metadata = {
  title: "FAQ | Circuit Bazaar",
};

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">Frequently Asked Questions</h1>
        <div className="space-y-4">
          {faqs.map((item, idx) => (
            <div key={idx} className="rounded-xl border border-slate-200 p-6">
              <h3 className="text-base font-semibold text-slate-900 mb-2">{item.q}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </main>
  );
}
