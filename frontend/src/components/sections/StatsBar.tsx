const stats = [
  { value: "500+", label: "Verified Products" },
  { value: "50+", label: "Local Vendors" },
  { value: "10,000+", label: "Happy Customers" },
  { value: "99.8%", label: "Satisfaction Rate" },
];

export default function StatsBar() {
  return (
    <section className="bg-slate-900 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <span className="block text-3xl font-bold text-white">
                {stat.value}
              </span>
              <span className="mt-1 block text-sm text-slate-400">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
