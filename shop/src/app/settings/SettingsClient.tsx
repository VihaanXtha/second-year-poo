"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { BadgeCheck, Eye, EyeOff, KeyRound, MailCheck, ShieldCheck } from "lucide-react";

export default function SettingsClient() {
  const { user, isAuthenticated, changePassword, fetchProfile } = useAuth();
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Keep verification badges fresh from the backend.
  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile().catch(() => {
        /* keep local snapshot on failure */
      });
    }
  }, [isAuthenticated, fetchProfile]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/settings");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return (
      <div className="flex flex-1 items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    if (newPassword === currentPassword) {
      setError("New password must be different from the current one");
      return;
    }

    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword, confirmPassword);
      setSuccess("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const field =
    "w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-red-500 focus:outline-none";

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Security and account preferences</p>
      </div>

      {/* Account status */}
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
          <ShieldCheck size={18} className="text-red-600" />
          Account Status
        </h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <span className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${user.email_verified ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
            <MailCheck size={14} />
            Email {user.email_verified ? "verified" : "not verified"}
          </span>
          <span className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${user.phone_verified ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
            <BadgeCheck size={14} />
            Phone {user.phone_verified ? "verified" : "not verified"}
          </span>
        </div>
        <p className="mt-3 text-xs text-slate-400">
          Signed in as {user.email} ({user.role}).
        </p>
      </div>

      {/* Change password */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
          <KeyRound size={18} className="text-red-600" />
          Change Password
        </h2>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        {success && (
          <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4">
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Current Password</label>
            <input
              type={showPasswords ? "text" : "password"}
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={field}
              autoComplete="current-password"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">New Password</label>
            <input
              type={showPasswords ? "text" : "password"}
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={field}
              autoComplete="new-password"
            />
            <p className="mt-1 text-xs text-slate-400">At least 8 characters.</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Confirm New Password</label>
            <input
              type={showPasswords ? "text" : "password"}
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={field}
              autoComplete="new-password"
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowPasswords((s) => !s)}
              className="flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-700"
            >
              {showPasswords ? <EyeOff size={14} /> : <Eye size={14} />}
              {showPasswords ? "Hide" : "Show"} passwords
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>

      {/* Notification preferences */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate-900">Notifications</h2>
        <p className="mt-2 text-sm text-slate-500">
          Order updates are sent to your {user.email_verified ? "email" : "registered contact"} and SMS to your
          phone automatically — per-channel preferences arrive with the checkout rollout.
        </p>
      </div>
    </div>
  );
}
