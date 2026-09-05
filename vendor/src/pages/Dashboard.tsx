import React, { useEffect, useState } from 'react';
import type { ApiFetch } from '../App';
import { useVendorAuth } from '../context/AuthContext';
import { StatCard } from '../components/StatCard';
import { Card, ErrorBanner, formatCurrency, formatDate, PageHeader, PrimaryButton, SecondaryButton, Spinner, EmptyState } from '../components/UI';
import { OrdersChart, RevenueChart } from '../components/Charts';
import { StatusBadge } from '../components/StatusBadge';
import type { DashboardStats, SalesDataPoint, VendorOrder } from '../types';

interface DashboardProps {
  apiFetch: ApiFetch;
  setActiveNav: (id: string) => void;
}

export function Dashboard({ apiFetch, setActiveNav }: DashboardProps) {
  const { store } = useVendorAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<VendorOrder[]>([]);
  const [sales, setSales] = useState<SalesDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [statsRes, ordersRes, salesRes] = await Promise.allSettled([
          apiFetch<any>('/vendor/dashboard/stats'),
          apiFetch<any>('/vendor/orders?limit=5'),
          apiFetch<any>('/vendor/sales?days=14'),
        ]);

        if (cancelled) return;

        if (statsRes.status === 'fulfilled') {
          const data = statsRes.value;
          setStats({
            total_revenue: Number(data.total_revenue ?? data.revenue ?? 0),
            total_orders: Number(data.total_orders ?? data.orders ?? 0),
            total_products: Number(data.total_products ?? data.products ?? 0),
            total_customers: Number(data.total_customers ?? data.customers ?? 0),
            revenue_change: Number(data.revenue_change ?? 0),
            orders_change: Number(data.orders_change ?? 0),
            products_change: Number(data.products_change ?? 0),
            customers_change: Number(data.customers_change ?? 0),
          });
        }
        if (ordersRes.status === 'fulfilled') {
          const list = Array.isArray(ordersRes.value)
            ? ordersRes.value
            : ordersRes.value?.data ?? [];
          setRecentOrders(list);
        }
        if (salesRes.status === 'fulfilled') {
          const list = Array.isArray(salesRes.value)
            ? salesRes.value
            : salesRes.value?.data ?? [];
          const mapped: SalesDataPoint[] = list.map((d: any) => ({
            date: d.date || d.day || d.label || '',
            revenue: Number(d.revenue ?? d.sales ?? d.amount ?? 0),
            orders: Number(d.orders ?? d.count ?? 0),
          }));
          setSales(mapped);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load dashboard');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [apiFetch]);

  const fmtChange = (v?: number) =>
    v === undefined ? undefined : `${v > 0 ? '+' : ''}${v.toFixed(1)}%`;

  return (
    <div>
      <PageHeader
        title={`Hello, ${store?.store_name || 'Vendor'} 👋`}
        description="Here's what's happening with your store today."
        action={
          <div className="flex gap-2">
            <SecondaryButton onClick={() => setActiveNav('products')} icon="add">
              Add Product
            </SecondaryButton>
            <PrimaryButton onClick={() => setActiveNav('orders')} icon="visibility">
              View Orders
            </PrimaryButton>
          </div>
        }
      />

      {error && <div className="mb-4"><ErrorBanner message={error} /></div>}

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total Revenue"
              value={formatCurrency(stats?.total_revenue ?? 0)}
              change={fmtChange(stats?.revenue_change)}
              changeType={(stats?.revenue_change ?? 0) >= 0 ? 'up' : 'down'}
              icon="payments"
              accent="red"
              sublabel="Lifetime earnings"
            />
            <StatCard
              label="Total Orders"
              value={stats?.total_orders ?? 0}
              change={fmtChange(stats?.orders_change)}
              changeType={(stats?.orders_change ?? 0) >= 0 ? 'up' : 'down'}
              icon="receipt_long"
              accent="blue"
              sublabel="All time"
            />
            <StatCard
              label="Active Products"
              value={stats?.total_products ?? 0}
              change={fmtChange(stats?.products_change)}
              changeType={(stats?.products_change ?? 0) >= 0 ? 'up' : 'down'}
              icon="inventory_2"
              accent="violet"
              sublabel="Listed in store"
            />
            <StatCard
              label="Customers"
              value={stats?.total_customers ?? 0}
              change={fmtChange(stats?.customers_change)}
              changeType={(stats?.customers_change ?? 0) >= 0 ? 'up' : 'down'}
              icon="group"
              accent="green"
              sublabel="Unique buyers"
            />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card
              className="lg:col-span-2"
              title="Revenue (last 14 days)"
              subtitle="Daily revenue trend for your store"
              action={
                <button
                  onClick={() => setActiveNav('sales')}
                  className="text-sm font-semibold text-red-600 hover:text-red-700"
                >
                  View report →
                </button>
              }
            >
              {sales.length > 0 ? (
                <RevenueChart data={sales} />
              ) : (
                <EmptyState
                  icon="show_chart"
                  title="No sales data yet"
                  description="Once you start receiving orders, revenue trends will appear here."
                />
              )}
            </Card>

            <Card title="Orders (last 14 days)" subtitle="Daily order volume">
              {sales.length > 0 ? (
                <OrdersChart data={sales.map((s) => ({ date: s.date, orders: s.orders }))} />
              ) : (
                <EmptyState
                  icon="receipt_long"
                  title="No orders yet"
                  description="Order statistics will populate as customers purchase."
                />
              )}
            </Card>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card
              className="lg:col-span-2"
              title="Recent Orders"
              subtitle="Latest customer activity"
              action={
                <button
                  onClick={() => setActiveNav('orders')}
                  className="text-sm font-semibold text-red-600 hover:text-red-700"
                >
                  View all →
                </button>
              }
            >
              {recentOrders.length === 0 ? (
                <EmptyState
                  icon="shopping_bag"
                  title="No orders yet"
                  description="When customers place orders, they'll show up here."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-xs uppercase tracking-wider text-slate-400">
                        <th className="pb-3 font-semibold">Order</th>
                        <th className="pb-3 font-semibold">Customer</th>
                        <th className="pb-3 font-semibold">Date</th>
                        <th className="pb-3 font-semibold">Status</th>
                        <th className="pb-3 text-right font-semibold">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recentOrders.map((o) => (
                        <tr key={o.id} className="text-slate-700">
                          <td className="py-3 font-semibold text-slate-900">
                            {o.order_number || `#${o.id}`}
                          </td>
                          <td className="py-3">{o.customer_name || 'Customer'}</td>
                          <td className="py-3 text-slate-500">{formatDate(o.created_at)}</td>
                          <td className="py-3">
                            <StatusBadge status={o.status} />
                          </td>
                          <td className="py-3 text-right font-semibold text-slate-900">
                            {formatCurrency(o.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            <Card title="Store Health" subtitle="Quick overview">
              <ul className="space-y-3">
                <HealthItem
                  icon="verified"
                  label="Store Status"
                  value={store?.status || 'Unknown'}
                  tone={store?.verified ? 'good' : 'warn'}
                />
                <HealthItem
                  icon="star"
                  label="Rating"
                  value={store?.rating ? `${Number(store.rating).toFixed(1)} / 5` : 'No reviews'}
                  tone={store?.rating ? 'good' : 'neutral'}
                />
                <HealthItem
                  icon="inventory_2"
                  label="Products"
                  value={String(stats?.total_products ?? 0)}
                  tone="neutral"
                />
                <HealthItem
                  icon="receipt_long"
                  label="Orders"
                  value={String(stats?.total_orders ?? 0)}
                  tone="neutral"
                />
                <HealthItem
                  icon="payments"
                  label="Revenue"
                  value={formatCurrency(stats?.total_revenue ?? 0)}
                  tone="good"
                />
              </ul>
              <button
                onClick={() => setActiveNav('store')}
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-red-600 hover:text-red-700"
              >
                Manage store →
              </button>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function HealthItem({
  icon,
  label,
  value,
  tone,
}: {
  icon: string;
  label: string;
  value: string;
  tone: 'good' | 'warn' | 'neutral';
}) {
  const toneCls =
    tone === 'good'
      ? 'bg-emerald-50 text-emerald-600'
      : tone === 'warn'
      ? 'bg-amber-50 text-amber-600'
      : 'bg-slate-100 text-slate-600';
  return (
    <li className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${toneCls}`}>
          <span className="material-symbols-outlined text-lg">{icon}</span>
        </div>
        <span className="text-sm text-slate-600">{label}</span>
      </div>
      <span className="text-sm font-semibold capitalize text-slate-900">{value}</span>
    </li>
  );
}