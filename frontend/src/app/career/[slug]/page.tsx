import Link from "next/link";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import type { Metadata } from "next";

const careers = [
  {
    slug: "frontend-engineer",
    title: "Frontend Engineer",
    department: "Engineering",
    location: "Kathmandu / Remote",
    type: "Full-time",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
    description:
      "Build polished customer and vendor experiences with Next.js, React, and TypeScript. You will own UI performance, accessibility, and design-system consistency across the storefront and portal.",
    requirements: [
      "3+ years of React experience in production",
      "Strong TypeScript and Next.js App Router skills",
      "Experience with performance budgets, Lighthouse, and Core Web Vitals",
      "Comfortable with design handoffs and component libraries",
    ],
    benefits: [
      "Remote-first with flexible hours",
      "Hardware allowance and tech budget",
      "Annual team retreats",
      "Learning stipend for conferences and courses",
    ],
  },
  {
    slug: "backend-engineer",
    title: "Backend Engineer",
    department: "Engineering",
    location: "Kathmandu / Remote",
    type: "Full-time",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
    description:
      "Design Laravel APIs, database schemas, and integration pipelines for payments, logistics, and vendor workflows. You will balance reliability with iteration speed.",
    requirements: [
      "4+ years of backend engineering experience",
      "Strong Laravel or similar MVC framework background",
      "Experience with MySQL, queues, caching, and APIs",
      "Understanding of payment and logistics integrations",
    ],
    benefits: [
      "Remote-first with flexible hours",
      "Hardware allowance and tech budget",
      "Annual team retreats",
      "Learning stipend for conferences and courses",
    ],
  },
  {
    slug: "product-designer",
    title: "Product Designer",
    department: "Design",
    location: "Kathmandu",
    type: "Full-time",
    image: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&w=1200&q=80",
    description:
      "Own the end-to-end UX for shop, admin, and vendor flows, from research and wireframes to production polish and design-system maintenance.",
    requirements: [
      "3+ years of product design experience",
      "Portfolio showing B2C or marketplace UX",
      "Proficiency in Figma and design systems",
      "Comfortable working with engineering on feasibility",
    ],
    benefits: [
      "In-office hybrid option",
      "Creative tooling stipend",
      "Team workshops and design critiques",
      "Flexible leave policy",
    ],
  },
  {
    slug: "vendor-success-manager",
    title: "Vendor Success Manager",
    department: "Operations",
    location: "Kathmandu",
    type: "Full-time",
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
    description:
      "Onboard new vendors, run verification programs, and improve seller satisfaction and retention. You are the main advocate for vendors inside the company.",
    requirements: [
      "2+ years in vendor success, account management, or ops",
      "Excellent communication in Nepali and English",
      "Comfortable with CRM-style workflows and data review",
      "Problem-solving mindset with follow-through",
    ],
    benefits: [
      "In-office hybrid option",
      "Transport and communication allowance",
      "Performance bonuses",
      "Health and wellness benefits",
    ],
  },
  {
    slug: "content-community-writer",
    title: "Content & Community Writer",
    department: "Marketing",
    location: "Remote",
    type: "Contract",
    image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80",
    description:
      "Write buying guides, launch announcements, vendor spotlights, and technical documentation. Help Circuit Bazaar sound like a knowledgeable local expert, not a generic brand.",
    requirements: [
      "2+ years of technical or lifestyle writing",
      "Interest in PC hardware, IoT, or networking",
      "Ability to explain specs without losing readers",
      "Consistent publishing rhythm and self-editing discipline",
    ],
    benefits: [
      "Fully remote",
      "Project-based flexibility",
      "Byline credit and portfolio pieces",
      "Hardware review units when available",
    ],
  },
];

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return careers.map((role) => ({ slug: role.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const role = careers.find((c) => c.slug === slug);
  if (!role) return { title: "Career | Circuit Bazaar" };
  return {
    title: `${role.title} | Careers | Circuit Bazaar`,
    description: role.description,
    openGraph: {
      title: `${role.title} | Circuit Bazaar`,
      description: role.description,
      type: "website",
      images: [{ url: role.image, width: 1200, height: 630, alt: role.title }],
    },
  };
}

export default async function CareerDetailPage({ params }: Props) {
  const { slug } = await params;
  const role = careers.find((c) => c.slug === slug);

  if (!role) {
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
          {role.type}
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">{role.title}</h1>
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mb-8">
          <span>{role.department}</span>
          <span aria-hidden="true">•</span>
          <span>{role.location}</span>
          <span aria-hidden="true">•</span>
          <span>{role.type}</span>
        </div>
        <img
          src={role.image}
          alt={role.title}
          className="w-full h-56 sm:h-72 object-cover rounded-2xl mb-10"
        />
        <p className="text-slate-700 leading-relaxed mb-8 text-base sm:text-lg">{role.description}</p>

        <h2 className="text-xl font-semibold text-slate-900 mb-3">What you will do</h2>
        <ul className="list-disc pl-5 space-y-2 text-slate-700 mb-8">
          {role.requirements.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <h2 className="text-xl font-semibold text-slate-900 mb-3">Benefits</h2>
        <ul className="list-disc pl-5 space-y-2 text-slate-700 mb-10">
          {role.benefits.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <a
          href={`mailto:careers@circuitbazaar.com?subject=Application%20for%20${encodeURIComponent(role.title)}`}
          className="inline-flex items-center justify-center rounded-xl bg-red-700 px-6 py-3 text-sm font-semibold text-white hover:bg-red-800 transition-colors"
        >
          Apply for this role
        </a>
      </article>
      <Footer />
    </div>
  );
}
