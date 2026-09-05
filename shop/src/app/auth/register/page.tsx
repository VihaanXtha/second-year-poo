"use client";

import type React from 'react';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { OtpInput } from '../components/OtpInput';

type Step = 'profile' | 'email_otp' | 'details';

function RegisterFormInner() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('profile');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);

  const validatePassword = (pwd: string) => {
    return pwd.length >= 8 && /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd);
  };

  useEffect(() => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailStatus('idle');
      return;
    }

    const timer = setTimeout(async () => {
      setEmailStatus('checking');
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/check-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        const data = await res.json();

        if (!res.ok) {
          setEmailStatus('idle');
          return;
        }

        setEmailStatus(data.exists ? 'taken' : 'available');
      } catch {
        setEmailStatus('idle');
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [email]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
     setError('');

     if (!firstName.trim() || !lastName.trim()) {
       setError('First name and last name are required.');
       return;
     }

     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
       setError('Please enter a valid email address.');
       return;
     }

     if (emailStatus === 'taken') {
       setError('This email is already registered. Try signing in instead.');
       return;
     }

     if (!validatePassword(password)) {
      setError('Password does not meet requirements.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: `${firstName} ${lastName}`, email, password, password_confirmation: password }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data.errors ? Object.values(data.errors).flat().join(', ') : (data.message || 'Signup failed');
        throw new Error(msg);
      }

      setStep('email_otp');
      setCooldown(30);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/verify-email-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Invalid OTP');
      }

      setStep('details');
      setOtp('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmailOtp = async () => {
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'email_verification' }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to resend OTP');
      }

      setCooldown(30);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/update-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, address, city, postal_code: postalCode, country }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to save details');
      }

      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcf8fa] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg border border-[#c6c6cd] shadow-sm">
          <div className="bg-[#0f172a] text-white p-6">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#38bdf8] text-[24px]">person_add</span>
              <h1 className="font-bold text-lg">Create Account</h1>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {step === 'profile' && 'Step 1 of 3 - Profile Information'}
              {step === 'email_otp' && 'Step 2 of 3 - Verify Email'}
              {step === 'details' && 'Step 3 of 3 - Address & Details'}
            </p>

            <div className="flex gap-1 mt-4">
              {['profile', 'email_otp', 'details'].map((s, i) => (
                <div
                  key={s}
                  className={`h-1 flex-1 rounded transition-colors ${
                    ['profile', 'email_otp', 'details'].indexOf(step) >= i
                      ? 'bg-[#38bdf8]'
                      : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="p-6">
            {error && (
              <div className="bg-[#dc2626]/10 border border-[#dc2626] rounded p-3 text-xs font-mono text-[#dc2626] mb-4">
                {error}
              </div>
            )}

            {step === 'profile' && (
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono font-bold text-[#45464d] mb-1">FIRST NAME</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      placeholder="John"
                      className="w-full border border-[#c6c6cd] rounded px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#000000]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-bold text-[#45464d] mb-1">LAST NAME</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      placeholder="Doe"
                      className="w-full border border-[#c6c6cd] rounded px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#000000]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-[#45464d] mb-1">EMAIL</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className={`w-full border rounded px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#000000] ${
                      emailStatus === 'taken' ? 'border-[#dc2626]' : emailStatus === 'available' ? 'border-green-600' : 'border-[#c6c6cd]'
                    }`}
                  />
                  {emailStatus === 'checking' && (
                    <p className="text-[10px] text-[#45464d] mt-1 font-mono">Checking availability...</p>
                  )}
                  {emailStatus === 'taken' && (
                    <p className="text-[10px] text-[#dc2626] mt-1 font-mono">Email is already registered.</p>
                  )}
                  {emailStatus === 'available' && (
                    <p className="text-[10px] text-green-600 mt-1 font-mono">Email is available.</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-[#45464d] mb-1">PASSWORD</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Min 8 characters"
                    className="w-full border border-[#c6c6cd] rounded px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#000000]"
                  />
                  {password.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {[
                        { rule: 'At least 8 characters', met: password.length >= 8 },
                        { rule: 'One uppercase letter', met: /[A-Z]/.test(password) },
                        { rule: 'One lowercase letter', met: /[a-z]/.test(password) },
                        { rule: 'One number', met: /[0-9]/.test(password) },
                        { rule: 'One special character', met: /[^A-Za-z0-9]/.test(password) },
                      ].map((item) => (
                        <div key={item.rule} className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-mono ${item.met ? 'text-green-600' : 'text-[#dc2626]'}`}>
                            {item.met ? '✓' : '✗'}
                          </span>
                          <span className={`text-[10px] font-mono ${item.met ? 'text-green-600' : 'text-[#45464d]'}`}>{item.rule}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-[#45464d] mb-1">CONFIRM PASSWORD</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Repeat password"
                    className="w-full border border-[#c6c6cd] rounded px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#000000]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || emailStatus === 'taken'}
                  className="w-full bg-[#000000] text-white text-xs font-mono font-bold py-2.5 rounded hover:bg-[#1f2937] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'PLEASE WAIT...' : 'CONTINUE'}
                </button>

                <div className="text-center text-xs text-[#45464d]">
                  Already have an account?{' '}
                  <a href="/auth/login" className="text-[#000000] font-bold hover:underline">
                    Sign in
                  </a>
                </div>
              </form>
            )}

            {step === 'email_otp' && (
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-sm text-[#45464d]">
                    We sent a 6-digit code to <span className="font-bold">{email}</span>
                  </p>
                </div>

                <OtpInput
                  length={6}
                  value={otp}
                  onChange={setOtp}
                  onComplete={handleVerifyEmail}
                />

                <div className="flex gap-3">
                  <button
                    onClick={handleVerifyEmail}
                    disabled={loading || otp.length !== 6}
                    className="flex-1 bg-[#000000] text-white text-xs font-mono font-bold py-2.5 rounded hover:bg-[#1f2937] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'VERIFYING...' : 'VERIFY EMAIL'}
                  </button>
                  <button
                    onClick={handleResendEmailOtp}
                    disabled={loading || cooldown > 0}
                    className="px-4 border border-[#c6c6cd] text-xs font-mono font-bold py-2.5 rounded hover:bg-[#f6f3f5] disabled:opacity-50 transition-colors"
                  >
                    {cooldown > 0 ? `${cooldown}s` : 'RESEND'}
                  </button>
                </div>
              </div>
            )}

            {step === 'details' && (
              <form onSubmit={handleDetailsSubmit} className="space-y-4">
                <div className="text-center mb-4">
                  <p className="text-sm text-[#45464d]">Add your address and details (optional)</p>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-[#45464d] mb-1">ADDRESS</label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street address, building, etc."
                    rows={2}
                    className="w-full border border-[#c6c6cd] rounded px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#000000] resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono font-bold text-[#45464d] mb-1">CITY</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Kathmandu"
                      className="w-full border border-[#c6c6cd] rounded px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#000000]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-[#45464d] mb-1">POSTAL CODE</label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="44600"
                      className="w-full border border-[#c6c6cd] rounded px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#000000]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-[#45464d] mb-1">COUNTRY</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Nepal"
                    className="w-full border border-[#c6c6cd] rounded px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#000000]"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-[#000000] text-white text-xs font-mono font-bold py-2.5 rounded hover:bg-[#1f2937] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'SAVING...' : 'SAVE & CONTINUE'}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push('/')}
                    disabled={loading}
                    className="px-4 border border-[#c6c6cd] text-xs font-mono font-bold py-2.5 rounded hover:bg-[#f6f3f5] disabled:opacity-50 transition-colors"
                  >
                    EDIT LATER
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fcf8fa] flex items-center justify-center text-sm font-mono text-[#45464d]">Loading...</div>}>
      <RegisterFormInner />
    </Suspense>
  );
}