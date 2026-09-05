import React, { useEffect, useMemo, useState } from 'react';
import type { ApiFetch } from '../App';
import {
  Card,
  EmptyState,
  ErrorBanner,
  PageHeader,
  PrimaryButton,
  SecondaryButton,
  SelectField,
  Spinner,
  formatCurrency,
} from '../components/UI';
import { CategoryChart, OrdersChart, RevenueChart } from '../components/Charts';
import type { SalesDataPoint } from '../types';

interface SalesProps {
  apiFetch: ApiFetch;
}

interface SalesResponse {
  total_revenue?: number;
  total_orders?: number;
  average_order_value?: number;
  by_day?: SalesDataPoint[];
  by_category?: { name: string; value: number }[];
}

export function Sales({ apiFetch }: SalesProps) {
  const [range, setRange] = useState('30');
  const [data, setData] = useState<SalesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async (days: string) => {
    setLoading(true);
    setError(null);
    try {
      const raw = await apiFetch<any>(`/vendor/sales?days=${days}`);
      const d: any = raw?.data ?? raw ?? {};
      setData({
        total_revenue: Number(d.total_revenue ?? 0),
        total_orders: Number(d.total_orders ?? 0),
        average_order_value: Number(d.average_order_value ?? 0),
        by_day: (d.by_day || d.series || d.daily || []) as SalesDataPoint[],
        by_category: (d.by_category || d.categories || []) as { name: string; value: number }[],
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load sales');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(range);
  }, [range]);

  const totalRevenue = data?.total_revenue ?? sum(data?.by_day?.map((d) => d.revenue));
  const totalOrders = data?.total_orders ?? sum(data?.by_day?.map((d) => d.orders));
  const aov = data?.average_order_value ?? (totalOrders ? totalRevenue / totalOrders : 0);

  const bestDay = useMemo(() => {
    const list = data?.by_day || [];
    if (!list.length) return null;
    return list.reduce((a, b) => (b.revenue > a.revenue ? b : a), list[0]);
  }, [data]);

  return (
    <div>
      <PageHeader
        title="Sales Reports"
        description="Track your revenue, orders, and best-performing categories."
        action={
          <div className="flex gap-2">
            <SecondaryButton onClick={() => load(range)} icon="refresh">
              Refresh
            </SecondaryButton>
            <PrimaryButton onClick={() => window.print()} icon="download">
              Export
            </PrimaryButton>
          </div>
        }
      />

      {error && <div className="mb-4"><ErrorBanner message={error} /></div>}

      <Card className="mb-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard label="Total revenue" value={formatCurrency(totalRevenue)} icon="payments" tone="red" />
            <SummaryCard label="Orders" value={String(totalOrders)} icon="receipt_long" tone="blue" />
            <SummaryCard
              label="Avg. order value"
              value={formatCurrency(aov)}
              icon="trending_up"
              tone="green"
            />
            <SummaryCard
              label="Best day"
              value={bestDay ? formatCurrency(bestDay.revenue) : '—'}
              sublabel={bestDay?.date}
              icon="bolt"
              tone="amber"
            />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card
              className="lg:col-span-2"
              title="Revenue trend"
              subtitle={`Revenue over the selected period`}
            >
              {data?.by_day && data.by_day.length > 0 ? (
                <RevenueChart data={data.by_day} />
              ) : (
                <EmptyState
                  icon="show_chart"
                  title="No revenue data"
                  description="Sales activity will populate as orders are completed."
                />
              )}
            </Card>

            <Card title="Sales by category" subtitle="Top performing categories">
              {data?.by_category && data.by_category.length > 0 ? (
                <CategoryChart data={data.by_category} />
              ) : (
                <EmptyState
                  icon="donut_small"
                  title="No category data"
                  description="Category performance will appear once orders are placed."
                />
              )}
            </Card>
          </div>

          <div className="mt-6">
            <Card title="Orders per day" subtitle="Order volume">
              {data?.by_day && data.by_day.length > 0 ? (
                <OrdersChart data={data.by_day.map((d) => ({ date: d.date, orders: d.orders }))} />
              ) : (
                <EmptyState
                  icon="bar_chart"
                  title="No order data"
                  description="Daily orders will show once customers buy."
                />
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  sublabel,
  icon,
  tone,
}: {
  label: string;
  value: string;
  sublabel?: string;
  icon: string;
  tone: 'red' | 'blue' | 'green' | 'amber';
}) {
  const tones: Record<string, string> = {
    red: 'bg-red-50 text-red-600',
    blue: 'bg-sky-50 text-sky-600',
    green: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
  };
  return (
    <div className="card flex flex-col gap-4 p-5">
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${tones[tone]}`}>
        <span className="material-symbols-outlined text-2xl">{icon}</span>
      </div>
      <div>
        <div className="text-sm font-medium text-slate-500">{label}</div>
        <div className="mt-1 text-2xl font-bold text-slate-900">{value}</div>
        {sublabel && <div className="mt-1 text-xs text-slate-400">{sublabel}</div>}
      </div>
    </div>
  );
}

function sum(values?: number[]): number {
  if (!values) return 0;
  return values.reduce((a, b) => a + b, 0);
}