'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import type { HomepageSlider } from '@/lib/api';

export default function HomepageSlider() {
  const [sliders, setSliders] = useState<HomepageSlider[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    apiClient<{ sliders: HomepageSlider[] }>('/sliders')
      .then((data) => {
        if (!cancelled) setSliders(data.sliders || []);
      })
      .catch((e) => console.error(e))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (sliders.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % sliders.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [sliders.length]);

  if (loading || sliders.length === 0) return null;

  const slider = sliders[current];

  return (
    <section className="relative overflow-hidden bg-slate-900">
      <div className="absolute inset-0">
        <img
          src={slider.image_url}
          alt={slider.headline}
          className="h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-slate-900/40" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="max-w-2xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white">
            {slider.headline}
          </h1>
          {slider.link_url && (
            <a
              href={slider.link_url}
              className="mt-8 inline-flex items-center justify-center rounded-lg bg-red-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-red-700 transition-colors"
            >
              Shop Now
              <span className="material-symbols-outlined ml-2 text-[18px]">
                arrow_forward
              </span>
            </a>
          )}
        </div>
      </div>

      {sliders.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {sliders.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrent(idx)}
              className={`h-2 rounded-full transition-all ${idx === current ? 'w-8 bg-red-600' : 'w-2 bg-white/50 hover:bg-white/80'}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {sliders.length > 1 && (
        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2">
          <button
            onClick={() => setCurrent((prev) => (prev - 1 + sliders.length) % sliders.length)}
            className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label="Previous slide"
          >
            <span className="material-symbols-outlined text-[24px]">chevron_left</span>
          </button>
          <button
            onClick={() => setCurrent((prev) => (prev + 1) % sliders.length)}
            className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label="Next slide"
          >
            <span className="material-symbols-outlined text-[24px]">chevron_right</span>
          </button>
        </div>
      )}
    </section>
  );
}
