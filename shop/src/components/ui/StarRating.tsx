export function StarRating({ rating, count }: { rating: number; count?: number }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex text-red-700">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className="material-symbols-outlined text-[16px]">
            {star <= Math.round(rating) ? 'star' : 'star_border'}
          </span>
        ))}
      </div>
      {count !== undefined && <span className="text-xs text-slate-500">({count})</span>}
    </div>
  );
}
