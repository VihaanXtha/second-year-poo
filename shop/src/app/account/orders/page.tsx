"use client";

import { useState } from "react";

export default function OrdersPage() {
  const [orders] = useState([]);

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Orders</h1>
        {orders.length === 0 ? (
          <p className="text-sm text-slate-500">No orders yet.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order: any) => (
              <div key={order.id} className="rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Order #{order.orderNumber}</p>
                    <p className="text-xs text-slate-500">{order.date}</p>
                  </div>
                  <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">{order.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
