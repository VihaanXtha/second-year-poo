import ScrollReveal from "@/components/ScrollReveal";

const stats = [
  { value: "500+", label: "Verified Products" },
  { value: "50+", label: "Local Vendors" },
  { value: "10,000+", label: "Happy Customers" },
  { value: "99.8%", label: "Satisfaction Rate" },
];

export default function StatsBar() {
  return (
    <section className="relative overflow-hidden bg-slate-900 py-20">
      <div className="absolute inset-0 -z-10 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(220,38,38,0.2)_0%,transparent_50%)]" />
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <ScrollReveal key={stat.label} direction="up" delay={i * 100}>
              <div className="text-center group">
                <span className="block text-4xl font-bold text-white group-hover:text-red-400 transition-colors duration-300">
                  {stat.value}
                </span>
                <span className="mt-2 block text-sm text-slate-400 group-hover:text-slate-300 transition-colors duration-300">
                  {stat.label}
                </span>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
