"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: false, margin: "-20%" });
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 600], [0, -80]);
  const y2 = useTransform(scrollY, [0, 600], [0, 40]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0.3]);

  return (
    <section ref={containerRef} className="relative overflow-hidden bg-white">
      <motion.div
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_20%,rgba(220,38,38,0.06)_0%,transparent_40%),radial-gradient(circle_at_70%_80%,rgba(2,6,23,0.04)_0%,transparent_40%)]"
        style={{ y: y1 }}
      />
      <motion.div
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28"
        style={{ opacity, y: y2 }}
      >
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            className="max-w-2xl"
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <motion.span
              className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-600 ring-1 ring-red-600/20"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.92 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              Nepal&apos;s Verified Hardware Marketplace
            </motion.span>
            <motion.h1
              className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900"
              initial={{ opacity: 0, y: 18 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
              transition={{ delay: 0.2, duration: 0.7 }}
            >
              Build with confidence.
              <br />
              <span className="text-red-600">Buy with trust.</span>
            </motion.h1>
            <motion.p
              className="mt-6 text-lg text-slate-600 leading-relaxed"
              initial={{ opacity: 0, y: 18 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
              transition={{ delay: 0.35, duration: 0.7 }}
            >
              Circuit Bazaar is Nepal&apos;s specification-first hardware marketplace.
              Every component, module, and laptop is listed by verified vendors with
              full warranty transparency — so you never have to guess if you&apos;re
              getting the real deal.
            </motion.p>
            <motion.div
              className="mt-10 flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 18 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
              transition={{ delay: 0.5, duration: 0.7 }}
            >
              <Link
                href="#featured"
                className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
              >
                Explore Verified Hardware
                <span className="material-symbols-outlined ml-2 text-[18px]">
                  arrow_forward
                </span>
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-base font-semibold text-slate-900 ring-1 ring-slate-300 hover:bg-slate-50 transition-colors"
              >
                How It Works
              </Link>
            </motion.div>
            <motion.div
              className="mt-10 flex items-center gap-6 text-sm text-slate-500"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.7, duration: 0.7 }}
            >
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-8 w-8 rounded-full border-2 border-white bg-slate-200"
                  />
                ))}
              </div>
              <div>
                <span className="block text-slate-900 font-semibold">10,000+ builders</span>
                <span>trust Circuit Bazaar across Nepal</span>
              </div>
            </motion.div>
          </motion.div>
          <motion.div
            className="relative lg:h-[540px] hidden lg:block"
            style={{ y: y2 }}
          >
            <motion.div
              className="absolute inset-0 rounded-3xl bg-slate-100 overflow-hidden"
              initial={{ scale: 0.96, opacity: 0 }}
              animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0.96, opacity: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <img
                src="https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=800&q=80"
                alt="Circuit board close-up"
                className="h-full w-full object-cover"
              />
            </motion.div>
            <motion.div
              className="absolute -bottom-6 -left-6 rounded-2xl bg-white p-4 shadow-lg ring-1 ring-slate-200"
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                  <span className="material-symbols-outlined text-green-600 text-[24px]">
                    verified
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Verified Vendor</p>
                  <p className="text-xs text-slate-500">Official warranty included</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              className="absolute -top-4 -right-4 rounded-2xl bg-white p-4 shadow-lg ring-1 ring-slate-200"
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
                  <span className="material-symbols-outlined text-red-600 text-[24px]">
                    local_shipping
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Fast Delivery</p>
                  <p className="text-xs text-slate-500">Across Nepal</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
