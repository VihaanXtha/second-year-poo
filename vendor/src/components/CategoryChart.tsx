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
  PieChart,
  Pie,
  Legend,
} from 'recharts';
import { CategoryData } from '../types';

interface CategoryChartProps {
  data: CategoryData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1e293b] border border-[#33415b] rounded-lg px-3 py-2 shadow-xl">
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
    <div className="rounded-2xl border border-[#1e293b] bg-[#0f172a] p-6 shadow-lg">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm uppercase tracking-[0.2em] text-slate-500 font-mono">
          Category Performance
        </h3>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-[#dc2626]"></span>
          Listings by Category
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={70}
                innerRadius={40}
                paddingAngle={2}
              >
                {data.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ color: '#94a3b8', fontSize: '12px', paddingTop: '10px' }}
                layout="vertical"
                verticalAlign="middle"
                align="right"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-3">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-3">
              <div className="w-12 text-xs font-mono text-slate-500 truncate">
                {item.name}
              </div>
              <div className="flex-1 bg-[#1e293b] rounded-full h-2 overflow-hidden">
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
      </div>
    </div>
  );
};
