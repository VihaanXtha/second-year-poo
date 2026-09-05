const testimonials = [
  {
    quote:
      "Finally a marketplace where the specs match the box. Bought an RTX 4080 from Neo Gear Tech and it arrived with the official seal intact.",
    author: "Aayush Shrestha",
    role: "Software Engineer, Kathmandu",
  },
  {
    quote:
      "As a student, I needed an ESP32 kit for my thesis. Circuit Emporium shipped the exact module with datasheets and a 6-month replacement warranty.",
    author: "Priya Maharjan",
    role: "Electronics Student, Pulchowk",
  },
  {
    quote:
      "We outfit entire computer labs through Circuit Bazaar. Bulk pricing, verified stock, and consistent delivery across Nepal.",
    author: "Rajesh Gurung",
    role: "IT Director, Pokhara",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            Trusted by builders across Nepal
          </h2>
          <p className="mt-2 text-slate-600">
            Don&apos;t take our word for it — hear from the community.
          </p>
        </div>
        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.author}
              className="rounded-2xl bg-white p-8 ring-1 ring-slate-200"
            >
              <div className="flex items-center gap-1 text-amber-500">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span
                    key={i}
                    className="material-symbols-outlined text-[20px]"
                  >
                    star
                  </span>
                ))}
              </div>
              <blockquote className="mt-4 text-slate-700 leading-relaxed">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div className="mt-6 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600">
                  {t.author
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {t.author}
                  </p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
