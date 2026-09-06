"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [message, setMessage] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");
    const requiresProfileCompletion = searchParams.get("requires_profile_completion");
    const requiresPhoneVerification = searchParams.get("requires_phone_verification");

    if (error) {
      setStatus("error");
      setMessage("Authentication failed. Please try again.");
      return;
    }

    if (token && user) {
      setStatus("success");
      
      if (requiresProfileCompletion) {
        setMessage("Account created! Please complete your profile.");
        setTimeout(() => {
          window.location.href = "/account";
        }, 2000);
      } else if (requiresPhoneVerification) {
        setMessage("Please verify your phone number to continue.");
        setTimeout(() => {
          window.location.href = "/account";
        }, 2000);
      } else {
        setMessage("Login successful! Redirecting...");
        setTimeout(() => {
          window.location.href = "/account";
        }, 1000);
      }
    } else if (token && !user) {
      setStatus("success");
      setMessage("Authentication successful! Loading your account...");
      setTimeout(() => {
        window.location.href = "/account";
      }, 1500);
    } else {
      setStatus("error");
      setMessage("Invalid authentication response.");
    }
  }, [searchParams, user]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          {status === "processing" && (
            <>
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-red-700 border-t-transparent" />
              <h2 className="text-xl font-bold text-slate-900 mb-2">Authenticating...</h2>
              <p className="text-sm text-slate-600">Please wait while we sign you in.</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
                <span className="material-symbols-outlined text-green-600 text-[28px]">check_circle</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Success!</h2>
              <p className="text-sm text-slate-600">{message}</p>
            </>
          )}

          {status === "error" && (
            <>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                <span className="material-symbols-outlined text-red-600 text-[28px]">error</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Authentication Failed</h2>
              <p className="text-sm text-slate-600 mb-4">{message}</p>
              <a
                href="/login"
                className="inline-flex items-center justify-center rounded-lg bg-red-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-800 transition-colors"
              >
                Go to Login
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
