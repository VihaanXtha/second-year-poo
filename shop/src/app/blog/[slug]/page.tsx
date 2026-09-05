import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const posts: Record<string, { title: string; category: string; date: string; readTime: string; image: string; content: string[] }> = {
  "rtx-50-series-first-impressions": {
    title: "RTX 50 Series: First Impressions for Nepal Buyers",
    category: "Guides",
    date: "Sep 3, 2026",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=1200&q=80",
    content: [
      "NVIDIA&apos;s RTX 50 series brings significant architectural improvements. For Nepal buyers, the key considerations remain PSU headroom, local stock availability, and warranty support.",
      "If you are upgrading from an RTX 20/30 series card, check your power supply and case clearance first. The new cards demand more wattage and physical space.",
      "We recommend buying from verified local vendors who can validate stock and provide invoice-backed warranty claims.",
    ],
  },
  "building-a-low-power-nas-on-a-budget": {
    title: "Building a Low-Power NAS on a Budget",
    category: "Builds",
    date: "Aug 25, 2026",
    readTime: "9 min read",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    content: [
      "A NAS build does not need high-end CPUs. Focus on efficient Celeron/Pentium or low-TDP Ryzen options with ECC support if your workload demands data integrity.",
      "Use NAS-grade HDDs and avoid SMR drives for write-heavy workloads. Plan for two drives minimum so you can enable mirroring from day one.",
      "Power consumption matters if you plan to run the NAS 24/7. Choose an efficient PSU and enable disk hibernation when possible.",
    ],
  },
  "esp32-lora-agricultural-sensors": {
    title: "ESP32 + LoRa Agricultural Sensors",
    category: "IoT",
    date: "Aug 18, 2026",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80",
    content: [
      "LoRa is ideal for farm deployments where Wi-Fi coverage is limited or non-existent. Pair an ESP32 or dedicated LoRa module with soil moisture and NPK sensors.",
      "Keep your node solar-powered with a proper LiFePO4 charging circuit. Size the panel and battery for the worst-case winter sunlight window in your region.",
      "Design your payload carefully to stay within duty-cycle limits if you use the 868MHz band in Nepal.",
    ],
  },
  "choosing-your-first-gaming-laptop": {
    title: "Choosing Your First Gaming Laptop in 2026",
    category: "Guides",
    date: "Aug 10, 2026",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=1200&q=80",
    content: [
      "Start with the GPU tier that matches your display. 1080p 144Hz gaming does not need an RTX 4080. Match the laptop to the games you actually play.",
      "Check service-center availability in your city before buying. A cheaper laptop with no local support is a bad long-term value.",
      "Prioritize RAM upgradeability and storage expansion. A thin chassis is nice, but a dead-end upgrade path is not.",
    ],
  },
};

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return Object.keys(posts).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = posts[slug];
  if (!post) return { title: "Post Not Found | Circuit Bazaar" };
  return {
    title: `${post.title} | Circuit Bazaar`,
    description: post.content[0],
    openGraph: { title: post.title, description: post.content[0], type: "article", images: [{ url: post.image }] },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = posts[slug];

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/blog" className="inline-flex items-center text-sm text-slate-500 hover:text-red-700 mb-6">← Back to Blog</Link>
        <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 mb-4">{post.category}</span>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">{post.title}</h1>
        <div className="flex items-center gap-3 text-sm text-slate-500 mb-8">
          <span>{post.date}</span>
          <span aria-hidden="true">•</span>
          <span>{post.readTime}</span>
        </div>
        <img src={post.image} alt={post.title} className="w-full h-64 sm:h-80 object-cover rounded-2xl mb-10" />
        <div className="prose prose-slate max-w-none">
          {post.content.map((paragraph, idx) => (
            <p key={idx} className="text-slate-700 leading-relaxed mb-6 text-base sm:text-lg">{paragraph}</p>
          ))}
        </div>
      </article>
      <Footer />
    </main>
  );
}
