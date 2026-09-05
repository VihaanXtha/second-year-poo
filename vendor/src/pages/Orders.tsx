import React, { useEffect, useMemo, useState } from 'react';
import type { ApiFetch } from '../App';
import {
  Card,
  EmptyState,
  ErrorBanner,
  PageHeader,
  PrimaryButton,
  SelectField,
  Spinner,
  TextField,
  formatCurrency,
  formatDate,
  formatDateTime,
} from '../components/UI';
import { Modal } from '../components/Modal';
import { StatusBadge } from '../components/StatusBadge';
import type { VendorOrder } from '../types';

interface OrdersProps {
  apiFetch: ApiFetch;
}

export function Orders({ apiFetch }: OrdersProps) {
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewing, setViewing] = useState<VendorOrder | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<any>('/vendor/orders');
      const list = Array.isArray(data) ? data : data?.data ?? [];
      setOrders(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch = search
        ? (o.order_number + ' ' + (o.customer_name || '') + ' ' + (o.customer_email || ''))
            .toLowerCase()
            .includes(search.toLowerCase())
        : true;
      const matchStatus = statusFilter === 'all' ? true : o.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

  const updateStatus = async (order: VendorOrder, status: string) => {
    setUpdatingId(order.id);
    try {
      await apiFetch(`/vendor/orders/${order.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: status as any } : o)));
      if (viewing?.id === order.id) setViewing({ ...viewing, status: status as any });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Orders"
        description="Track and manage customer orders for your store."
      />

      {error && <div className="mb-4"><ErrorBanner message={error} /></div>}

      <Card className="mb-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="md:col-span-2">
            <TextField
              label="Search"
              value={search}
              onChange={setSearch}
              placeholder="Search by order #, customer, or email"
            />
          </div>
          <SelectField
            label="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'all', label: 'All statuses' },
              { value: 'pending', label: 'Pending' },
              { value: 'processing', label: 'Processing' },
              { value: 'shipped', label: 'Shipped' },
              { value: 'delivered', label: 'Delivered' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
          />
        </div>
      </Card>

      <Card title={`Orders (${filtered.length})`} subtitle="Most recent first">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="receipt_long"
            title="No orders yet"
            description="Customer orders will appear here as soon as they're placed."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-slate-400">
                  <th className="pb-3 font-semibold">Order</th>
                  <th className="pb-3 font-semibold">Customer</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Items</th>
                  <th className="pb-3 font-semibold">Total</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((o) => (
                  <tr key={o.id} className="text-slate-700">
                    <td className="py-3 font-semibold text-slate-900">
                      {o.order_number || `#${o.id}`}
                    </td>
                    <td className="py-3">
                      <div className="font-medium text-slate-900">{o.customer_name || 'Customer'}</div>
                      {o.customer_email && (
                        <div className="text-xs text-slate-400">{o.customer_email}</div>
                      )}
                    </td>
                    <td className="py-3 text-slate-500">{formatDate(o.created_at)}</td>
                    <td className="py-3">{o.items_count ?? o.items?.length ?? '—'}</td>
                    <td className="py-3 font-semibold text-slate-900">
                      {formatCurrency(o.total)}
                    </td>
                    <td className="py-3">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => setViewing(o)}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-semibold text-red-600 hover:bg-red-50"
                      >
                        <span className="material-symbols-outlined text-base">visibility</span>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        title={viewing ? `Order ${viewing.order_number || `#${viewing.id}`}` : 'Order'}
        description={viewing ? `Placed on ${formatDateTime(viewing.created_at)}` : undefined}
        size="lg"
      >
        {viewing && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Info label="Customer" value={viewing.customer_name || '—'} />
              <Info label="Email" value={viewing.customer_email || '—'} />
              <Info label="Total" value={formatCurrency(viewing.total)} />
            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold text-slate-900">Items</h4>
              {viewing.items && viewing.items.length > 0 ? (
                <div className="rounded-xl border border-slate-200">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold">Product</th>
                        <th className="px-3 py-2 text-right font-semibold">Qty</th>
                        <th className="px-3 py-2 text-right font-semibold">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {viewing.items.map((it) => (
                        <tr key={it.id}>
                          <td className="px-3 py-2">{it.product_name}</td>
                          <td className="px-3 py-2 text-right">{it.quantity}</td>
                          <td className="px-3 py-2 text-right">{formatCurrency(it.price)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                  Item details not available.
                </div>
              )}
            </div>

            {viewing.shipping_address && (
              <div>
                <h4 className="mb-1 text-sm font-semibold text-slate-900">Shipping address</h4>
                <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  {viewing.shipping_address}
                </p>
              </div>
            )}

            <div className="rounded-xl bg-slate-50 p-4">
              <h4 className="mb-3 text-sm font-semibold text-slate-900">Update status</h4>
              <div className="flex flex-wrap items-center gap-2">
                {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
                  <button
                    key={s}
                    disabled={updatingId === viewing.id}
                    onClick={() => updateStatus(viewing, s)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition ${
                      viewing.status === s
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <PrimaryButton onClick={() => setViewing(null)}>Close</PrimaryButton>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2.5">
      <div className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}