import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "About Circuit Bazaar",
  description: "Nepal's specification-first hardware marketplace.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-slate-900 mb-6">About Circuit Bazaar</h1>
        <p className="text-lg text-slate-700 leading-relaxed mb-6">
          Circuit Bazaar is Nepal&apos;s specification-first hardware marketplace. We connect buyers with verified local vendors who publish transparent specs, real stock levels, and clear warranty terms.
        </p>
        <p className="text-lg text-slate-700 leading-relaxed mb-6">
          Our mission is to make buying PC components, IoT modules, laptops, and networking gear in Nepal trustworthy, transparent, and simple.
        </p>
        <h2 className="text-2xl font-bold text-slate-900 mb-3">Why Circuit Bazaar</h2>
        <ul className="list-disc pl-5 space-y-2 text-slate-700 mb-8">
          <li>Structured specifications for every product</li>
          <li>Verified vendor badges and reviews</li>
          <li>Local payment options: eSewa, Khalti, COD</li>
          <li>Official warranties and easy returns</li>
        </ul>
      </div>
      <Footer />
    </main>
  );
}
