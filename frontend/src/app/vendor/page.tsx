"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { NepalAddressPicker, AddressValue } from "@/components/NepalAddressPicker";

type Step = "apply" | "verify" | "success";

export default function VendorApplyPage() {
  const [step, setStep] = useState<Step>("apply");
  const [form, setForm] = useState({
    store_name: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    full_name: "",
    experience: "",
    website: "",
    pan_number: "",
    country: "Nepal",
    province: "",
    district: "",
    municipality: "",
    ward: "",
    postal_code: "",
  });
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (step === "verify") {
      handleResendOtp();
    }
  }, [step]);

  const handleAddressChange = (value: AddressValue) => {
    setForm({
      ...form,
      country: value.country,
      province: value.province,
      district: value.district,
      municipality: value.municipality,
      ward: value.ward,
      postal_code: value.postal_code,
      address: `${value.municipality}, ${value.district}, ${value.province}, ${value.country}`,
    });
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiClient<{ application_id: number }>('/vendor/apply', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setStep("verify");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Application failed";
      if (message.includes('already pending verification')) {
        setStep("verify");
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiClient('/vendor/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email: form.email, code: otp }),
      });
      setStep("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setLoading(true);
    try {
      await apiClient('/vendor/resend-otp', {
        method: 'POST',
        body: JSON.stringify({ email: form.email }),
      });
      setMessage("OTP resent. Please check your email.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Become a Verified Vendor</h1>
          <p className="text-slate-600">
            Apply to list your hardware store on Circuit Bazaar. Verified vendors get higher visibility, trust badges, and direct customer access.
          </p>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 mb-8">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {message && step !== "success" && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 mb-8">
            <p className="text-sm text-emerald-700">{message}</p>
          </div>
        )}

        {step === "apply" && (
          <form onSubmit={handleApply} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Store Name</label>
              <input
                type="text"
                required
                value={form.store_name}
                onChange={(e) => setForm({ ...form, store_name: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Store Description</label>
              <textarea
                required
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Website / Social</label>
                <input
                  type="url"
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">PAN Number <span className="text-red-600">*</span></label>
              <input
                type="text"
                required
                value={form.pan_number}
                onChange={(e) => setForm({ ...form, pan_number: e.target.value.toUpperCase() })}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:border-red-500"
                placeholder="e.g. ABC123456"
                maxLength={10}
              />
              <p className="mt-1 text-xs text-slate-500">Format: 3 letters followed by 7 digits (e.g. ABC123456) or 8-10 digit numeric PAN</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Store Address</label>
              <NepalAddressPicker
                value={{
                  country: form.country,
                  province: form.province,
                  district: form.district,
                  municipality: form.municipality,
                  ward: form.ward,
                  postal_code: form.postal_code,
                }}
                onChange={handleAddressChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Years of Experience in Hardware Retail</label>
              <input
                type="text"
                required
                value={form.experience}
                onChange={(e) => setForm({ ...form, experience: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:border-red-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-red-700 px-4 py-3 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Submitting Application..." : "Submit Vendor Application"}
            </button>
          </form>
        )}

        {step === "verify" && (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Verify your email</h3>
              <p className="text-sm text-slate-600 mb-4">
                We have sent a 6-digit OTP to <span className="font-semibold">{form.email}</span>. The code is valid for 2 minutes.
              </p>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">OTP Code</label>
                <input
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:border-red-500"
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-sm font-medium text-red-700 hover:text-red-800 disabled:opacity-50"
                >
                  Resend OTP
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-red-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
              </div>
            </div>
          </form>
        )}

        {step === "success" && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
              <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Application Submitted Successfully</h3>
            <p className="text-sm text-slate-600 mb-4">
              Thank you for applying to become a Circuit Bazaar vendor. Our team will review your application and verify your details.
            </p>
            <p className="text-sm text-slate-600">
              You will receive your vendor portal login credentials at <span className="font-semibold">{form.email}</span> within <span className="font-semibold">72 hours</span>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
