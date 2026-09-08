const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

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
    let errorMessage = `Request failed: ${response.status} ${response.statusText}`;
    try {
      const text = await response.text();
      if (text.trim()) {
        try {
          const error = JSON.parse(text);
          errorMessage = typeof error?.message === 'string' ? error.message : errorMessage;
        } catch {
          errorMessage = text.trim().slice(0, 200) || errorMessage;
        }
      }
    } catch {
      // Response body unreadable
    }
    const error = new Error(errorMessage) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  const text = await response.text();
  if (!text.trim()) {
    return {} as T;
  }

  return JSON.parse(text) as T;
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
