"use client";

import { useState } from "react";

export default function AddressesPage() {
  const [addresses] = useState([]);

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Addresses</h1>
        {addresses.length === 0 ? (
          <p className="text-sm text-slate-500">No addresses saved.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {addresses.map((addr: any) => (
              <div key={addr.id} className="rounded-xl border border-slate-200 p-6">
                <p className="text-sm font-medium text-slate-900">{addr.name}</p>
                <p className="text-sm text-slate-600 mt-1">{addr.address}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
