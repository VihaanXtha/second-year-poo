const posts = [
  {
    title: "How to Choose the Right GPU for 4K Gaming in Nepal",
    excerpt:
      "Power prices and availability vary. Here&apos;s how to pick the best graphics card for your budget and 4K monitor.",
    date: "Aug 28, 2024",
    readTime: "6 min read",
    tag: "Guides",
  },
  {
    title: "ESP32 vs. Raspberry Pi Pico: Which Board for Your IoT Project?",
    excerpt:
      "Both boards have their strengths. We break down connectivity, community support, and Nepal-specific availability.",
    date: "Aug 15, 2024",
    readTime: "8 min read",
    tag: "IoT",
  },
  {
    title: "Setting Up a Home Lab on a Budget",
    excerpt:
      "You don&apos;t need enterprise gear to learn networking. Start with these affordable components available today.",
    date: "Jul 30, 2024",
    readTime: "5 min read",
    tag: "Homelab",
  },
];

export default function BlogTeaser() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              From the Blog
            </h2>
            <p className="mt-2 text-slate-600">
              Nepal-specific hardware guides, buying tips, and project inspiration.
            </p>
          </div>
          <a
            href="#"
            className="hidden sm:inline-flex items-center text-sm font-semibold text-red-600 hover:text-red-700"
          >
            View all posts
            <span className="material-symbols-outlined ml-1 text-[18px]">
              arrow_forward
            </span>
          </a>
        </div>
        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.title}
              className="group rounded-2xl bg-slate-50 overflow-hidden ring-1 ring-slate-200 hover:ring-slate-300 transition-all"
            >
              <div className="aspect-[16/9] bg-slate-200">
                <div className="flex h-full items-center justify-center text-slate-400">
                  <span className="material-symbols-outlined text-[48px]">
                    article
                  </span>
                </div>
              </div>
              <div className="p-6">
                <span className="inline-block rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-600">
                  {post.tag}
                </span>
                <h3 className="mt-3 text-lg font-semibold text-slate-900 group-hover:text-red-600 transition-colors">
                  {post.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  {post.excerpt}
                </p>
                <div className="mt-4 flex items-center gap-3 text-xs text-slate-500">
                  <span>{post.date}</span>
                  <span className="h-1 w-1 rounded-full bg-slate-300" />
                  <span>{post.readTime}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-8 sm:hidden text-center">
          <a
            href="#"
            className="inline-flex items-center text-sm font-semibold text-red-600 hover:text-red-700"
          >
            View all posts
            <span className="material-symbols-outlined ml-1 text-[18px]">
              arrow_forward
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
