import { Suspense } from "react";
import AccountClient from "./AccountClient";

export const metadata = { title: "My Account" };

export default function AccountPage() {
  // AccountClient reads `?verified=` via useSearchParams, which needs a
  // Suspense boundary to keep static prerendering happy (same as /login).
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center bg-slate-50">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
        </div>
      }
    >
      <AccountClient />
    </Suspense>
  );
}
