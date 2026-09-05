import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const posts = [
  { slug: "rtx-50-series-first-impressions", title: "RTX 50 Series: First Impressions for Nepal Buyers", category: "Guides", date: "Sep 3, 2026", readTime: "7 min read", image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=1200&q=80" },
  { slug: "building-a-low-power-nas-on-a-budget", title: "Building a Low-Power NAS on a Budget", category: "Builds", date: "Aug 25, 2026", readTime: "9 min read", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80" },
  { slug: "esp32-lora-agricultural-sensors", title: "ESP32 + LoRa Agricultural Sensors", category: "IoT", date: "Aug 18, 2026", readTime: "6 min read", image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80" },
  { slug: "choosing-your-first-gaming-laptop", title: "Choosing Your First Gaming Laptop in 2026", category: "Guides", date: "Aug 10, 2026", readTime: "5 min read", image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=1200&q=80" },
];

export const metadata = {
  title: "Blog | Circuit Bazaar",
};

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">Blog</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {posts.map((post) => (
            <a key={post.slug} href={`/blog/${post.slug}`} className="group rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
              <img src={post.image} alt={post.title} className="w-full h-48 object-cover bg-slate-100" />
              <div className="p-4">
                <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 mb-2">{post.category}</span>
                <h2 className="text-base font-semibold text-slate-900 line-clamp-2 group-hover:text-red-700">{post.title}</h2>
                <p className="text-xs text-slate-500 mt-2">{post.date} · {post.readTime}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
      <Footer />
    </main>
  );
}
