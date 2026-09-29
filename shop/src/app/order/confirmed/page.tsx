import { Suspense } from "react";
import OrderConfirmedClient from "./OrderConfirmedClient";

export const metadata = { title: "Order Placed" };

export default function OrderConfirmedPage() {
  // OrderConfirmedClient reads `?order=` / `?payment=` via useSearchParams.
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center bg-slate-50">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
        </div>
      }
    >
      <OrderConfirmedClient />
    </Suspense>
  );
}