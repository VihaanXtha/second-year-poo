import ScrollReveal from "@/components/ScrollReveal";

const features = [
  {
    title: "Verified Vendor Network",
    description:
      "Every seller is vetted. No unauthorized resellers, no grey-market imports. Only vendors who meet our standards get listed.",
    icon: "verified",
  },
  {
    title: "Specification-First Listings",
    description:
      "No generic titles. Every product page includes full specs, SKU, live stock count, and warranty terms so you can compare apples to apples.",
    icon: "list_alt",
  },
  {
    title: "Local Warranty, Local Support",
    description:
      "Products backed by official Nepal warranties. Reach your vendor directly if something goes wrong — no overseas support tickets.",
    icon: "support_agent",
  },
  {
    title: "Transparent Pricing",
    description:
      "All prices in NPR. No hidden customs fees, no last-minute checkout surprises. What you see is what you pay.",
    icon: "receipt_long",
  },
  {
    title: "Secure Checkout",
    description:
      "Pay online via eSewa, Khalti, or bank transfer. Cash on delivery available across Nepal. Your transaction is protected end-to-end.",
    icon: "lock",
  },
];

export default function WhyCircuitBazaar() {
  return (
    <section id="why" className="relative overflow-hidden bg-slate-50 py-20">
      <div className="absolute inset-0 -z-10 circuit-bg opacity-40" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal direction="up">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              Why buyers choose Circuit Bazaar
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              We built the marketplace we wished existed when we were students sourcing
              components for our projects.
            </p>
          </div>
        </ScrollReveal>
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <ScrollReveal key={feature.title} direction="up" delay={i * 100}>
              <div
                className="group relative rounded-2xl bg-white p-6 ring-1 ring-slate-200 hover:ring-red-200 transition-all duration-500 hover:shadow-xl hover:shadow-red-500/5 hover:-translate-y-1 tilt-card cursor-default"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors duration-300">
                  <span className="material-symbols-outlined text-[24px]">
                    {feature.icon}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
