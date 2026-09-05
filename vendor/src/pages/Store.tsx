import React, { useEffect, useState } from 'react';
import type { ApiFetch } from '../App';
import { useVendorAuth } from '../context/AuthContext';
import {
  Card,
  ErrorBanner,
  PageHeader,
  PrimaryButton,
  SecondaryButton,
  SelectField,
  Spinner,
  TextField,
} from '../components/UI';
import { Modal } from '../components/Modal';

interface StorePageProps {
  apiFetch: ApiFetch;
}

interface StoreForm {
  store_name: string;
  description: string;
  address: string;
  phone: string;
  logo_url: string;
  banner_url: string;
  status: string;
}

const initialStoreForm = (s?: any): StoreForm => ({
  store_name: s?.store_name || '',
  description: s?.description || '',
  address: s?.address || '',
  phone: s?.phone || '',
  logo_url: s?.logo_url || '',
  banner_url: s?.banner_url || '',
  status: s?.status || 'active',
});

export function StorePage({ apiFetch }: StorePageProps) {
  const { store, refreshStore } = useVendorAuth();
  const [form, setForm] = useState<StoreForm>(initialStoreForm(store));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openRegister, setOpenRegister] = useState(false);

  useEffect(() => {
    if (store) setForm(initialStoreForm(store));
  }, [store]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const payload = {
        store_name: form.store_name,
        description: form.description,
        address: form.address,
        phone: form.phone,
        logo_url: form.logo_url,
        banner_url: form.banner_url,
        status: form.status,
      };
      const method = store ? 'PUT' : 'POST';
      const endpoint = store ? '/vendor/store' : '/vendor/store';
      const data = await apiFetch<any>(endpoint, {
        method,
        body: JSON.stringify(payload),
      });
      const next = data.store || data;
      if (next) refreshStore(next);
      setMessage({ type: 'ok', text: 'Store details saved successfully.' });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save store');
    } finally {
      setSaving(false);
    }
  };

  if (!store) {
    return (
      <div>
        <PageHeader
          title="Set up your store"
          description="Create a vendor store to start selling on Circuit Bazaar."
        />
        {error && <ErrorBanner message={error} />}
        <Card>
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <span className="material-symbols-outlined text-3xl">storefront</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No store yet</h3>
            <p className="max-w-md text-sm text-slate-500">
              Register your storefront to publish products and start receiving orders.
            </p>
            <PrimaryButton onClick={() => setOpenRegister(true)} icon="add_business">
              Register store
            </PrimaryButton>
          </div>
        </Card>

        <Modal
          open={openRegister}
          onClose={() => setOpenRegister(false)}
          title="Register your store"
          description="Provide your store details. Admin verification is required before publishing."
          size="lg"
        >
          <form
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
            onSubmit={async (e) => {
              e.preventDefault();
              setSaving(true);
              setError(null);
              try {
                const data = await apiFetch<any>('/vendor/store', {
                  method: 'POST',
                  body: JSON.stringify({
                    store_name: form.store_name,
                    description: form.description,
                    address: form.address,
                    phone: form.phone,
                    logo_url: form.logo_url,
                    banner_url: form.banner_url,
                  }),
                });
                const next = data.store || data;
                if (next) refreshStore(next);
                setOpenRegister(false);
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to register store');
              } finally {
                setSaving(false);
              }
            }}
          >
            <TextField
              label="Store name"
              required
              value={form.store_name}
              onChange={(v) => setForm({ ...form, store_name: v })}
              placeholder="Acme Electronics"
            />
            <TextField
              label="Phone"
              value={form.phone}
              onChange={(v) => setForm({ ...form, phone: v })}
              placeholder="+977 98xxxxxxxx"
            />
            <div className="md:col-span-2">
              <TextField
                label="Description"
                rows={3}
                value={form.description}
                onChange={(v) => setForm({ ...form, description: v })}
                placeholder="What makes your store special?"
              />
            </div>
            <div className="md:col-span-2">
              <TextField
                label="Address"
                value={form.address}
                onChange={(v) => setForm({ ...form, address: v })}
                placeholder="Kathmandu, Nepal"
              />
            </div>
            <TextField
              label="Logo URL"
              value={form.logo_url}
              onChange={(v) => setForm({ ...form, logo_url: v })}
              placeholder="https://..."
            />
            <TextField
              label="Banner URL"
              value={form.banner_url}
              onChange={(v) => setForm({ ...form, banner_url: v })}
              placeholder="https://..."
            />
            {error && (
              <div className="md:col-span-2">
                <ErrorBanner message={error} />
              </div>
            )}
            <div className="md:col-span-2 flex justify-end gap-3">
              <SecondaryButton onClick={() => setOpenRegister(false)}>Cancel</SecondaryButton>
              <PrimaryButton type="submit" disabled={saving} icon="check">
                {saving ? 'Submitting...' : 'Submit for review'}
              </PrimaryButton>
            </div>
          </form>
        </Modal>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="My Store"
        description="Manage your storefront profile, branding, and operational details."
        action={
          store.verified ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
              <span className="material-symbols-outlined text-base">verified</span>
              Verified
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
              <span className="material-symbols-outlined text-base">hourglass_top</span>
              Pending verification
            </span>
          )
        }
      />

      {error && <div className="mb-4"><ErrorBanner message={error} /></div>}
      {message && (
        <div
          className={`mb-4 flex items-center gap-2 rounded-xl border p-3 text-sm ${
            message.type === 'ok'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-rose-200 bg-rose-50 text-rose-700'
          }`}
        >
          <span className="material-symbols-outlined text-lg">
            {message.type === 'ok' ? 'check_circle' : 'error'}
          </span>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2" title="Storefront details" subtitle="Visible to customers">
          <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <TextField
              label="Store name"
              required
              value={form.store_name}
              onChange={(v) => setForm({ ...form, store_name: v })}
            />
            <TextField
              label="Phone"
              value={form.phone}
              onChange={(v) => setForm({ ...form, phone: v })}
              placeholder="+977 98xxxxxxxx"
            />
            <div className="md:col-span-2">
              <TextField
                label="Description"
                rows={3}
                value={form.description}
                onChange={(v) => setForm({ ...form, description: v })}
              />
            </div>
            <div className="md:col-span-2">
              <TextField
                label="Address"
                value={form.address}
                onChange={(v) => setForm({ ...form, address: v })}
              />
            </div>
            <TextField
              label="Logo URL"
              value={form.logo_url}
              onChange={(v) => setForm({ ...form, logo_url: v })}
              placeholder="https://..."
            />
            <TextField
              label="Banner URL"
              value={form.banner_url}
              onChange={(v) => setForm({ ...form, banner_url: v })}
              placeholder="https://..."
            />
            <SelectField
              label="Status"
              value={form.status}
              onChange={(v) => setForm({ ...form, status: v })}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'on_hold', label: 'On hold' },
                { value: 'closed', label: 'Closed' },
              ]}
            />
            <div className="md:col-span-2 flex justify-end gap-3 pt-2">
              <PrimaryButton type="submit" disabled={saving} icon="save">
                {saving ? 'Saving...' : 'Save changes'}
              </PrimaryButton>
            </div>
          </form>
        </Card>

        <div className="space-y-6">
          <Card title="Branding preview" subtitle="How customers see your store">
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <div className="relative h-32 w-full bg-gradient-to-br from-red-100 via-red-50 to-slate-100">
                {form.banner_url ? (
                  <img
                    src={form.banner_url}
                    alt="banner"
                    className="h-full w-full object-cover"
                    onError={(e) => ((e.currentTarget.style.display = 'none'))}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                    Banner preview
                  </div>
                )}
              </div>
              <div className="-mt-10 flex items-end gap-3 px-4 pb-4">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-red-100 text-lg font-bold text-red-700 shadow">
                  {form.logo_url ? (
                    <img src={form.logo_url} alt="logo" className="h-full w-full object-cover" />
                  ) : (
                    (form.store_name?.[0] || 'S').toUpperCase()
                  )}
                </div>
                <div className="pb-1">
                  <div className="text-sm font-bold text-slate-900">
                    {form.store_name || 'Your store'}
                  </div>
                  <div className="text-xs text-slate-500">{form.address || 'Add an address'}</div>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Store metrics" subtitle="Snapshot of activity">
            <ul className="space-y-3 text-sm">
              <Stat label="Store ID" value={`#${store.id}`} />
              <Stat label="Slug" value={store.store_slug || '—'} />
              <Stat label="Status" value={store.status || '—'} />
              <Stat label="Verified" value={store.verified ? 'Yes' : 'No'} />
              <Stat label="Products" value={String(store.total_products ?? 0)} />
              <Stat label="Orders" value={String(store.total_orders ?? 0)} />
              <Stat
                label="Lifetime revenue"
                value={`$${Number(store.total_revenue ?? 0).toLocaleString()}`}
              />
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-900">{value}</span>
    </li>
  );
}