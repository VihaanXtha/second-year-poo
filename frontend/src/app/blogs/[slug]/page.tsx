import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import BlogTeaser from "@/components/sections/BlogTeaser";

const posts: Record<
  string,
  {
    title: string;
    category: string;
    date: string;
    readTime: string;
    image: string;
    content: string[];
    author: string;
  }
> = {
  "how-to-choose-the-right-gpu-for-4k-gaming-in-nepal": {
    title: "How to Choose the Right GPU for 4K Gaming in Nepal",
    category: "Guides",
    date: "Sep 2, 2026",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=1200&q=80",
    author: "Aarav Shrestha",
    content: [
      "4K gaming in Nepal comes with unique constraints: power availability, room temperature, and import pricing. Start with the GPU that matches your display and PSU reality, not just the benchmark number.",
      "If you game at 60Hz, an RTX 4070 Ti or RX 7800 XT is often enough. For 144Hz 4K, plan for an RTX 4080 Super or higher. Always check PSU wattage and physical clearance before buying.",
      "Local stock, warranty validity, and after-sales support matter more than saving a few thousand rupees on an unknown import.",
    ],
  },
  "the-state-of-pc-components-supply-in-kathmandu": {
    title: "The State of PC Components Supply in Kathmandu",
    category: "Market",
    date: "Aug 28, 2026",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1555617996-f7d6d3f0a4b0?auto=format&fit=crop&w=1200&q=80",
    author: "Sneha Maharjan",
    content: [
      "Import timelines for GPUs, CPUs, and storage have improved, but grey-market risk remains high. Buyers should prefer verified vendors with traceable supply chains.",
      "Stock transparency is now a competitive advantage. Vendors who show real inventory levels convert better and receive fewer support tickets.",
      "We are seeing more brands authorize Nepali resellers directly, which shortens warranty claims and improves return logistics.",
    ],
  },
  "building-a-hackintosh-on-a-budget-parts-list-tips": {
    title: "Building a Hackintosh on a Budget: Parts List & Tips",
    category: "Builds",
    date: "Aug 21, 2026",
    readTime: "10 min read",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    author: "Bibek Adhikari",
    content: [
      "A Hackintosh build in Nepal works best when you avoid cutting-edge Wi-Fi cards and stick to motherboard ports that macOS supports natively.",
      "Focus on CPU and RAM compatibility first, then add a compatible GPU if you need display acceleration. Many budget builds run fine on integrated graphics.",
      "Keep a bootable USB backup and document your EFI. It saves hours when macOS updates and breaks minor kexts.",
    ],
  },
  "esewa-vs-khalti-which-payment-gateway-fits-your-hardware-store": {
    title: "eSewa vs Khalti: Which Payment Gateway Fits Your Hardware Store?",
    category: "Business",
    date: "Aug 15, 2026",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1200&q=80",
    author: "Priya Rai",
    content: [
      "For hardware stores, settlement speed and dispute resolution matter more than branding. eSewa typically settles faster for standard transactions.",
      "Khalti has stronger mobile wallet adoption in younger demographics. If your catalog targets students and first-time builders, Khalti can lift conversion.",
      "The best setup is usually both, with COD as the fallback. Track failure rates by method and optimize the weakest one first.",
    ],
  },
  "esp32-vs-arduino-which-board-for-your-iot-prototype": {
    title: "ESP32 vs Arduino: Which Board for Your IoT Prototype?",
    category: "IoT",
    date: "Aug 10, 2026",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80",
    author: "Nishan Thapa",
    content: [
      "Choose ESP32 when you need Wi-Fi, BLE, or decent CPU power for sensor fusion. Choose Arduino Uno when you want simplicity, stable analog inputs, and beginner-friendly docs.",
      "For Nepal-based IoT prototyping, availability matters. Check local vendor stock before locking a board into a production design.",
      "If you need long-term maintenance, favor boards with larger communities and better Espressif/Arduino ecosystem support.",
    ],
  },
  "why-verified-vendor-status-increases-sales-by-3x": {
    title: "Why Verified Vendor Status Increases Sales by 3x",
    category: "Vendors",
    date: "Aug 4, 2026",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80",
    author: "Rojan Shahi",
    content: [
      "Buyers on Circuit Bazaar consistently choose verified vendors for high-value items like GPUs, motherboards, and enterprise networking gear.",
      "Verification is not just a badge. It forces sellers to publish structured specs, real stock levels, and clear warranty terms.",
      "Vendors who complete their store profile and respond within a few hours see measurably higher conversion and lower order-cancellation rates.",
    ],
  },
};

type Props = {
  params: Promise<{ slug: string }>;
};

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
    openGraph: {
      title: post.title,
      description: post.content[0],
      type: "article",
      images: [{ url: post.image, width: 1200, height: 630, alt: post.title }],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = posts[slug];

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/blogs" className="inline-flex items-center text-sm text-slate-500 hover:text-red-700 mb-6">
          ← Back to Blogs
        </Link>
        <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 mb-4">
          {post.category}
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">{post.title}</h1>
        <div className="flex items-center gap-3 text-sm text-slate-500 mb-8">
          <span>{post.author}</span>
          <span aria-hidden="true">•</span>
          <span>{post.date}</span>
          <span aria-hidden="true">•</span>
          <span>{post.readTime}</span>
        </div>
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-64 sm:h-80 object-cover rounded-2xl mb-10"
        />
        <div className="prose prose-slate max-w-none">
          {post.content.map((paragraph, idx) => (
            <p key={idx} className="text-slate-700 leading-relaxed mb-6 text-base sm:text-lg">
              {paragraph}
            </p>
          ))}
        </div>
        <div className="mt-12 border-t border-slate-200 pt-8">
          <BlogTeaser />
        </div>
      </article>
      <Footer />
    </div>
  );
}
