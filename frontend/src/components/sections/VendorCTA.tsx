"use client";

import { useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://backendcircuit-production.up.railway.app/api";

export default function VendorCTA() {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        alert("Thanks for subscribing!");
        setEmail("");
      }
    } catch {
      // silently fail in preview
    }
  };

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-8 py-16 sm:px-16 sm:py-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(220,38,38,0.15)_0%,transparent_50%)]" />
          <div className="relative mx-auto max-w-2xl text-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Own a hardware business in Nepal?
            </h2>
            <p className="mt-4 text-lg text-slate-300">
              Join 50+ verified vendors on Circuit Bazaar and reach thousands of
              serious buyers. We handle listing, specs, and customer trust — you
              handle great products.
            </p>
            <form
              onSubmit={handleSubmit}
              className="mt-8 flex flex-col sm:flex-row gap-3"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="flex-1 rounded-lg bg-white/10 px-4 py-3 text-white placeholder-slate-400 ring-1 ring-white/20 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <button
                type="submit"
                className="rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold text-white hover:bg-red-500 transition-colors"
              >
                Apply to Become a Vendor
              </button>
            </form>
            <p className="mt-4 text-xs text-slate-400">
              No upfront fees. We only succeed when you do.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
