import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { PageHeader } from '../components/PageHeader';
import { StatCard } from '../components/StatCard';

interface ApiFetch {
  (endpoint: string, options?: RequestInit): Promise<any>;
}

interface SalesReport {
  month: string;
  year: number;
  revenue: number;
  orders: number;
  customers: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-lg">
        <p className="text-xs font-semibold text-slate-500 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm font-bold" style={{ color: entry.color }}>
            {entry.name}: Rs. {entry.value?.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const SalesReports: React.FC<{ apiFetch: ApiFetch }> = ({ apiFetch }) => {
  const [sales, setSales] = useState<SalesReport[]>([]);
  const [period, setPeriod] = useState('monthly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch(`/admin/sales?period=${period}`);
        setSales(data.sales || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [apiFetch, period]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const totalRevenue = sales.reduce((sum, s) => sum + s.revenue, 0);
  const totalOrders = sales.reduce((sum, s) => sum + s.orders, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Sales Reports" subtitle="Track revenue and sales performance" />

      <div className="flex items-center gap-2">
        {['monthly', 'yearly', 'weekly'].map((p) => (
          <button
            key={p}
            onClick={() => { setPeriod(p); setLoading(true); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
              period === p
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          data={{
            id: 1,
            title: 'Total Revenue',
            value: `Rs. ${totalRevenue.toLocaleString()}`,
            change: '12.5%',
            changeType: 'increase',
            icon: () => null,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
          }}
        />
        <StatCard
          data={{
            id: 2,
            title: 'Total Orders',
            value: totalOrders.toLocaleString(),
            change: '8.2%',
            changeType: 'increase',
            icon: () => null,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
          }}
        />
        <StatCard
          data={{
            id: 3,
            title: 'Avg Order Value',
            value: `Rs. ${Math.round(avgOrderValue).toLocaleString()}`,
            change: '5.3%',
            changeType: 'increase',
            icon: () => null,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
          }}
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-5">
          Revenue Trend
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={sales} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey={period === 'monthly' ? 'month' : 'year'}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickFormatter={(v) => `Rs. ${v / 1000}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#dc2626"
              strokeWidth={3}
              dot={{ r: 5, fill: '#FFFFFF', stroke: '#dc2626', strokeWidth: 2 }}
              activeDot={{ r: 7 }}
              animationDuration={1500}
              name="Revenue"
            />
            <Line
              type="monotone"
              dataKey="orders"
              stroke="#38bdf8"
              strokeWidth={3}
              dot={{ r: 5, fill: '#FFFFFF', stroke: '#38bdf8', strokeWidth: 2 }}
              activeDot={{ r: 7 }}
              animationDuration={1500}
              name="Orders"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
