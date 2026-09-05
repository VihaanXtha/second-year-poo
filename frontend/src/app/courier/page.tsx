export const dynamic = 'force-dynamic';

import { Metadata } from "next";
import { apiClient, CourierInfo } from "@/lib/api";

export const metadata: Metadata = {
  title: "Courier & Delivery | Circuit Bazaar",
  description: "Shipping and delivery information for Circuit Bazaar orders across Nepal.",
};

export default async function CourierPage() {
  let courier: CourierInfo | null = null;
  try {
    const data = await apiClient<{ courier: CourierInfo }>('/courier');
    courier = data.courier || null;
  } catch (e) {
    console.error('Failed to load courier info', e);
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Courier & Delivery</h1>
          <p className="text-lg text-slate-600">
            Fast, reliable delivery across Nepal. We partner with trusted courier services to get your hardware to you safely.
          </p>
        </div>

        {courier ? (
          <div className="space-y-8">
            <div className="bg-white border border-slate-200 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">{courier.title}</h2>
              <div className="text-slate-600 leading-relaxed whitespace-pre-wrap">{courier.body}</div>
            </div>

            {courier.delivery_zones && courier.delivery_zones.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-8">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Delivery Zones</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {courier.delivery_zones.map((zone, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="material-symbols-outlined text-green-600 text-[24px]">local_shipping</span>
                      <span className="text-sm font-medium text-slate-700">{zone}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
            <p className="text-slate-500">Delivery information coming soon. Contact us for shipping details.</p>
          </div>
        )}
      </div>
    </div>
  );
}
