const steps = [
  {
    number: "01",
    title: "Browse & Compare",
    description:
      "Filter by category, vendor, or spec. Read real reviews from verified buyers.",
    icon: "search",
  },
  {
    number: "02",
    title: "Verify & Choose",
    description:
      "Check vendor ratings, warranty terms, and stock status before you buy.",
    icon: "fact_check",
  },
  {
    number: "03",
    title: "Buy Securely",
    description:
      "Pay online via eSewa, Khalti, or bank transfer. Cash on delivery available.",
    icon: "payments",
  },
  {
    number: "04",
    title: "Get Support",
    description:
      "If anything goes wrong, your vendor&apos;s local warranty has you covered.",
    icon: "support_agent",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative overflow-hidden bg-white py-20">
      <div className="absolute inset-0 -z-10 circuit-bg opacity-50" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-600 ring-1 ring-red-600/20">
            How It Works
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            Buying hardware, <span className="text-gradient-red">simplified.</span>
          </h2>
          <p className="mt-4 text-slate-600">
            Buying hardware in Nepal just got simpler. Here&apos;s the Circuit Bazaar
            way.
          </p>
        </div>
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div
              key={step.number}
              className="group relative rounded-2xl bg-white p-6 ring-1 ring-slate-200 hover:ring-red-200 card-hover-lift transition-all"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[28px]">
                  {step.icon}
                </span>
              </div>
              <span className="mt-4 block text-xs font-mono font-bold uppercase tracking-widest text-slate-400">
                Step {step.number}
              </span>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                {step.description}
              </p>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-9 left-[calc(100%+0.5rem)] w-[calc(100%-3rem)] h-px bg-gradient-to-r from-slate-200 via-red-200 to-slate-200" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
