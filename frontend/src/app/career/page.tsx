export const dynamic = 'force-dynamic';

import { Metadata } from "next";
import { apiClient, CareerPost } from "@/lib/api";

export const metadata: Metadata = {
  title: "Careers | Circuit Bazaar",
  description: "Join the Circuit Bazaar team and help build Nepal's most trusted hardware marketplace.",
};

export default async function CareerPage() {
  const data = await apiClient<{ posts: CareerPost[] }>('/careers');
  const roles = (data.posts || []).filter((p) => p.is_published);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Careers at Circuit Bazaar</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            We are a small, obsessed team trying to make buying and selling hardware in Nepal actually trustworthy. If that sounds like a problem worth solving, we should talk.
          </p>
        </div>

        <div className="space-y-4">
          {roles.map((role) => {
            const mailtoHref = `mailto:careers@circuitbazaar.com?subject=Application%20for%20${encodeURIComponent(role.title)}`;
            return (
              <div
                key={role.id}
                className="group rounded-2xl border border-slate-200 bg-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 hover:shadow-xl hover:shadow-red-500/5"
              >
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-xl font-semibold text-slate-900 group-hover:text-red-700 transition-colors">
                      {role.title}
                    </h2>
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                      Full-time
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{role.description}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span>{role.requirements?.[0] || 'Engineering'}</span>
                    <span aria-hidden="true">•</span>
                    <span>Kathmandu</span>
                  </div>
                </div>
                <a
                  href={mailtoHref}
                  className="inline-flex items-center justify-center rounded-xl bg-red-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-800 transition-colors"
                >
                  Apply
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
