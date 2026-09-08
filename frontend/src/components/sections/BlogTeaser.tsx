'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ScrollReveal from "@/components/ScrollReveal";
import { apiClient, BlogPost } from '@/lib/api';

export default function BlogTeaser() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    apiClient<{ posts: BlogPost[] }>('/blog')
      .then((data) => {
        if (!cancelled) setPosts(data.posts?.slice(0, 3) || []);
      })
      .catch((e) => console.error(e))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal direction="up">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
                From the Blog
              </h2>
              <p className="mt-2 text-slate-600">
                Nepal-specific hardware guides, buying tips, and project inspiration.
              </p>
            </div>
            <Link
              href="/blogs"
              className="hidden sm:inline-flex items-center text-sm font-semibold text-red-600 hover:text-red-700"
            >
              View all posts
              <span className="material-symbols-outlined ml-1 text-[18px]">
                arrow_forward
              </span>
            </Link>
          </div>
        </ScrollReveal>
        {loading ? (
          <div className="mt-10 grid gap-8 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl bg-slate-50 overflow-hidden ring-1 ring-slate-200 h-64 animate-pulse" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <ScrollReveal direction="up" delay={150}>
            <div className="mt-10 rounded-2xl bg-slate-50 border border-slate-200 p-12 text-center">
              <span className="material-symbols-outlined text-[48px] text-slate-300 mb-4 block">article</span>
              <p className="text-sm text-slate-500">No blog posts yet. Check back soon for hardware guides and buying tips.</p>
            </div>
          </ScrollReveal>
        ) : (
          <div className="mt-10 grid gap-8 lg:grid-cols-3">
            {posts.map((post, i) => (
              <ScrollReveal key={post.id} direction="up" delay={i * 100}>
                <article
                  className="group rounded-2xl bg-slate-50 overflow-hidden ring-1 ring-slate-200 hover:ring-slate-300 transition-all hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1"
                >
                  <div className="aspect-[16/9] bg-slate-200 img-zoom">
                    {post.cover_image ? (
                      <img src={post.cover_image} alt={post.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-400">
                        <span className="material-symbols-outlined text-[48px]">
                          article
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <span className="inline-block rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-600">
                      {post.category || 'Guide'}
                    </span>
                    <h3 className="mt-3 text-lg font-semibold text-slate-900 group-hover:text-red-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                      {post.body ? post.body.slice(0, 120) : ''}
                    </p>
                    <div className="mt-4 flex items-center gap-3 text-xs text-slate-500">
                      <span>{post.published_at ? new Date(post.published_at).toLocaleDateString() : ''}</span>
                      <span className="h-1 w-1 rounded-full bg-slate-300" />
                      <span>{post.published_at && post.body ? `${Math.max(1, Math.ceil((post.body.length - 120) / 200))} min read` : ''}</span>
                    </div>
                  </div>
                </article>
              </ScrollReveal>
            ))}
          </div>
        )}
        <div className="mt-8 sm:hidden text-center">
          <Link
            href="/blogs"
            className="inline-flex items-center text-sm font-semibold text-red-600 hover:text-red-700"
          >
            View all posts
            <span className="material-symbols-outlined ml-1 text-[18px]">
              arrow_forward
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
