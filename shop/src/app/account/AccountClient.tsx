"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { NepalAddressPicker, AddressValue } from "@/components/NepalAddressPicker";
import { BadgeCheck, MailCheck, Pencil, Save, X } from "lucide-react";
import Link from "next/link";

export default function AccountClient() {
  const { user, isAuthenticated, updateProfile, fetchProfile } = useAuth();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [name, setName] = useState(() => user?.name ?? "");
  const [phone, setPhone] = useState(() => user?.phone ?? "");
  const [address, setAddress] = useState<AddressValue>(() => ({
    country: user?.country ?? "Nepal",
    province: user?.province ?? "",
    district: user?.district ?? "",
    municipality: user?.municipality ?? "",
    ward: user?.ward ?? "",
    postal_code: user?.postal_code ?? "",
  }));

  // Refresh the profile from the backend on mount so the view reflects the DB
  // rather than a possibly-stale localStorage snapshot.
  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile().catch(() => {
        /* keep local snapshot on failure */
      });
    }
  }, [isAuthenticated, fetchProfile]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/account");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return (
      <div className="flex flex-1 items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
      </div>
    );
  }

  const handleSave = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await updateProfile({
        name,
        phone: phone.trim() || undefined,
        province: address.province,
        district: address.district,
        municipality: address.municipality,
        ward: address.ward,
        postal_code: address.postal_code,
        country: address.country,
        address: address.municipality ? `Ward ${address.ward}, ${address.municipality}` : undefined,
        city: address.district,
      });
      setEditing(false);
      setSuccess("Profile updated successfully.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const field =
    "w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-red-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500";

  const addressLine = [user.ward && `Ward ${user.ward}`, user.municipality, user.district, user.province]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Account</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your profile and delivery details</p>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
          >
            <Pencil size={14} />
            Edit Profile
          </button>
        )}
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      {success && (
        <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="space-y-6">
          {/* Name */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} disabled={!editing} className={field} />
          </div>

          {/* Email (read-only identity) */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <div className="flex items-center gap-2">
              <input type="email" value={user.email} disabled className={field} />
              {user.email_verified ? (
                <span className="flex flex-shrink-0 items-center gap-1 rounded-lg bg-green-50 px-2 py-1.5 text-xs font-medium text-green-700" title="Email verified">
                  <MailCheck size={14} />
                  Verified
                </span>
              ) : (
                <span className="flex-shrink-0 rounded-lg bg-amber-50 px-2 py-1.5 text-xs font-medium text-amber-700">Unverified</span>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-400">Email is your sign-in identity and can&apos;t be changed.</p>
          </div>

          {/* Phone */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Phone</label>
            <div className="flex items-center gap-2">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={!editing}
                placeholder="9841234567"
                className={field}
              />
              {user.phone_verified ? (
                <span className="flex flex-shrink-0 items-center gap-1 rounded-lg bg-green-50 px-2 py-1.5 text-xs font-medium text-green-700" title="Phone verified">
                  <BadgeCheck size={14} />
                  Verified
                </span>
              ) : user.phone ? (
                <span className="flex-shrink-0 rounded-lg bg-amber-50 px-2 py-1.5 text-xs font-medium text-amber-700">Unverified</span>
              ) : null}
            </div>
          </div>

          {/* Nepal address */}
          <div>
            <label className="mb-3 block text-sm font-medium text-slate-700">Delivery Address (Nepal)</label>
            {editing ? (
              <NepalAddressPicker value={address} onChange={setAddress} />
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                {addressLine || user.address ? (
                  <p>
                    {addressLine}
                    {user.postal_code ? ` — ${user.postal_code}` : ""}
                  </p>
                ) : (
                  <p className="text-slate-400">
                    No delivery address saved yet.{" "}
                    <button onClick={() => setEditing(true)} className="font-medium text-red-600 hover:underline">
                      Add one
                    </button>{" "}
                    for faster checkout.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {editing && (
        <div className="mt-8 flex items-center gap-3 border-t border-slate-100 pt-6">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            <Save size={14} />
            {loading ? "Saving..." : "Save Changes"}
          </button>
          <button
            onClick={() => setEditing(false)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            <X size={14} />
            Cancel
          </button>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <Link href="/orders" className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-medium text-slate-600 transition-colors hover:border-red-200 hover:text-red-600">
          My Orders
        </Link>
        <Link href="/settings" className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-medium text-slate-600 transition-colors hover:border-red-200 hover:text-red-600">
          Settings &amp; Password
        </Link>
        <Link href="/wishlist" className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-medium text-slate-600 transition-colors hover:border-red-200 hover:text-red-600">
          Wishlist
        </Link>
      </div>
    </div>
  );
}
