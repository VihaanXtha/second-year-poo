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

interface RevenueChartProps {
  data: RevenueDataPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 shadow-xl">
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

export const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm uppercase tracking-[0.2em] text-slate-500 font-mono">
          Revenue Growth
        </h3>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-[#dc2626]"></span>
          Revenue
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }}
            tickFormatter={(v) => `${v}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#dc2626"
            strokeWidth={3}
            dot={{ r: 4, fill: '#0f172a', stroke: '#dc2626', strokeWidth: 2 }}
            activeDot={{ r: 6 }}
            animationDuration={1500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
