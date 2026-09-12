"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { NepalAddressPicker, AddressValue } from "@/components/NepalAddressPicker";
import Link from "next/link";

type Step = 1 | 2 | 3 | 4;
type Channel = 'email' | 'phone';

function RegisterForm() {
  const [step, setStep] = useState<Step>(1);
  const [channel, setChannel] = useState<Channel>('email');
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
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const { signup, isAuthenticated, verifyEmailOtp, sendPhoneOtp, verifyPhoneOtp, resendOtp, googleLogin } = useAuth();

  const [registeredUser, setRegisteredUser] = useState<{ id: number; channel: string } | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      const shopUrl = process.env.NEXT_PUBLIC_SHOP_URL || 'http://localhost:3003';
      window.location.href = `${shopUrl}/account`;
    }
  }, [isAuthenticated]);

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!identifier.trim()) {
      setError(channel === 'email' ? "Email is required" : "Phone number is required");
      return;
    }

    setLoading(true);
    try {
      const result = await signup(name, identifier, password, channel);
      setRegisteredUser({ id: result.user.id, channel: result.channel });
      
      if (result.channel === 'email') {
        setStep(2);
      } else {
        setStep(2);
      }
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
      if (channel === 'email') {
        setStep(3);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
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
      const shopUrl = process.env.NEXT_PUBLIC_SHOP_URL || 'http://localhost:3003';
      window.location.href = `${shopUrl}/account`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (channel === 'phone') {
      setStep(4);
    } else {
      setStep(4);
    }
  };

  const handleResendOtp = async (type: 'email_verification' | 'phone_verification') => {
    setResendLoading(true);
    setError("");
    try {
      await resendOtp(identifier, type);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError("");
    try {
      await googleLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-up failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Create an account</h1>
          <p className="text-slate-600">Join Circuit Bazaar to start shopping</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {step === 1 && (
            <>
              <button
                type="button"
                onClick={handleGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-slate-500">Or continue with</span>
                </div>
              </div>

              <div className="flex gap-2 mb-6">
                <button
                  type="button"
                  onClick={() => setChannel('email')}
                  className={`flex-1 rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
                    channel === 'email'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => setChannel('phone')}
                  className={`flex-1 rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
                    channel === 'phone'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Phone
                </button>
              </div>

              <form onSubmit={handleStep1} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {channel === 'email' ? 'Email' : 'Phone Number'}
                  </label>
                  <input
                    type={channel === 'email' ? 'email' : 'tel'}
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:border-red-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-red-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Creating account..." : "Continue"}
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Verify your {channel === 'email' ? 'email' : 'phone'}</h2>
                <p className="text-sm text-slate-600">
                  We sent a 6-digit OTP to {channel === 'email' ? identifier : registeredUser?.id}
                </p>
              </div>

              <form onSubmit={channel === 'email' ? handleEmailVerify : handlePhoneVerify} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Enter OTP</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={channel === 'email' ? otp : phoneOtp}
                    onChange={(e) => channel === 'email' ? setOtp(e.target.value) : setPhoneOtp(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:border-red-500 tracking-widest"
                    placeholder="000000"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-red-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Verifying..." : "Verify"}
                </button>
              </form>

              <div className="text-center">
                <button
                  onClick={() => channel === 'email' ? handleResendOtp('email_verification') : handleResendOtp('phone_verification')}
                  disabled={resendLoading}
                  className="text-sm text-red-700 hover:underline disabled:opacity-50"
                >
                  {resendLoading ? "Sending..." : "Resend OTP"}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Your Address</h2>
                <p className="text-sm text-slate-600">Please provide your address in Nepal</p>
              </div>

              <form onSubmit={handleAddressSubmit} className="space-y-4">
                <NepalAddressPicker
                  value={address}
                  onChange={setAddress}
                />

                <button
                  type="submit"
                  className="w-full rounded-xl bg-red-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-800 transition-colors"
                >
                  Continue
                </button>
              </form>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Verify your phone</h2>
                <p className="text-sm text-slate-600">Phone verification is required to complete registration</p>
              </div>

              <form onSubmit={handlePhoneVerify} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:border-red-500"
                    placeholder="9841234567"
                  />
                </div>

                <button
                  type="button"
                  onClick={async () => {
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
                  }}
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Send OTP
                </button>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Enter OTP</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={phoneOtp}
                    onChange={(e) => setPhoneOtp(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:border-red-500 tracking-widest"
                    placeholder="000000"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-red-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Verifying..." : "Verify Phone"}
                </button>
              </form>
            </div>
          )}

          <div className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link href="/login" className="text-red-700 font-medium hover:underline">
              Sign in
            </Link>
          </div>
          <div className="mt-3 text-center text-sm">
            <Link href="/forgot-password" className="text-slate-500 hover:text-slate-700 hover:underline">
              Forgot password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center px-4"><p className="text-slate-500 text-sm">Loading…</p></div>}>
      <RegisterForm />
    </Suspense>
  );
}
