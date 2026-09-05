const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backendcircuit-production.up.railway.app/api';

export async function apiClient<T = unknown>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  cover_image?: string;
  excerpt?: string;
  body: string;
  published_at?: string;
  is_published: boolean;
}

export interface CareerPost {
  id: number;
  title: string;
  slug: string;
  description: string;
  requirements?: string[];
  is_published: boolean;
}

export interface CourierInfo {
  id: number;
  title: string;
  body: string;
  delivery_zones?: string[];
}

export interface HomepageSlider {
  id: number;
  image_url: string;
  headline: string;
  link_url?: string;
  sort_order: number;
  is_active: boolean;
}
