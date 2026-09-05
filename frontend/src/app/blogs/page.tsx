import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blogs | Circuit Bazaar",
  description: "Latest articles on PC building, hardware reviews, and Nepal tech market insights.",
};

export default function BlogsPage() {
  const posts = [
    {
      id: 1,
      title: "How to Choose the Right GPU for 4K Gaming in Nepal",
      category: "Guides",
      excerpt: "From RTX 4070 to RTX 4090, we break down real-world performance, power requirements, and pricing for the Nepali market.",
      date: "Sep 2, 2026",
      readTime: "8 min read",
    },
    {
      id: 2,
      title: "The State of PC Components Supply in Kathmandu",
      category: "Market",
      excerpt: "An inside look at how import timelines, grey market risks, and verified vendor networks are changing hardware availability.",
      date: "Aug 28, 2026",
      readTime: "6 min read",
    },
    {
      id: 3,
      title: "Building a Hackintosh on a Budget: Parts List & Tips",
      category: "Builds",
      excerpt: "A no-compromise macOS-compatible build using locally available parts, with compatibility notes and troubleshooting tips.",
      date: "Aug 21, 2026",
      readTime: "10 min read",
    },
    {
      id: 4,
      title: "eSewa vs Khalti: Which Payment Gateway Fits Your Hardware Store?",
      category: "Business",
      excerpt: "Comparing settlement times, fees, and customer trust for Nepali ecommerce stores selling electronics.",
      date: "Aug 15, 2026",
      readTime: "5 min read",
    },
    {
      id: 5,
      title: "ESP32 vs Arduino: Which Board for Your IoT Prototype?",
      category: "IoT",
      excerpt: "When to reach for an ESP32-S3, and when a simpler Arduino Uno still makes more sense for sensor projects.",
      date: "Aug 10, 2026",
      readTime: "7 min read",
    },
    {
      id: 6,
      title: "Why Verified Vendor Status Increases Sales by 3x",
      category: "Vendors",
      excerpt: "Data from Circuit Bazaar vendors shows how verification badges, transparent stock, and structured specs convert browsers into buyers.",
      date: "Aug 4, 2026",
      readTime: "4 min read",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Blogs & Guides</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Hardware guides, market insights, build stories, and vendor tips from the Circuit Bazaar team.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article
              key={post.id}
              className="group rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:shadow-xl hover:shadow-red-500/5 hover:-translate-y-1"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">
                  {post.category}
                </span>
                <span className="text-xs text-slate-400">{post.date}</span>
              </div>
              <h2 className="text-xl font-semibold text-slate-900 mb-3 group-hover:text-red-700 transition-colors">
                {post.title}
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">{post.excerpt}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">{post.readTime}</span>
                <span className="text-sm font-medium text-red-700 group-hover:underline">Read more</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
