import Link from "next/link";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { apiClient, JobPosting } from "@/lib/api";
import { ApplyForm } from "@/components/sections/ApplyForm";

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await apiClient<JobPosting>(`/job-postings/${slug}`);
    return {
      title: `${post.title} | Careers | Circuit Bazaar`,
      description: post.description,
      openGraph: {
        title: `${post.title} | Careers | Circuit Bazaar`,
        description: post.description,
        type: "website",
      },
    };
  } catch {
    return { title: "Career | Circuit Bazaar" };
  }
}

export default async function CareerDetailPage({ params }: Props) {
  const { slug } = await params;
  let posting: JobPosting;
  try {
    posting = await apiClient<JobPosting>(`/job-postings/${slug}`);
  } catch {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Role not found</h1>
          <Link href="/career" className="text-red-700 font-medium hover:underline">
            View all careers
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/career" className="inline-flex items-center text-sm text-slate-500 hover:text-red-700 mb-6">
          ← Back to Careers
        </Link>
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 mb-4">
          {posting.employment_type}
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">{posting.title}</h1>
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mb-8">
          <span>{posting.department}</span>
          <span aria-hidden="true">•</span>
          <span>{posting.location}</span>
          <span aria-hidden="true">•</span>
          <span>{posting.employment_type}</span>
        </div>
        <p className="text-slate-700 leading-relaxed mb-8 text-base sm:text-lg">{posting.description}</p>

        {posting.responsibilities && (
          <>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">What you will do</h2>
            <p className="text-slate-700 leading-relaxed mb-8 text-base sm:text-lg whitespace-pre-line">{posting.responsibilities}</p>
          </>
        )}

        {posting.requirements && posting.requirements.length > 0 && (
          <>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">Requirements</h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-700 mb-8">
              {posting.requirements.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </>
        )}

        {posting.benefits && posting.benefits.length > 0 && (
          <>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">Benefits</h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-700 mb-10">
              {posting.benefits.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </>
        )}

        {posting.application_deadline && (
          <div className="mb-8 rounded-xl bg-slate-50 border border-slate-200 p-4 inline-flex items-center gap-2 text-sm">
            <span className="font-medium text-slate-700">Application deadline:</span>
            <span className="text-slate-900">{new Date(posting.application_deadline).toLocaleDateString()}</span>
          </div>
        )}

        <ApplyForm posting={posting} />
      </article>
      <Footer />
    </div>
  );
}
