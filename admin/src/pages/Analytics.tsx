import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface ApiFetch {
  (endpoint: string, options?: RequestInit): Promise<any>;
}

const COLORS = ['#dc2626', '#38bdf8', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export const Analytics: React.FC<{ apiFetch: ApiFetch }> = ({ apiFetch }) => {
  const [sales, setSales] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [salesData, categoriesData] = await Promise.all([
          apiFetch('/admin/sales?period=monthly'),
          apiFetch('/categories'),
        ]);
        setSales(salesData.sales || []);
        setCategories(categoriesData.categories || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [apiFetch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const monthlyData = sales.map((d: any) => ({
    month: `${d.month}/${d.year}`,
    revenue: d.revenue,
    orders: d.orders,
  }));

  const pieData = categories.map((c: any) => ({
    name: c.name,
    value: c.products_count || 0,
    color: COLORS[categories.indexOf(c) % COLORS.length],
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-5">
            Monthly Revenue & Orders
          </h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: any) => [`Rs. ${value.toLocaleString()}`, '']}
              />
              <Legend wrapperStyle={{ color: '#64748b', fontSize: '12px' }} />
              <Bar dataKey="revenue" fill="#dc2626" radius={[4, 4, 0, 0]} name="Revenue (Rs.)" />
              <Bar dataKey="orders" fill="#38bdf8" radius={[4, 4, 0, 0]} name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-5">
            Category Distribution
          </h3>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={{ stroke: '#94a3b8' }}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-5">
          Key Metrics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[
            { label: 'Avg Order Value', value: 'Rs. 245', change: '+5.3%', trend: 'up' as const },
            { label: 'Customer Retention', value: '78.4%', change: '+2.1%', trend: 'up' as const },
            { label: 'New Customers', value: '1,428', change: '+12.5%', trend: 'up' as const },
            { label: 'Return Rate', value: '3.2%', change: '-1.8%', trend: 'down' as const },
          ].map((item) => (
            <div key={item.label} className="bg-slate-50 border border-slate-100 rounded-xl p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                {item.label}
              </p>
              <p className="text-2xl font-bold text-slate-900 font-mono">{item.value}</p>
              <p className={`text-xs font-semibold mt-1 ${item.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {item.change}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
