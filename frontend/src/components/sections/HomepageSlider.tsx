'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import type { HomepageSlider } from '@/lib/api';

const HERO_VIDEO = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260815_034306_165449ef-7d2e-4e81-850f-1939c5cb442d.mp4';

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

  if (loading) {
    return (
      <section className="relative min-h-screen lg:h-[825px] overflow-hidden bg-black">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src={HERO_VIDEO} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-20 mx-auto max-w-[1320px] px-6 py-20 lg:py-[160px] flex flex-col items-center text-center gap-10">
          <div className="space-y-5">
            <div className="h-12 w-3/4 mx-auto rounded-full bg-white/20" />
            <div className="h-6 w-1/2 mx-auto rounded-full bg-white/20" />
          </div>
        </div>
      </section>
    );
  }

  if (sliders.length === 0) {
    return (
      <section className="relative min-h-screen lg:h-[825px] overflow-hidden bg-black">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src={HERO_VIDEO} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-20 mx-auto max-w-[1320px] px-6 py-20 lg:py-[160px] flex flex-col items-center text-center gap-10">
          <div className="space-y-5">
            <h1 className="text-white text-4xl md:text-5xl lg:text-[80px] leading-[1.1] lg:leading-[1] font-medium tracking-[-0.03em]">
              Circuit Bazaar
            </h1>
            <p className="text-white/90 text-base md:text-lg font-medium leading-relaxed tracking-tight max-w-[500px] mx-auto">
              Nepal&apos;s specification-first hardware marketplace.
            </p>
          </div>
          <Link
            href="/shop"
            className="group flex items-center justify-center gap-6 bg-white rounded-full px-6 py-4 w-full md:w-auto min-w-[243px] hover:scale-105 transition-transform duration-300"
          >
            <div className="w-2 h-2 rounded-full bg-black" />
            <span className="text-black text-base font-semibold tracking-tight">Shop Verified Hardware</span>
            <div className="w-2 h-2 rounded-full bg-black" />
          </Link>
        </div>
      </section>
    );
  }

  const slider = sliders[current];

  return (
    <section className="relative min-h-screen lg:h-[825px] overflow-hidden bg-black">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src={HERO_VIDEO} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-20 mx-auto max-w-[1320px] px-6 py-20 lg:py-[160px] flex flex-col items-center text-center gap-10">
        <div className="space-y-5">
          <h1 className="text-white text-4xl md:text-5xl lg:text-[80px] leading-[1.1] lg:leading-[1] font-medium tracking-[-0.03em]">
            {slider.headline}
          </h1>
          {slider.subtitle && (
            <p className="text-white/90 text-base md:text-lg font-medium leading-relaxed tracking-tight max-w-[500px] mx-auto">
              {slider.subtitle}
            </p>
          )}
        </div>
        {slider.link_url && (
          <a
            href={slider.link_url}
            className="group flex items-center justify-center gap-6 bg-white rounded-full px-6 py-4 w-full md:w-auto min-w-[243px] hover:scale-105 transition-transform duration-300"
          >
            <div className="w-2 h-2 rounded-full bg-black" />
            <span className="text-black text-base font-semibold tracking-tight">Shop Now</span>
            <div className="w-2 h-2 rounded-full bg-black" />
          </a>
        )}
      </div>

      {sliders.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          {sliders.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrent(idx)}
              className={`h-2 rounded-full transition-all ${idx === current ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}