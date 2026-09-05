import React from 'react';
import { StatCardData } from '../types';

interface StatCardProps {
  data: StatCardData;
}

export const StatCard: React.FC<StatCardProps> = ({ data }) => {
  const isPositive = data.changeType === 'increase';
  const Icon = data.icon;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 group">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2.5 rounded-xl ${data.bgColor}`}>
          <Icon className="w-5 h-5 text-slate-700" />
        </div>
        <span
          className={`flex items-center gap-1 text-xs font-semibold ${
            isPositive ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
          } px-2 py-1 rounded-full`}
        >
          {isPositive ? '+' : ''}{data.change}
        </span>
      </div>
      <p className="text-sm font-medium text-slate-500 mb-1">{data.title}</p>
      <p className="text-2xl font-bold text-slate-900">{data.value}</p>
    </div>
  );
};
