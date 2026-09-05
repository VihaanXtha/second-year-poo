"use client";

import { useState } from "react";

export default function PasswordPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Password</h1>
        <form className="max-w-md space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
            <input type="password" required className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:border-red-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
            <input type="password" required className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:border-red-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
            <input type="password" required className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:border-red-500" />
          </div>
          <button type="submit" className="rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">Update Password</button>
        </form>
      </div>
    </main>
  );
}
