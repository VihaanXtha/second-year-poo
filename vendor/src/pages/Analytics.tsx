import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { CategoryChart } from '../components/CategoryChart';

interface ApiFetch {
  (endpoint: string, options?: RequestInit): Promise<any>;
}

interface SalesData {
  day: string;
  sales: number;
  orders: number;
}

export const Analytics: React.FC<{ apiFetch: ApiFetch }> = ({ apiFetch }) => {
  const [sales, setSales] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch('/vendor/sales?period=weekly');
        setSales((data.sales || []).map((s: any) => ({ day: s.date || `${s.month}/${s.year}`, sales: s.revenue, orders: s.orders })));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [apiFetch]);

  if (loading) {
    return <div className="text-slate-400">Loading analytics...</div>;
  }

  const monthlyData = sales.map(d => ({ day: d.day, sales: d.sales, orders: d.orders }));
  const pieData = [
    { name: 'PC Components', value: 85, color: '#dc2626' },
    { name: 'IoT Gear', value: 34, color: '#38bdf8' },
    { name: 'Networking', value: 22, color: '#10b981' },
    { name: 'Laptops', value: 15, color: '#f59e0b' },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1e293b] border border-[#33415b] rounded-lg px-3 py-2 shadow-xl">
          <p className="text-xs font-mono text-slate-400">{label}</p>
          <p className="text-sm font-bold text-white mt-1">Rs. {payload[0].value}</p>
          <p className="text-xs text-slate-400">{payload[1].value} orders</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-white">Analytics</h2>

      <div className="rounded-2xl border border-[#1e293b] bg-[#0f172a] p-6 shadow-lg">
        <h3 className="text-sm uppercase tracking-[0.2em] text-slate-500 font-mono mb-5">
          Sales & Orders
        </h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }} />
            <Bar dataKey="sales" fill="#dc2626" radius={[4, 4, 0, 0]} name="Sales (Rs.)" />
            <Bar dataKey="orders" fill="#38bdf8" radius={[4, 4, 0, 0]} name="Orders" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <CategoryChart data={pieData} />

        <div className="rounded-2xl border border-[#1e293b] bg-[#0f172a] p-6 shadow-lg">
          <h3 className="text-sm uppercase tracking-[0.2em] text-slate-500 font-mono mb-5">
            Key Metrics
          </h3>
          <div className="grid grid-cols-2 gap-5">
            {[
              { label: 'Avg Order Value', value: 'Rs. 245', change: '+5.3%' },
              { label: 'Customer Retention', value: '78.4%', change: '+2.1%' },
              { label: 'New Customers', value: '1,428', change: '+12.5%' },
              { label: 'Return Rate', value: '3.2%', change: '-1.8%' },
            ].map((item) => (
              <div key={item.label} className="bg-[#1e293b]/30 border border-[#1e293b] rounded-xl p-4">
                <p className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-1">
                  {item.label}
                </p>
                <p className="text-2xl font-bold text-white font-mono">{item.value}</p>
                <p className="text-xs text-green-400 font-mono mt-1">{item.change}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
