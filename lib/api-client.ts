import { config } from '@/lib/config';
import type { Store } from '@/lib/schemas';

type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

class SimpleCache {
  private cache = new Map<string, CacheEntry<any>>();
  private ttl: number;

  constructor(ttlSeconds: number = 300) {
    this.ttl = ttlSeconds * 1000;
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

export const apiCache = new SimpleCache(300); // 5 minutes TTL

export async function fetchFromTip4Serv(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${config.api.baseUrl}${endpoint}`;

  const headers = {
    'Authorization': `Bearer ${config.api.key}`,
    'Content-Type': 'application/json',
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
  });
}

// Server-side function to fetch store whoami with caching
export async function getStoreWhoami(): Promise<Store | null> {
  try {
    // Check cache first
    const cached = apiCache.get<Store>('store_whoami');
    if (cached) {
      return cached;
    }

    // Fetch from local API route
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/tip4serv/store/whoami`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch store whoami:', response.statusText);
      return null;
    }

    const data = await response.json();
    
    // Cache the result
    apiCache.set('store_whoami', data);
    
    return data;
  } catch (error) {
    console.error('Error fetching store whoami:', error);
    return null;
  }
}
