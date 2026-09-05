import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers | Circuit Bazaar",
  description: "Join the Circuit Bazaar team and help build Nepal's most trusted hardware marketplace.",
};

export default function CareerPage() {
  const roles = [
    {
      title: "Frontend Engineer",
      department: "Engineering",
      location: "Kathmandu / Remote",
      type: "Full-time",
      description: "Build polished customer and vendor experiences with Next.js, React, and TypeScript.",
    },
    {
      title: "Backend Engineer",
      department: "Engineering",
      location: "Kathmandu / Remote",
      type: "Full-time",
      description: "Design Laravel APIs, database schemas, and integration pipelines for payments and logistics.",
    },
    {
      title: "Product Designer",
      department: "Design",
      location: "Kathmandu",
      type: "Full-time",
      description: "Own the end-to-end UX for shop, admin, and vendor flows, from research to production polish.",
    },
    {
      title: "Vendor Success Manager",
      department: "Operations",
      location: "Kathmandu",
      type: "Full-time",
      description: "Onboard new vendors, run verification programs, and improve seller satisfaction and retention.",
    },
    {
      title: "Content & Community Writer",
      department: "Marketing",
      location: "Remote",
      type: "Contract",
      description: "Write buying guides, launch announcements, vendor spotlights, and technical documentation.",
    },
  ];

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
          {roles.map((role, idx) => {
            const mailtoHref = `mailto:careers@circuitbazaar.com?subject=Application%20for%20${encodeURIComponent(role.title)}`;
            return (
            <div
              key={idx}
              className="group rounded-2xl border border-slate-200 bg-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 hover:shadow-xl hover:shadow-red-500/5"
            >
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-xl font-semibold text-slate-900 group-hover:text-red-700 transition-colors">
                    {role.title}
                  </h2>
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                    {role.type}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-2">{role.description}</p>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span>{role.department}</span>
                  <span aria-hidden="true">•</span>
                  <span>{role.location}</span>
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
