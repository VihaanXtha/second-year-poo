import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'up' | 'down' | 'flat';
  icon: string;
  accent?: 'red' | 'blue' | 'green' | 'amber' | 'violet' | 'slate';
  sublabel?: string;
}

const accentMap: Record<NonNullable<StatCardProps['accent']>, string> = {
  red: 'bg-red-50 text-red-600',
  blue: 'bg-sky-50 text-sky-600',
  green: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  violet: 'bg-violet-50 text-violet-600',
  slate: 'bg-slate-100 text-slate-700',
};

export function StatCard({
  label,
  value,
  change,
  changeType = 'up',
  icon,
  accent = 'red',
  sublabel,
}: StatCardProps) {
  const changeColor =
    changeType === 'up'
      ? 'text-emerald-600 bg-emerald-50'
      : changeType === 'down'
      ? 'text-rose-600 bg-rose-50'
      : 'text-slate-500 bg-slate-100';

  const changeIcon =
    changeType === 'up' ? 'trending_up' : changeType === 'down' ? 'trending_down' : 'remove';

  return (
    <div className="card flex flex-col gap-4 p-5 transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${accentMap[accent]}`}>
          <span className="material-symbols-outlined text-2xl">{icon}</span>
        </div>
        {change && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${changeColor}`}
          >
            <span className="material-symbols-outlined text-sm">{changeIcon}</span>
            {change}
          </span>
        )}
      </div>
      <div>
        <div className="text-sm font-medium text-slate-500">{label}</div>
        <div className="mt-1 text-2xl font-bold text-slate-900">{value}</div>
        {sublabel && <div className="mt-1 text-xs text-slate-400">{sublabel}</div>}
      </div>
    </div>
  );
}