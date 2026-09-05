const faqs = [
  {
    question: "Are all vendors on Circuit Bazaar verified?",
    answer:
      "Yes. Every vendor undergoes identity, inventory, and warranty verification before listing. We inspect their stock, validate serial numbers, and confirm warranty coverage with local distributors.",
  },
  {
    question: "What payment methods are accepted?",
    answer:
      "We support eSewa, Khalti, bank transfers, and cash on delivery across Nepal. All online transactions are secured with industry-standard encryption.",
  },
  {
    question: "How does the warranty work?",
    answer:
      "All products come with the manufacturer&apos;s or vendor&apos;s local warranty. Claims are handled directly by the vendor — no overseas support tickets, no language barriers.",
  },
  {
    question: "Can I return a product if it&apos;s not as described?",
    answer:
      "Absolutely. If the product doesn&apos;t match the listed specs, we facilitate returns within 48 hours of delivery. The vendor covers return shipping for verified mismatches.",
  },
  {
    question: "Do you ship outside the Kathmandu Valley?",
    answer:
      "Yes. We ship to Pokhara, Biratnagar, Chitwan, and all major districts via trusted courier partners. Delivery typically takes 1–3 business days outside the valley.",
  },
];

export default function FAQPreview() {
  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-slate-600">
            Quick answers to common questions. Can&apos;t find what you need? Reach out
            to our support team.
          </p>
        </div>
        <div className="mt-12 space-y-4">
          {faqs.map((faq, idx) => (
            <details
              key={idx}
              className="group rounded-2xl bg-white p-6 ring-1 ring-slate-200 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-slate-900">
                {faq.question}
                <span className="ml-4 flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-transform group-open:rotate-45">
                  <span className="material-symbols-outlined text-[18px]">
                    add
                  </span>
                </span>
              </summary>
              <p className="mt-4 text-sm text-slate-600 leading-relaxed">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
