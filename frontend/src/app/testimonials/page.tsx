import { Metadata } from "next";
import { apiClient, Testimonial } from "@/lib/api";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Testimonials | Circuit Bazaar",
  description: "See what customers, builders, and vendors say about Circuit Bazaar.",
};

export default async function TestimonialsPage() {
  const data = await apiClient<{ testimonials: Testimonial[] }>('/testimonials');
  const testimonials = data.testimonials || [];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">What Our Community Says</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Real feedback from real users — customers, vendors, and tech enthusiasts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((t) => (
            <div key={t.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                {t.photo && (
                  <img src={t.photo} alt={t.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                )}
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role} {t.company && `at ${t.company}`}</p>
                </div>
              </div>
              <div className="flex items-center gap-0.5 mb-3">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={`text-sm ${i < (t.rating || 5) ? 'text-yellow-400' : 'text-slate-300'}`}>★</span>
                ))}
              </div>
              <p className="text-slate-700 text-sm leading-relaxed">{t.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
