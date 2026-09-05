import { Banner } from '../types';

export const BANNERS: Banner[] = [
  {
    id: 'banner-1',
    title: 'NVIDIA RTX 50 Series',
    subtitle: 'Next-gen gaming performance.',
    callToAction: 'Shop Now',
    href: '/explore?category=PC+Components&sub=Graphics+Cards',
    image:
      'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=1600&q=80',
    align: 'left',
  },
  {
    id: 'banner-2',
    title: 'Back to School Tech',
    subtitle: 'Laptops from Rs. 95,000.',
    callToAction: 'View Laptops',
    href: '/explore?category=Laptops',
    image:
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=1600&q=80',
    align: 'center',
  },
  {
    id: 'banner-3',
    title: 'Pro Networking Gear',
    subtitle: 'Upgrade your infrastructure.',
    callToAction: 'Shop Networking',
    href: '/explore?category=Networking',
    image:
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1600&q=80',
    align: 'right',
  },
];

export const PROMO_BANNERS = [
  {
    id: 'promo-1',
    title: 'Monsoon Tech Sale',
    subtitle: 'Up to 15% off components',
    href: '/explore?deal=true',
    image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=1200&q=80',
    bg: 'bg-[#0f172a]',
    color: 'text-white',
  },
  {
    id: 'promo-2',
    title: 'Verified Vendor Guarantee',
    subtitle: 'Authenticity • Warranty • Support',
    href: '/vendors',
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80',
    bg: 'bg-[#dc2626]',
    color: 'text-white',
  },
  {
    id: 'promo-3',
    title: 'Build Your PC',
    subtitle: 'Custom configurator (coming soon)',
    href: '/explore',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    bg: 'bg-[#f8fafc]',
    color: 'text-[#0f172a]',
  },
];

export type { Banner };
