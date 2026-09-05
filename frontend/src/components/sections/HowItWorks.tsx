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
    <section id="how-it-works" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            How It Works
          </h2>
          <p className="mt-4 text-slate-600">
            Buying hardware in Nepal just got simpler. Here&apos;s the Circuit Bazaar
            way.
          </p>
        </div>
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div key={step.number} className="relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
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
              {step.number !== "04" && (
                <div className="hidden lg:block absolute top-7 left-[calc(100%+1rem)] w-[calc(100%-3rem)] border-t-2 border-dashed border-slate-200" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
