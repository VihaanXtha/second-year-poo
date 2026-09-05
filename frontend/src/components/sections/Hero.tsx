"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";

const SHOP_URL = process.env.NEXT_PUBLIC_SHOP_URL || 'https://shop.localhost';

function CircuitTraces() {
  const shared =
    "fill-none stroke-linecap-round stroke-linejoin-round";

  return (
    <div className="relative h-[540px] w-full">
      <svg
        viewBox="0 0 520 540"
        className="h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="copper" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b87333" />
          </linearGradient>
          <linearGradient id="teal" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2dd4bf" />
            <stop offset="100%" stopColor="#0f766e" />
          </linearGradient>
          <linearGradient id="violet" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#6d28d9" />
          </linearGradient>
        </defs>

        {/* base board */}
        <rect x="40" y="40" width="440" height="460" rx="24" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1.5" />

        {/* layer 1 - copper traces */}
        <g className={shared} stroke="url(#copper)" strokeWidth="3" opacity="0.9">
          <path d="M 100 120 L 180 120 L 220 80 L 300 80 L 340 120 L 420 120" />
          <path d="M 120 200 L 200 200 L 240 160 L 320 160 L 360 200 L 440 200" />
          <path d="M 80 280 L 160 280 L 200 240 L 280 240 L 320 280 L 400 280" />
          <path d="M 140 360 L 220 360 L 260 320 L 340 320 L 380 360 L 460 360" />
          <path d="M 100 440 L 180 440 L 220 400 L 300 400 L 340 440 L 420 440" />
        </g>

        {/* layer 2 - teal traces */}
        <g className={shared} stroke="url(#teal)" strokeWidth="2.5" opacity="0.85">
          <path d="M 120 160 L 160 160 L 200 120 L 260 120 L 300 160 L 360 160" />
          <path d="M 160 240 L 200 240 L 240 200 L 300 200 L 340 240 L 400 240" />
          <path d="M 100 320 L 140 320 L 180 280 L 240 280 L 280 320 L 340 320" />
          <path d="M 180 400 L 220 400 L 260 360 L 320 360 L 360 400 L 420 400" />
        </g>

        {/* layer 3 - violet traces */}
        <g className={shared} stroke="url(#violet)" strokeWidth="2" opacity="0.8">
          <path d="M 140 200 L 180 200 L 220 160 L 280 160 L 320 200 L 380 200" />
          <path d="M 120 280 L 160 280 L 200 240 L 260 240 L 300 280 L 360 280" />
          <path d="M 160 360 L 200 360 L 240 320 L 300 320 L 340 360 L 400 360" />
          <path d="M 140 440 L 180 440 L 220 400 L 280 400 L 320 440 L 380 440" />
        </g>

        {/* pads / nodes */}
        {[
          { cx: 100, cy: 120, r: 6 },
          { cx: 420, cy: 120, r: 6 },
          { cx: 120, cy: 200, r: 6 },
          { cx: 440, cy: 200, r: 6 },
          { cx: 80, cy: 280, r: 6 },
          { cx: 400, cy: 280, r: 6 },
          { cx: 140, cy: 360, r: 6 },
          { cx: 460, cy: 360, r: 6 },
          { cx: 100, cy: 440, r: 6 },
          { cx: 420, cy: 440, r: 6 },
        ].map((pad, i) => (
          <circle key={i} cx={pad.cx} cy={pad.cy} r={pad.r} fill="#0f172a" opacity="0.85" />
        ))}
      </svg>
    </div>
  );
}

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: false, margin: "-20%" });
  const { scrollY } = useScroll();
  const yBg = useTransform(scrollY, [0, 600], [0, -60]);
  const yContent = useTransform(scrollY, [0, 600], [0, 30]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0.25]);

  return (
    <section ref={containerRef} className="relative overflow-hidden bg-white">
      <motion.div
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_20%,rgba(220,38,38,0.06)_0%,transparent_40%),radial-gradient(circle_at_70%_80%,rgba(2,6,23,0.04)_0%,transparent_40%)]"
        style={{ y: yBg }}
      />

      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="hero-gradient-orb hero-orb-anim absolute -top-24 -left-24 h-72 w-72 bg-red-200/60" />
        <div className="hero-gradient-orb hero-orb-anim-2 absolute top-32 right-0 h-80 w-80 bg-teal-200/50" />
        <div className="hero-gradient-orb hero-orb-anim-3 absolute bottom-0 left-1/3 h-64 w-64 bg-violet-200/50" />
      </div>
      <motion.div
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28"
        style={{ opacity, y: yContent }}
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
              <span className="text-gradient-red">Buy with trust.</span>
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
                href={SHOP_URL}
                className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
              >
                Shop Verified Hardware
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
            className="relative hidden lg:block"
            style={{ y: yContent }}
          >
            <motion.div
              className="rounded-3xl bg-white ring-1 ring-slate-200 shadow-sm overflow-hidden"
              initial={{ scale: 0.96, opacity: 0 }}
              animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0.96, opacity: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <CircuitTraces />
            </motion.div>

            <motion.div
              className="absolute -bottom-6 -left-6 rounded-2xl bg-white p-4 shadow-lg ring-1 ring-slate-200"
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                  <span className="material-symbols-outlined text-green-600 text-[24px]">verified</span>
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
                  <span className="material-symbols-outlined text-red-600 text-[24px]">local_shipping</span>
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
