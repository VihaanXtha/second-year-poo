'use client';

import { useState, useCallback } from 'react';

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

const API_URL = 'http://localhost:8000/api';

export function ApplyForm({ posting }: { posting: JobPosting }) {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', notice_period: '1_month' });
  const [cv, setCv] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isExpired = posting.application_deadline ? new Date(posting.application_deadline) < new Date(new Date().toDateString()) : false;

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!cv) {
      setError('Please upload your CV (PDF only).');
      setSubmitting(false);
      return;
    }

    if (cv.type !== 'application/pdf') {
      setError('CV must be a PDF file.');
      setSubmitting(false);
      return;
    }

    if (cv.size > 5 * 1024 * 1024) {
      setError('CV must be smaller than 5MB.');
      setSubmitting(false);
      return;
    }

    const cvBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(cv);
    });

    try {
      const res = await fetch(`${API_URL}/job-postings/${posting.id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: form.full_name,
          email: form.email,
          phone: form.phone,
          notice_period: form.notice_period,
          cv_base64: cvBase64,
          cv_filename: cv.name,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.message || 'Failed to submit application.');
        return;
      }

      setSuccess(true);
      setForm({ full_name: '', email: '', phone: '', notice_period: '1_month' });
      setCv(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Network error. Please try again.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }, [form, cv, posting.id]);

  if (isExpired || !posting.is_active) {
    return (
      <div className="mt-8 rounded-2xl bg-slate-50 border border-slate-200 p-8 text-center">
        <p className="text-lg font-medium text-slate-500">Applications for this position are closed.</p>
        {posting.application_deadline && (
          <p className="text-sm text-slate-400 mt-1">Deadline was {new Date(posting.application_deadline).toLocaleDateString()}</p>
        )}
      </div>
    );
  }

  if (success) {
    return (
      <div className="mt-8 rounded-2xl bg-green-50 border border-green-200 p-8 text-center">
        <p className="text-lg font-medium text-green-800">Application submitted!</p>
        <p className="text-sm text-green-600 mt-1">We will get back to you soon.</p>
        <button onClick={() => setSuccess(false)} className="mt-4 rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800">
          Submit another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
          <input type="text" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary" required />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
          <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Notice Period</label>
          <select value={form.notice_period} onChange={e => setForm({ ...form, notice_period: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary">
            <option value="15_days">15 Days</option>
            <option value="1_month">1 Month</option>
            <option value="2_months">2 Months</option>
            <option value="3_months">3 Months</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">CV (PDF, max 5MB)</label>
        <input type="file" accept="application/pdf" onChange={e => setCv(e.target.files?.[0] || null)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-primary" required />
        {cv && <p className="text-xs text-slate-500 mt-1">{cv.name} ({(cv.size / 1024 / 1024).toFixed(1)} MB)</p>}
      </div>
      <button type="submit" disabled={submitting} className="inline-flex items-center justify-center rounded-xl bg-red-700 px-6 py-3 text-sm font-semibold text-white hover:bg-red-800 transition-colors disabled:opacity-50">
        {submitting ? 'Submitting...' : 'Submit Application'}
      </button>
    </form>
  );
}
