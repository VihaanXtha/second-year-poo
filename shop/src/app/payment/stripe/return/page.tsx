import { Suspense } from "react";
import StripeReturnClient from "./StripeReturnClient";

export const metadata = { title: "Completing payment" };

export default function StripeReturnPage() {
  // StripeReturnClient reads `?order=` / `?session_id=` via useSearchParams.
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center bg-slate-50">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
        </div>
      }
    >
      <StripeReturnClient />
    </Suspense>
  );
}