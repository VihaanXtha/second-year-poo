import React from 'react';

type StatusKind = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'active' | 'draft' | 'out_of_stock' | 'verified' | 'suspended' | string;

interface StatusBadgeProps {
  status: StatusKind;
}

const styles: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  processing: 'bg-sky-50 text-sky-700 ring-sky-200',
  shipped: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  delivered: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  cancelled: 'bg-rose-50 text-rose-700 ring-rose-200',
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  draft: 'bg-slate-100 text-slate-600 ring-slate-200',
  out_of_stock: 'bg-rose-50 text-rose-700 ring-rose-200',
  verified: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  suspended: 'bg-rose-50 text-rose-700 ring-rose-200',
};

const icons: Record<string, string> = {
  pending: 'schedule',
  processing: 'autorenew',
  shipped: 'local_shipping',
  delivered: 'check_circle',
  active: 'check_circle',
  verified: 'verified',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const key = (status || '').toString().toLowerCase();
  const cls = styles[key] || 'bg-slate-100 text-slate-700 ring-slate-200';
  const icon = icons[key];
  const label = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${cls}`}
    >
      {icon && <span className="material-symbols-outlined text-[14px]">{icon}</span>}
      {label}
    </span>
  );
}