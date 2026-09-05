import { BlogPost } from '../types';

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'blog-1',
    slug: 'rtx-50-series-first-impressions',
    title: 'RTX 50-Series First Impressions: Worth the Upgrade?',
    excerpt:
      'We spent a week with the new RTX 5090 Founders Edition to see if the jump from the 40 series holds up for Nepali builders.',
    content:
      '<p>NVIDIA\'s RTX 50-series brings the new Blackwell architecture to the consumer market. In our testing, the RTX 5090 delivers roughly 22% higher raster performance than the RTX 4090 at 4K, while DLSS 4 frame generation opens up path tracing at playable frame rates.</p><p>For Nepali builders, the key consideration is power delivery. The 5090 retains the 16-pin 12VHPWR connector with a 600W TGP, so a quality 1000W+ Gold PSU is strongly recommended.</p>',
    author: 'Aayush Shrestha',
    publishedAt: '2026-08-28',
    readTimeMinutes: 6,
    image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=1200&q=80',
    tags: ['GPU', 'NVIDIA', 'RTX 50', 'Gaming'],
  },
  {
    id: 'blog-2',
    slug: 'building-a-low-power-nas-on-a-budget',
    title: 'Building a Low-Power NAS on a Budget',
    excerpt:
      'A guide to picking ECC-capable parts, efficient PSUs, and HDDs that won\'t bankrupt you in Pokhara.',
    content:
      '<p>A home NAS is more than storage &mdash; it is your backup, media server, and remote access hub rolled into one. The trick is balancing performance and power draw, especially with Kathmandu\'s power conditions.</p>',
    author: 'Sujit Pokharel',
    publishedAt: '2026-08-12',
    readTimeMinutes: 9,
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80',
    tags: ['NAS', 'Storage', 'DIY', 'Server'],
  },
  {
    id: 'blog-3',
    slug: 'esp32-lora-agricultural-sensors',
    title: 'ESP32 + LoRa for Agricultural Monitoring',
    excerpt:
      'How to deploy long-range soil sensors across 15km of farmland using off-the-shelf modules.',
    content:
      '<p>LoRaWAN\'s sub-gigahertz bands are perfect for Nepal\'s terrain. We deployed ESP32-S3 nodes with SX1262 transceivers across Chitwan farms, achieving 98% packet delivery over 868 MHz links.</p>',
    author: 'Pulchowk Robotics Club',
    publishedAt: '2026-07-30',
    readTimeMinutes: 11,
    image: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&w=1200&q=80',
    tags: ['IoT', 'LoRa', 'ESP32', 'Agriculture'],
  },
  {
    id: 'blog-4',
    slug: 'choosing-your-first-gaming-laptop',
    title: 'Choosing Your First Gaming Laptop in Nepal',
    excerpt:
      'A practical buying guide covering budgets from Rs. 100k to Rs. 250k, local warranty, and thermals.',
    content:
      '<p>Pick the right gaming laptop for your budget and use case. We cover GPU tiers, display specs, thermals, and which local vendors offer genuine global warranties.</p>',
    author: 'Kathmandu Techies',
    publishedAt: '2026-08-05',
    readTimeMinutes: 7,
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=1200&q=80',
    tags: ['Laptop', 'Gaming', 'Buying Guide'],
  },
];

export type { BlogPost };
