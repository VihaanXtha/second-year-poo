export const dynamic = 'force-dynamic';

import { Metadata } from "next";
import { apiClient, BlogPost } from "@/lib/api";

export const metadata: Metadata = {
  title: "Blogs | Circuit Bazaar",
  description: "Latest articles on PC building, hardware reviews, and Nepal tech market insights.",
};

export default async function BlogsPage() {
  const data = await apiClient<{ posts: BlogPost[] }>('/blog');
  const posts = data.posts || [];

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
                  Guide
                </span>
                <span className="text-xs text-slate-400">{post.published_at ? new Date(post.published_at).toLocaleDateString() : ''}</span>
              </div>
              <h2 className="text-xl font-semibold text-slate-900 mb-3 group-hover:text-red-700 transition-colors">
                {post.title}
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">{post.excerpt || post.body.slice(0, 150)}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">{post.published_at ? `${Math.ceil((post.body.length - 150) / 200)} min read` : ''}</span>
                <span className="text-sm font-medium text-red-700 group-hover:underline">Read more</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
