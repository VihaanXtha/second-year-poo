import { apiClient } from '@/lib/api';

export const API_ENDPOINTS = {
  CATEGORIES: '/categories',
  BRANDS: '/brands',
  PRODUCTS: '/products',
} as const;

export async function fetchData<T = unknown>(endpoint: string): Promise<T | null> {
  try {
    return await apiClient<T>(endpoint);
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error);
    return null;
  }
}

export interface NavCategory {
  id: string;
  name: string;
  slug: string;
  subcategories: {
    id: string;
    name: string;
    slug: string;
    types: {
      id: string;
      name: string;
      slug: string;
    }[];
  }[];
}

export function normalizeCategories(data: any): NavCategory[] {
  if (!Array.isArray(data)) return [];
  return data.map((cat: any, index: number) => {
    const subcategories: NavCategory['subcategories'] = [];
    const rawSubs = cat.subcategories || cat.sub_categories || [];
    if (Array.isArray(rawSubs)) {
      rawSubs.forEach((sub: any) => {
        const types: NavCategory['subcategories'][0]['types'] = [];
        const rawTypes = sub.types || sub.types_list || [];
        if (Array.isArray(rawTypes)) {
          rawTypes.forEach((type: any) => {
            types.push({
              id: String(type.id ?? `${index}-${sub.name}-${type.name}`),
              name: type.name || '',
              slug: type.slug || generateSlug(type.name || ''),
            });
          });
        }
        subcategories.push({
          id: String(sub.id ?? `${index}-${sub.name}`),
          name: sub.name || '',
          slug: sub.slug || generateSlug(sub.name || ''),
          types,
        });
      });
    }
    return {
      id: String(cat.id ?? `cat-${index}`),
      name: cat.name || '',
      slug: cat.slug || generateSlug(cat.name || ''),
      subcategories,
    };
  });
}

function generateSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}