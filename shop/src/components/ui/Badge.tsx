export function Badge({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'red' | 'green' }) {
  const styles = {
    default: 'bg-slate-100 text-slate-700',
    red: 'bg-red-50 text-red-700',
    green: 'bg-green-50 text-green-700',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[variant]}`}>
      {children}
    </span>
  );
}
