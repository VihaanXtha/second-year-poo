"use client";

import { useEffect, useState } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import { getFaqs } from "@/lib/api";

export default function FAQPreview() {
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getFaqs()
      .then((data) => {
        if (!cancelled) {
          setFaqs((data.faqs || []).filter((f) => f.is_active).slice(0, 5));
        }
      })
      .catch((e) => console.error(e))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">Frequently Asked Questions</h2>
            <p className="mt-2 text-slate-600">Quick answers to common questions.</p>
          </div>
          <div className="mt-12 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl bg-white p-6 ring-1 ring-slate-200 h-20 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (faqs.length === 0) {
    return null;
  }

  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal direction="up">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-slate-600">
              Quick answers to common questions. Can&apos;t find what you need? Reach out
              to our support team.
            </p>
          </div>
        </ScrollReveal>
        <div className="mt-12 space-y-4">
          {faqs.map((faq, idx) => (
            <ScrollReveal key={faq.question} direction="up" delay={idx * 80}>
              <details
                className="group rounded-2xl bg-white p-6 ring-1 ring-slate-200 hover:ring-red-200 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-slate-900">
                  {faq.question}
                  <span className="ml-4 flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-transform duration-300 group-open:rotate-45 group-open:bg-red-50 group-open:text-red-600">
                    <span className="material-symbols-outlined text-[18px]">
                      add
                    </span>
                  </span>
                </summary>
                <p className="mt-4 text-sm text-slate-600 leading-relaxed">
                  {faq.answer}
                </p>
              </details>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
