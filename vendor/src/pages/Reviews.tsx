import React, { useEffect, useMemo, useState } from 'react';
import type { ApiFetch } from '../App';
import {
  Card,
  EmptyState,
  ErrorBanner,
  PageHeader,
  SelectField,
  Spinner,
  formatDate,
} from '../components/UI';
import type { VendorReview } from '../types';

interface ReviewsProps {
  apiFetch: ApiFetch;
}

export function Reviews({ apiFetch }: ReviewsProps) {
  const [reviews, setReviews] = useState<VendorReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState('all');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await apiFetch<any>('/vendor/reviews');
      const list = Array.isArray(raw) ? raw : raw?.data ?? [];
      setReviews(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (rating === 'all') return reviews;
    return reviews.filter((r) => Math.round(r.rating) === Number(rating));
  }, [reviews, rating]);

  const avg = useMemo(() => {
    if (!reviews.length) return 0;
    return reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviews.length;
  }, [reviews]);

  const counts = useMemo(() => {
    const c = [0, 0, 0, 0, 0];
    reviews.forEach((r) => {
      const idx = Math.max(0, Math.min(4, Math.round(Number(r.rating)) - 1));
      c[idx] = (c[idx] || 0) + 1;
    });
    return c;
  }, [reviews]);

  return (
    <div>
      <PageHeader
        title="Reviews"
        description="Read what customers are saying about your products."
      />

      {error && <div className="mb-4"><ErrorBanner message={error} /></div>}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card title="Average rating" subtitle="Across all reviews">
          <div className="flex items-center gap-4">
            <div className="text-5xl font-bold text-slate-900">{avg.toFixed(1)}</div>
            <div>
              <Stars value={avg} />
              <div className="mt-1 text-sm text-slate-500">{reviews.length} reviews</div>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2" title="Rating distribution" subtitle="Histogram of star ratings">
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star, idx) => {
              const count = counts[5 - star] || 0;
              const pct = reviews.length ? (count / reviews.length) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-3">
                  <div className="flex w-12 items-center gap-1 text-sm font-medium text-slate-600">
                    {star}
                    <span className="material-symbols-outlined text-base text-amber-500">star</span>
                  </div>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-amber-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="w-10 text-right text-sm text-slate-500">{count}</div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <Card
          title={`Reviews (${filtered.length})`}
          subtitle="Customer feedback"
          action={
            <div className="w-48">
              <SelectField
                label="Filter"
                value={rating}
                onChange={setRating}
                options={[
                  { value: 'all', label: 'All ratings' },
                  { value: '5', label: '5 stars' },
                  { value: '4', label: '4 stars' },
                  { value: '3', label: '3 stars' },
                  { value: '2', label: '2 stars' },
                  { value: '1', label: '1 star' },
                ]}
              />
            </div>
          }
        >
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <Spinner size="lg" />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon="reviews"
              title="No reviews yet"
              description="Customer reviews will appear here once they leave feedback."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filtered.map((r) => (
                <div
                  key={r.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-700">
                        {(r.customer_name || 'C').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">
                          {r.customer_name || 'Customer'}
                        </div>
                        <div className="text-xs text-slate-400">{formatDate(r.created_at)}</div>
                      </div>
                    </div>
                    <Stars value={Number(r.rating)} small />
                  </div>
                  <div className="mt-3 text-sm font-medium text-slate-700">{r.product_name}</div>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Stars({ value, small = false }: { value: number; small?: boolean }) {
  const size = small ? 'text-base' : 'text-lg';
  const stars = [1, 2, 3, 4, 5].map((i) => {
    const filled = i <= Math.round(value);
    return (
      <span
        key={i}
        className={`material-symbols-outlined ${size} ${
          filled ? 'text-amber-500' : 'text-slate-200'
        }`}
        style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}` }}
      >
        star
      </span>
    );
  });
  return <div className="flex">{stars}</div>;
}