"use client";

import { useEffect, useState, useCallback } from 'react';
import ScrollReveal from "@/components/ScrollReveal";
import { apiClient, Testimonial } from '@/lib/api';

const AUTO_SCROLL_INTERVAL = 3500;

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiClient<{ testimonials: Testimonial[] }>('/testimonials');
        setTestimonials(data.testimonials || []);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  const next = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, testimonials.length - 2));
  }, [testimonials.length]);

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.max(1, testimonials.length - 2)) % Math.max(1, testimonials.length - 2));
  };

  useEffect(() => {
    if (testimonials.length <= 3 || isPaused) return;
    const timer = setInterval(next, AUTO_SCROLL_INTERVAL);
    return () => clearInterval(timer);
  }, [testimonials.length, isPaused, next]);

  if (testimonials.length === 0) return null;

  const visibleTestimonials = testimonials.slice(currentIndex, currentIndex + 3);
  const hasMore = testimonials.length > 3;

  return (
    <section id="testimonials" className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal direction="up">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              Trusted by builders across Nepal
            </h2>
            <p className="mt-2 text-slate-600">
              Don&apos;t take our word for it — hear from the community.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={150}>
          <div
            className="mt-16 relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {visibleTestimonials.map((t) => (
                <div
                  key={t.id}
                  className="group rounded-2xl bg-white p-8 ring-1 ring-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-lg ${i < (t.rating || 5) ? 'text-amber-400' : 'text-slate-300'}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <blockquote className="mt-4 text-slate-700 leading-relaxed text-lg">
                    &ldquo;{t.content}&rdquo;
                  </blockquote>
                  <div className="mt-6 flex items-center gap-3">
                    {t.photo ? (
                      <img
                        src={t.photo}
                        alt={t.name}
                        className="h-10 w-10 rounded-full object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600">
                        {t.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                      <p className="text-xs text-slate-500">
                        {t.role} {t.company && `at ${t.company}`}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {hasMore && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg ring-1 ring-slate-200 hover:bg-white transition-colors hover:scale-110"
                  aria-label="Previous testimonials"
                >
                  <svg className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={next}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg ring-1 ring-slate-200 hover:bg-white transition-colors hover:scale-110"
                  aria-label="Next testimonials"
                >
                  <svg className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <div className="mt-6 flex items-center justify-center gap-2">
                  {Array.from({ length: Math.max(1, testimonials.length - 2) }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        idx === currentIndex ? 'w-8 bg-red-700' : 'w-2 bg-slate-300 hover:bg-slate-400'
                      }`}
                      aria-label={`Go to testimonial group ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
