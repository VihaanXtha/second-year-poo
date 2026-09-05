"use client";

import { useState } from "react";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-slate-900 mb-6">Contact Us</h1>
        <p className="text-lg text-slate-600 mb-8">Have a question? Fill out the form below and our team will get back to you.</p>
        {sent ? (
          <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-sm text-green-800">Thank you! We will get back to you shortly.</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input required placeholder="Name" className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:border-red-500" />
              <input required type="email" placeholder="Email" className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:border-red-500" />
            </div>
            <input required placeholder="Subject" className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:border-red-500" />
            <textarea required rows={5} placeholder="Message" className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:border-red-500" />
            <button type="submit" className="rounded-lg bg-black px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">Send Message</button>
          </form>
        )}
      </div>
    </main>
  );
}
