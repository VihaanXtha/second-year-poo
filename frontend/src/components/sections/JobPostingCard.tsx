'use client';

import { useState, useEffect, useCallback } from 'react';

interface JobPosting {
  id: number;
  title: string;
  slug: string;
  department: string;
  location: string;
  employment_type: string;
  description: string;
  responsibilities?: string;
  requirements?: string[];
  benefits?: string[];
  application_deadline?: string;
  is_active: boolean;
}

function getDaysRemaining(deadline: string | undefined): number | null {
  if (!deadline) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const end = new Date(deadline);
  end.setHours(0, 0, 0, 0);
  const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

function Countdown({ deadline }: { deadline: string }) {
  const [days, setDays] = useState<number | null>(() => getDaysRemaining(deadline));

  useEffect(() => {
    const interval = setInterval(() => {
      setDays(getDaysRemaining(deadline));
    }, 60000);
    return () => clearInterval(interval);
  }, [deadline]);

  if (days === null) return <span className="text-xs text-slate-400">Open until {new Date(deadline).toLocaleDateString()}</span>;
  if (days <= 0) return <span className="text-xs font-medium text-red-600">Applications closed</span>;
  return <span className="text-xs font-medium text-green-600">{days} days remaining</span>;
}

export function JobPostingCard({ posting }: { posting: JobPosting }) {
  const isExpired = posting.application_deadline ? new Date(posting.application_deadline) < new Date(new Date().toDateString()) : false;

  return (
    <div
      className={`group rounded-2xl border bg-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 hover:shadow-xl hover:shadow-red-500/5 ${!posting.is_active || isExpired ? 'opacity-60 border-slate-200' : 'border-slate-200'}`}
    >
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-xl font-semibold text-slate-900 group-hover:text-red-700 transition-colors">
            {posting.title}
          </h2>
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
            {posting.employment_type}
          </span>
        </div>
        <p className="text-sm text-slate-600 mb-2 line-clamp-2">{posting.description}</p>
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span>{posting.department}</span>
          <span aria-hidden="true">•</span>
          <span>{posting.location}</span>
          <span aria-hidden="true">•</span>
          <Countdown deadline={posting.application_deadline || new Date().toISOString()} />
        </div>
      </div>
      <a
        href={`/career/${posting.slug}`}
        className="inline-flex items-center justify-center rounded-xl bg-red-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-800 transition-colors"
      >
        View Details
      </a>
    </div>
  );
}
