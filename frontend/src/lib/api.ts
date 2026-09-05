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
    let errorMessage = 'Request failed';
    try {
      const error = await response.json();
      errorMessage = typeof error?.message === 'string' ? error.message : errorMessage;
    } catch {
      // Response is not JSON (e.g., HTML error page or empty body)
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  category?: string;
  author?: string;
  cover_image?: string;
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

export interface JobPosting {
  id: number;
  title: string;
  slug: string;
  department: string;
  location: string;
  employment_type: string;
  description: string;
  responsibilities?: string;
  requirements?: string[];
  benefits?: string[];
  application_deadline?: string;
  is_active: boolean;
}

export interface Testimonial {
  id: number;
  name: string;
  slug: string;
  role?: string;
  company?: string;
  content: string;
  photo?: string;
  rating: number;
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
