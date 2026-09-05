import { Product, BackendProduct, Category } from '@/types';

export function generateSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function mapBackendProduct(p: BackendProduct): Product {
  const slug = generateSlug(p.name);
  const specs: Product['specs'] = [];

  if (p.specs && typeof p.specs === 'object') {
    for (const [key, value] of Object.entries(p.specs)) {
      const label = key
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      specs.push({
        label,
        value: String(value ?? ''),
      });
    }
  }

  return {
    id: String(p.id),
    sku: p.sku || '',
    name: p.name,
    slug,
    category: (p.category as any) || 'PC Components',
    subCategory: '',
    priceNpr: Number(p.price ?? 0),
    originalPriceNpr: undefined,
    discountPercent: undefined,
    image: p.image || '',
    images: p.image ? [p.image] : [],
    badges: [],
    vendorId: '',
    vendorName: '',
    vendorCode: '',
    isVerifiedVendor: false,
    stockStatus: p.stock && p.stock > 0 ? 'In Stock' : 'Low Stock',
    stockCount: Number(p.stock ?? 0),
    rating: 0,
    reviewCount: 0,
    warranty: '',
    description: p.description || '',
    inBox: [],
    specs,
    tags: [],
    isBestSeller: false,
    isNewArrival: false,
    hasDeal: false,
  };
}
