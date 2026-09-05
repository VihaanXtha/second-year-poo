import React, { useEffect, useMemo, useState } from 'react';
import type { ApiFetch } from '../App';
import {
  Card,
  EmptyState,
  ErrorBanner,
  PageHeader,
  SelectField,
  Spinner,
  TextField,
} from '../components/UI';
import { CategoryChart, OrdersChart, RevenueChart } from '../components/Charts';
import type { SalesDataPoint } from '../types';

interface AnalyticsProps {
  apiFetch: ApiFetch;
}

export function Analytics({ apiFetch }: AnalyticsProps) {
  const [range, setRange] = useState('30');
  const [search, setSearch] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async (days: string) => {
    setLoading(true);
    setError(null);
    try {
      const raw = await apiFetch<any>(`/vendor/sales?days=${days}`);
      const d: any = raw?.data ?? raw ?? {};
      setData({
        by_day: (d.by_day || d.series || d.daily || []) as SalesDataPoint[],
        by_category: (d.by_category || d.categories || []) as { name: string; value: number }[],
        top_products: (d.top_products || d.products || []) as any[],
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(range);
  }, [range]);

  const filteredProducts = useMemo(() => {
    const list = data?.top_products || [];
    if (!search) return list;
    return list.filter((p: any) => (p.name || '').toLowerCase().includes(search.toLowerCase()));
  }, [data, search]);

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Deep dive into your store performance and product trends."
      />

      {error && <div className="mb-4"><ErrorBanner message={error} /></div>}

      <Card className="mb-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <SelectField
            label="Date range"
            value={range}
            onChange={setRange}
            options={[
              { value: '7', label: 'Last 7 days' },
              { value: '14', label: 'Last 14 days' },
              { value: '30', label: 'Last 30 days' },
              { value: '90', label: 'Last 90 days' },
            ]}
          />
        </div>
      </Card>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card title="Revenue trend" subtitle="Cumulative revenue per day">
              {data?.by_day && data.by_day.length > 0 ? (
                <RevenueChart data={data.by_day} />
              ) : (
                <EmptyState
                  icon="show_chart"
                  title="No revenue data"
                  description="Charts will populate once orders are placed."
                />
              )}
            </Card>

            <Card title="Orders per day" subtitle="Daily order count">
              {data?.by_day && data.by_day.length > 0 ? (
                <OrdersChart data={data.by_day.map((d) => ({ date: d.date, orders: d.orders }))} />
              ) : (
                <EmptyState
                  icon="bar_chart"
                  title="No order data"
                  description="Order counts will appear here."
                />
              )}
            </Card>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card title="Sales by category" subtitle="Distribution of sales">
              {data?.by_category && data.by_category.length > 0 ? (
                <CategoryChart data={data.by_category} />
              ) : (
                <EmptyState
                  icon="donut_small"
                  title="No category data"
                  description="Category mix will appear after sales."
                />
              )}
            </Card>

            <Card className="lg:col-span-2" title="Top products" subtitle="Best sellers in the selected range">
              <div className="mb-3">
                <TextField
                  label="Filter products"
                  value={search}
                  onChange={setSearch}
                  placeholder="Search by product name"
                />
              </div>
              {filteredProducts.length === 0 ? (
                <EmptyState
                  icon="inventory_2"
                  title="No product data"
                  description="Top selling products will appear here."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-xs uppercase tracking-wider text-slate-400">
                        <th className="pb-3 font-semibold">Product</th>
                        <th className="pb-3 text-right font-semibold">Sold</th>
                        <th className="pb-3 text-right font-semibold">Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredProducts.map((p: any) => (
                        <tr key={p.id || p.name} className="text-slate-700">
                          <td className="py-3 font-semibold text-slate-900">{p.name}</td>
                          <td className="py-3 text-right">{p.sold ?? p.quantity ?? '—'}</td>
                          <td className="py-3 text-right font-semibold">
                            ${Number(p.revenue ?? p.total ?? 0).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}