export const dynamic = 'force-dynamic';

import { Metadata } from "next";
import { apiClient, JobPosting } from "@/lib/api";
import { JobPostingCard } from "@/components/sections/JobPostingCard";

export const metadata: Metadata = {
  title: "Careers | Circuit Bazaar",
  description: "Join the Circuit Bazaar team and help build Nepal's most trusted hardware marketplace.",
};

export default async function CareerPage() {
  let postings: JobPosting[] = [];
  let fetchError = false;
  try {
    const data = await apiClient<{ postings: JobPosting[] }>('/job-postings');
    postings = data.postings || [];
  } catch {
    fetchError = true;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Careers at Circuit Bazaar</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            We are a small, obsessed team trying to make buying and selling hardware in Nepal actually trustworthy. If that sounds like a problem worth solving, we should talk.
          </p>
        </div>

        {fetchError && (
          <div className="rounded-2xl bg-red-50 border border-red-200 p-6 text-center">
            <p className="text-sm text-red-700">Unable to load job postings right now. Please try again later.</p>
          </div>
        )}

        <div className="space-y-4">
          {postings.map((role) => (
            <JobPostingCard key={role.id} posting={role} />
          ))}
        </div>
      </div>
    </div>
  );
}
