import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { CategoryData } from '../types';

interface CategoryChartProps {
  data: CategoryData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 shadow-xl">
        <p className="text-xs font-mono text-slate-400">{label}</p>
        <p className="text-sm font-bold text-white mt-1">
          {payload[0].value} items
        </p>
      </div>
    );
  }
  return null;
};

export const CategoryChart: React.FC<CategoryChartProps> = ({ data }) => {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm uppercase tracking-[0.2em] text-slate-500 font-mono">
          Category Distribution
        </h3>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-[#dc2626]"></span>
          Products Listed
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {data.map((item, idx) => (
          <div key={item.name} className="flex items-center gap-3">
            <div className="w-10 text-xs font-mono text-slate-500 truncate">
              {item.name}
            </div>
            <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${(item.value / data[0].value) * 100}%`, backgroundColor: item.color }}
              />
            </div>
            <span className="w-12 text-right text-xs font-mono font-bold text-white">
              {item.value}
            </span>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
          <XAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }}
          />
          <YAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
            width={100}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[0, 6, 6, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
