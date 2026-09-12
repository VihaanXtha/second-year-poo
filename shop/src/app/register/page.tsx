"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { NepalAddressPicker, AddressValue } from "@/components/NepalAddressPicker";
import Link from "next/link";

type Step = 1 | 2 | 3 | 4;
type Channel = "email" | "phone";

export default function RegisterPage() {
  const [step, setStep] = useState<Step>(1);
  const [channel, setChannel] = useState<Channel>("email");
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [address, setAddress] = useState<AddressValue>({
    country: "Nepal",
    province: "",
    district: "",
    municipality: "",
    ward: "",
    postal_code: "",
  });
  const [phone, setPhone] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const router = useRouter();
  const { signup, isAuthenticated, verifyEmailOtp, sendPhoneOtp, verifyPhoneOtp, resendOtp } = useAuth();

  const [registeredUser, setRegisteredUser] = useState<{ id: number; channel: string } | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/account");
    }
  }, [isAuthenticated, router]);

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!identifier.trim()) {
      setError(channel === "email" ? "Email is required" : "Phone number is required");
      return;
    }

    setLoading(true);
    try {
      const result = await signup(name, identifier, password, channel, address);
      setRegisteredUser({ id: result.user.id, channel: result.channel });
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await verifyEmailOtp(identifier, otp);
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSendPhoneOtp = async () => {
    if (!phone.trim()) {
      setError("Phone number is required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await sendPhoneOtp(registeredUser!.id, phone);
      setStep(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await verifyPhoneOtp(registeredUser!.id, phoneOtp);
      router.push("/account");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const resendEmailOtp = async () => {
    setResendLoading(true);
    setError("");
    try {
      await resendOtp(identifier, "email_verification");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] flex-1 items-center justify-center bg-slate-50 px-4 py-16">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">Create your account</h1>
          <p className="mt-2 text-slate-600">Join Circuit Bazaar to shop Nepal&apos;s hardware marketplace</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Step 1: Account details + address */}
          {step === 1 && (
            <form onSubmit={handleStep1} className="space-y-5">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-red-500 focus:outline-none"
                  placeholder="Ram Prasad Sharma"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Sign-up method</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setChannel("email")}
                    className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
                      channel === "email"
                        ? "border-red-500 bg-red-50 text-red-700"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setChannel("phone")}
                    className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
                      channel === "phone"
                        ? "border-red-500 bg-red-50 text-red-700"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Phone
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  {channel === "email" ? "Email" : "Phone Number"}
                </label>
                <input
                  type={channel === "email" ? "email" : "tel"}
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-red-500 focus:outline-none"
                  placeholder={channel === "email" ? "you@example.com" : "9841234567"}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Confirm Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">Delivery Address (Nepal)</label>
                <NepalAddressPicker value={address} onChange={setAddress} />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>
          )}

          {/* Step 2: OTP verification (email or phone depending on channel) */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Verify your {channel === "email" ? "email" : "phone"}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  We sent a 6-digit code to <span className="font-medium">{identifier}</span>. It expires in 10
                  minutes.
                </p>
              </div>

              <form onSubmit={handleEmailVerify} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Enter OTP</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-center text-sm tracking-widest focus:border-red-500 focus:outline-none"
                    placeholder="000000"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Verify"}
                </button>
              </form>

              <button
                type="button"
                onClick={resendEmailOtp}
                disabled={resendLoading}
                className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
              >
                {resendLoading ? "Sending..." : "Resend OTP"}
              </button>
            </div>
          )}

          {/* Step 3: Phone number entry — mandatory verification regardless of channel */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Add your phone number</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Phone verification is required to complete registration, regardless of how you signed up.
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-red-500 focus:outline-none"
                  placeholder="9841234567"
                />
              </div>

              <button
                type="button"
                onClick={handleSendPhoneOtp}
                disabled={loading}
                className="w-full rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </div>
          )}

          {/* Step 4: Phone OTP verification */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Verify your phone</h2>
                <p className="mt-1 text-sm text-slate-600">
                  We sent a 6-digit code to <span className="font-medium">{phone}</span>
                </p>
              </div>

              <form onSubmit={handlePhoneVerify} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Enter OTP</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={phoneOtp}
                    onChange={(e) => setPhoneOtp(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-center text-sm tracking-widest focus:border-red-500 focus:outline-none"
                    placeholder="000000"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Verify Phone"}
                </button>
              </form>
            </div>
          )}

          <div className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-red-600 hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

