import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | Circuit Bazaar",
  description: "How Circuit Bazaar handles your data.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-slate-900 mb-6">Privacy Policy</h1>
        <p className="text-sm text-slate-500 mb-8">Last updated: September 2026</p>
        <div className="prose prose-slate max-w-none">
          <p className="text-lg text-slate-700 leading-relaxed mb-6">
            Circuit Bazaar respects your privacy and is committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use our platform.
          </p>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Information We Collect</h2>
          <p className="text-slate-700 leading-relaxed mb-6">We collect information you provide directly, such as name, email, phone number, shipping address, and payment details when placing orders or registering as a vendor.</p>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">How We Use Your Information</h2>
          <p className="text-slate-700 leading-relaxed mb-6">Your data is used to process orders, communicate order updates, improve our services, and comply with legal obligations. We do not sell your personal data to third parties.</p>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Data Security</h2>
          <p className="text-slate-700 leading-relaxed mb-6">We implement security measures to protect your data. However, no method of transmission over the internet is 100% secure.</p>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Contact Us</h2>
          <p className="text-slate-700 leading-relaxed">If you have questions about this policy, contact us at <Link href="mailto:support@circuitbazaar.com" className="text-red-700 hover:underline">support@circuitbazaar.com</Link>.</p>
        </div>
      </div>
    </main>
  );
}
