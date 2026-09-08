import { getFaqs } from "@/lib/api";

export const metadata = {
  title: "FAQ | Circuit Bazaar",
};

export default async function FAQPage() {
  let faqs: { question: string; answer: string }[] = [];
  try {
    const data = await getFaqs();
    faqs = (data.faqs || []).filter((f: any) => f.is_active);
  } catch (e) {
    console.error(e);
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">Frequently Asked Questions</h1>
        <div className="space-y-4">
          {faqs.map((item, idx) => (
            <div key={idx} className="rounded-xl border border-slate-200 p-6">
              <h3 className="text-base font-semibold text-slate-900 mb-2">{item.question}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
