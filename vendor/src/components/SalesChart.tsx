import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { RevenueDataPoint } from '../types';

interface SalesChartProps {
  data: RevenueDataPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1e293b] border border-[#33415b] rounded-lg px-3 py-2 shadow-xl">
        <p className="text-xs font-mono text-slate-400">{label}</p>
        <p className="text-sm font-bold text-white mt-1">
          Rs. {payload[0].value}k
        </p>
        <p className="text-xs text-slate-400">
          {payload[1].value} orders
        </p>
      </div>
    );
  }
  return null;
};

export const SalesChart: React.FC<SalesChartProps> = ({ data }) => {
  return (
    <div className="rounded-2xl border border-[#1e293b] bg-[#0f172a] p-6 shadow-lg">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm uppercase tracking-[0.2em] text-slate-500 font-mono">
          Weekly Sales
        </h3>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-[#dc2626]"></span>
          Sales (Rs. k) & Orders
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }}
          />
          <YAxis
            yAxisId="left"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }}
            tickFormatter={(v) => `${v}k`}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="sales"
            stroke="#dc2626"
            strokeWidth={3}
            dot={{ r: 4, fill: '#0f172a', stroke: '#dc2626', strokeWidth: 2 }}
            activeDot={{ r: 6 }}
            animationDuration={1500}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="orders"
            stroke="#38bdf8"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ r: 3 }}
            animationDuration={1500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
