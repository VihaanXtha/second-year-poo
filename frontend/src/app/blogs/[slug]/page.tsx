import { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import BlogTeaser from "@/components/sections/BlogTeaser";
import { ShareRow } from "@/components/sections/ShareRow";
import { apiClient, BlogPost } from "@/lib/api";

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await apiClient<BlogPost>(`/blog/slug/${slug}`);
    return {
      title: `${post.title} | Circuit Bazaar`,
      description: post.body.slice(0, 160),
      openGraph: {
        title: post.title,
        description: post.body.slice(0, 160),
        type: "article",
        images: post.cover_image ? [{ url: post.cover_image, width: 1200, height: 630, alt: post.title }] : undefined,
      },
    };
  } catch {
    return { title: "Post Not Found | Circuit Bazaar" };
  }
}

const DEFAULT_BLOG_IMAGE = 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80';

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  let post: BlogPost;
  try {
    post = await apiClient<BlogPost>(`/blog/slug/${slug}`);
  } catch {
    notFound();
  }

  const headersList = await headers();
  const host = headersList.get('host') || 'circuitbazaar.com';
  const protocol = headersList.get('x-forwarded-proto') || 'https';
  const url = `${protocol}://${host}/blogs/${post.slug}`;

  const paragraphs = post.body.split('\n\n').filter(Boolean);
  const coverImage = post.cover_image || DEFAULT_BLOG_IMAGE;

  return (
    <div className="min-h-screen bg-white">
      <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/blogs" className="inline-flex items-center text-sm text-slate-500 hover:text-red-700 mb-6">
          ← Back to Blogs
        </Link>
        {post.category && (
          <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 mb-4">
            {post.category}
          </span>
        )}
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">{post.title}</h1>
        <div className="flex items-center gap-3 text-sm text-slate-500 mb-8">
          {post.author && <span>{post.author}</span>}
          {post.author && post.published_at && <span aria-hidden="true">•</span>}
          {post.published_at && <span>{new Date(post.published_at).toLocaleDateString()}</span>}
          {post.body && <span aria-hidden="true">•</span>}
          {post.body && <span>{Math.max(1, Math.ceil(post.body.length / 200))} min read</span>}
        </div>
        <img
          src={coverImage}
          alt={post.title}
          className="w-full h-64 sm:h-80 object-cover rounded-2xl mb-10"
        />
        <div className="prose prose-slate max-w-none">
          {paragraphs.map((paragraph, idx) => (
            <p key={idx} className="text-slate-700 leading-relaxed mb-6 text-base sm:text-lg">
              {paragraph}
            </p>
          ))}
        </div>
        <ShareRow url={url} title={post.title} />
        <div className="mt-12 border-t border-slate-200 pt-8">
          <BlogTeaser />
        </div>
      </article>
    </div>
  );
}
