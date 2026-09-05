export function formatNpr(value: number): string {
  if (!Number.isFinite(value)) return 'Rs. 0';
  return `Rs. ${value.toLocaleString('en-IN')}`;
}

export function formatNprCompact(value: number): string {
  if (!Number.isFinite(value)) return 'Rs. 0';
  if (value >= 100000) {
    return `Rs. ${(value / 100000).toFixed(value >= 1000000 ? 2 : 1)}L`;
  }
  if (value >= 1000) {
    return `Rs. ${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`;
  }
  return `Rs. ${value.toLocaleString('en-IN')}`;
}

export function discountPercent(original: number, price: number): number {
  if (original <= 0 || price >= original) return 0;
  return Math.round(((original - price) / original) * 100);
}

export function averageRating(rating: number, count: number): string {
  if (count === 0) return '—';
  return `${rating.toFixed(1)} (${count})`;
}

export function starArray(rating: number): number[] {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.25 && rating - full < 0.75 ? [1] : rating - full >= 0.75 ? [1] : [];
  const half = rating - full >= 0.25 && rating - full < 0.75 ? [0.5] : rating - full >= 0.75 ? [] : [];
  const empty = 5 - full - (hasHalf.length ? 1 : 0) - (half.length ? 1 : 0);
  const result = [...Array(full).fill(1)];
  if (rating - full >= 0.25 && rating - full < 0.75) result.push(0.5);
  else if (rating - full >= 0.75) result.push(1);
  result.push(...Array(Math.max(0, 5 - result.length)).fill(0));
  return result.slice(0, 5);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), ms);
  };
}

export function generateSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
