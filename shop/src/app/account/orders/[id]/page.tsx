import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Not Found | Circuit Bazaar",
};

export default function OrderDetailPage() {
  return (
    <main className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Order not found</h1>
        <a href="/account/orders" className="text-red-700 hover:underline">Back to orders</a>
      </div>
    </main>
  );
}
