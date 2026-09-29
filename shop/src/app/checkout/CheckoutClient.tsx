"use client";

import { useEffect, useState, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Banknote, CreditCard, Smartphone, Wallet } from "lucide-react";
import { useAuth, isFullyVerified } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import {
  formatPrice,
  createOrder,
  initiatePayment,
  type CreateOrderPayload,
  type PaymentInitiateData,
} from "@/lib/api";

type Method = CreateOrderPayload["payment_method"];

const METHODS: { id: Method; label: string; blurb: string }[] = [
  { id: "cod", label: "Cash on Delivery", blurb: "Pay in cash when your order arrives." },
  { id: "esewa", label: "eSewa", blurb: "Pay from your eSewa wallet — opens the eSewa portal (sandbox)." },
  { id: "khalti", label: "Khalti", blurb: "Pay from your Khalti wallet — opens the Khalti portal (sandbox)." },
  { id: "stripe", label: "Card (Stripe)", blurb: "Visa / Mastercard via the Stripe payment page." },
];

const METHOD_ICONS: Record<Method, ComponentType<{ size?: number }>> = {
  cod: Banknote,
  esewa: Wallet,
  khalti: Smartphone,
  stripe: CreditCard,
};

export default function CheckoutClient() {
  const router = useRouter();
  const { user, isAuthenticated, updateProfile } = useAuth();
  const verified = isFullyVerified(user);
  const { items, loading, subtotal, clearCart } = useCart();

  // List-price totals so the summary can show what the customer saved.
  const listSubtotal = items.reduce((sum, it) => sum + (it.originalPrice ?? it.price) * it.quantity, 0);
  const discountTotal = Math.round((listSubtotal - subtotal) * 100) / 100;

  // Delivery fields are derived from the account profile during render.
  // Each draft holds the user's edits (undefined = untouched, so fall back to
  // the profile). This prefills the form once the profile hydrates without
  // calling setState inside an effect (which causes cascading renders).
  const [phoneDraft, setPhone] = useState<string | undefined>(undefined);
  const [addressDraft, setAddress] = useState<string | undefined>(undefined);
  const [cityDraft, setCity] = useState<string | undefined>(undefined);
  const [saveToProfile, setSaveToProfile] = useState(true);
  const [method, setMethod] = useState<Method>("cod");
  const [placing, setPlacing] = useState(false);
  // Set once an order exists so the empty-cart redirect doesn't fire while we
  // navigate away to a gateway (or to the confirmation page).
  const [placed, setPlaced] = useState(false);
  const [error, setError] = useState("");

  const profilePhone = user?.phone ?? "";
  const profileCity = user?.city ?? user?.district ?? "";
  const profileAddress =
    user?.address ??
    [user?.ward ? `Ward ${user.ward}` : "", user?.municipality ?? "", user?.district ?? ""]
      .filter(Boolean)
      .join(", ");

  const phone = phoneDraft ?? profilePhone;
  const address = addressDraft ?? profileAddress;
  const city = cityDraft ?? profileCity;

  // Guard: signed out -> login; signed in with an empty cart -> back to /cart.
  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace("/login?redirect=/checkout");
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (!loading && isAuthenticated && !placing && !placed && items.length === 0) {
      router.replace("/cart");
    }
  }, [loading, isAuthenticated, placing, placed, items.length, router]);

  /** Auto-POST the eSewa payment form — the gateway requires a real form submit. */
  function submitEsewaForm(data: PaymentInitiateData) {
    const form = document.createElement("form");
    form.method = (data.method as string) || "POST";
    form.action = data.action || "";
    form.target = "_self";
    for (const [key, value] of Object.entries(data.fields ?? {})) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = String(value);
      form.appendChild(input);
    }
    document.body.appendChild(form);
    form.submit();
  }

  async function placeOrder() {
    setError("");
    const addr = address.trim();
    const ph = phone.trim();
    const ct = city.trim();
    if (!ph || !addr || !ct) {
      setError("Please fill in your delivery phone, address and city.");
      return;
    }

    setPlacing(true);
    try {
      if (saveToProfile) {
        // Best-effort — a failed profile save must never block checkout.
        updateProfile({ phone: ph, address: addr, city: ct }).catch(() => {});
      }

      const { order } = await createOrder({
        items: items.map((it) => ({ product_id: it.productId, quantity: it.quantity })),
        shipping_address: addr,
        shipping_city: ct,
        shipping_phone: ph,
        payment_method: method,
      });
      setPlaced(true);

      if (method === "cod") {
        // No gateway — the order is placed; clear the cart and confirm.
        await clearCart();
        router.push(`/order/confirmed?order=${order.id}`);
        return;
      }

      const { data } = await initiatePayment(order.id, method);
      if (method === "esewa") {
        if (!data.action || !data.fields) throw new Error("eSewa did not return a payment form.");
        submitEsewaForm(data);
        return;
      }
      if (data.url) {
        router.push(data.url);
        return;
      }
      throw new Error("The payment gateway did not return a payment URL.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not place your order.");
      setPlacing(false);
      setPlaced(false);
    }
  }
  // ----- guards (all hooks above) -----
  if (!isAuthenticated || !user) {
    return (
      <div className="flex flex-1 items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
      </div>
    );
  }

  if (!verified) {
    return (
      <div className="flex min-h-[60vh] flex-1 items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">Verification required</h1>
          <p className="mt-2 text-sm text-slate-600">
            Please verify your email and phone before checking out.
          </p>
          <Link
            href="/account"
            className="mt-6 inline-block rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
          >
            Go to My Account
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0 && !placing && !placed) {
    return (
      <div className="flex flex-1 items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Checkout</h1>
        <p className="mt-1 text-sm text-slate-500">Review your items, delivery details and payment method.</p>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Delivery address */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-bold text-slate-900">Delivery Address</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="co-phone" className="mb-1 block text-sm font-medium text-slate-700">
                  Phone number
                </label>
                <input
                  id="co-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={placing}
                  placeholder="9841234567"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-red-500 focus:outline-none disabled:bg-slate-100"
                />
              </div>
              <div>
                <label htmlFor="co-city" className="mb-1 block text-sm font-medium text-slate-700">
                  City / District
                </label>
                <input
                  id="co-city"
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={placing}
                  placeholder="Kathmandu"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-red-500 focus:outline-none disabled:bg-slate-100"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="co-address" className="mb-1 block text-sm font-medium text-slate-700">
                  Street address
                </label>
                <textarea
                  id="co-address"
                  required
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={placing}
                  placeholder="Ward, tole, house number..."
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-red-500 focus:outline-none disabled:bg-slate-100"
                />
              </div>
            </div>
            <label className="mt-3 flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={saveToProfile}
                onChange={(e) => setSaveToProfile(e.target.checked)}
                disabled={placing}
                className="accent-red-600"
              />
              Save these details to my account for next time
            </label>
          </section>          {/* Payment method */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-bold text-slate-900">Payment Method</h2>
            <div className="mt-4 space-y-3">
              {METHODS.map((m) => {
                const Icon = METHOD_ICONS[m.id];
                const selected = method === m.id;
                return (
                  <label
                    key={m.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                      selected
                        ? "border-red-500 bg-red-50/40 ring-1 ring-red-500"
                        : "border-slate-200 hover:border-slate-300"
                    } ${placing ? "pointer-events-none opacity-60" : ""}`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value={m.id}
                      checked={selected}
                      onChange={() => setMethod(m.id)}
                      disabled={placing}
                      className="mt-1 accent-red-600"
                    />
                    <span className="flex-1">
                      <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                        <Icon size={16} />
                        {m.label}
                      </span>
                      <span className="mt-0.5 block text-xs text-slate-500">{m.blurb}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </section>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-40 rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-bold text-slate-900">Order Summary</h2>

            <div className="mt-4 space-y-3 border-b border-slate-100 pb-4">
              {items.map((it) => (
                <div key={it.productId} className="flex items-center gap-3">
                  <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-slate-50">
                    {it.image ? (
                      <Image src={it.image} alt={it.name} fill sizes="48px" className="object-contain" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{it.name}</p>
                    <p className="text-xs text-slate-500">Qty {it.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-bold text-slate-900">
                      {formatPrice(it.price * it.quantity)}
                    </p>
                    {(it.originalPrice ?? it.price) > it.price && (
                      <p className="font-mono text-xs text-slate-400 line-through">
                        {formatPrice((it.originalPrice ?? it.price) * it.quantity)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <dl className="mt-4 space-y-3 border-b border-slate-100 pb-4">
              <div className="flex justify-between text-sm text-slate-600">
                <dt>Subtotal</dt>
                <dd className="font-mono">{formatPrice(listSubtotal)}</dd>
              </div>
              {discountTotal > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <dt>Discount</dt>
                  <dd className="font-mono">&minus;{formatPrice(discountTotal)}</dd>
                </div>
              )}
              <div className="flex justify-between text-sm text-slate-600">
                <dt>Shipping</dt>
                <dd className="font-medium text-green-600">Free</dd>
              </div>
            </dl>

            <div className="mt-4 flex justify-between text-base font-bold text-slate-900">
              <span>Total</span>
              <span className="font-mono">{formatPrice(subtotal)}</span>
            </div>

            <button
              onClick={placeOrder}
              disabled={placing}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
            >
              {placing
                ? "Processing..."
                : method === "cod"
                  ? "Place Order"
                  : method === "esewa"
                    ? "Pay with eSewa"
                    : method === "khalti"
                      ? "Pay with Khalti"
                      : "Pay with Card"}
            </button>

            <p className="mt-3 text-center text-xs text-slate-500">
              {method === "cod"
                ? "You will pay in cash when your order is delivered."
                : method === "esewa"
                  ? "You will be redirected to the eSewa payment portal."
                  : method === "khalti"
                    ? "You will be redirected to Khalti's secure payment page."
                    : "You will be redirected to Stripe's secure payment page."}
            </p>

            <Link
              href="/cart"
              className="mt-3 block text-center text-sm font-medium text-slate-500 transition-colors hover:text-red-600"
            >
              Back to Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}