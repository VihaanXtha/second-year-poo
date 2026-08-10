import React from 'react';
import { StatCardData } from '../types';

interface StatCardProps {
  data: StatCardData;
}

export const StatCard: React.FC<StatCardProps> = ({ data }) => {
  const isPositive = data.changeType === 'increase';
  const TrendIcon = isPositive ? 'trending_up' : 'trending_down';

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg transition-all duration-200 hover:border-slate-700 group">
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 rounded-xl bg-slate-800/50 border border-slate-800">
          <span className={`material-symbols-outlined text-[20px] ${data.color}`}>
            {data.icon}
          </span>
        </div>
        <div className={`flex items-center gap-0.5 text-xs font-mono ${
          isPositive ? 'text-green-400' : 'text-red-400'
        }`}>
          <span className="material-symbols-outlined text-[12px]">
            {TrendIcon}
          </span>
          {data.change}
        </div>
      </div>
      <p className="text-sm uppercase tracking-[0.2em] text-slate-500 mb-1">
        {data.title}
      </p>
      <p className="text-3xl font-bold text-white font-mono">
        {data.value}
      </p>
    </div>
  );
};
