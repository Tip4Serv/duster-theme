'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import type {
  Store,
  Theme,
  CategoriesResponse,
  ProductsResponse,
  ProductDetailed,
  CheckoutIdentifiersResponse,
  CheckoutRequest,
  CheckoutResponse,
} from '@/lib/schemas';

// Fetch wrapper for client-side API calls
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`/api/tip4serv${endpoint}`, options);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `API request failed: ${response.statusText}`);
  }
  
  return response.json();
}

// Store hooks
export function useStore() {
  return useQuery<Store>({
    queryKey: ['store', 'whoami'],
    queryFn: () => fetchAPI('/store/whoami'),
  });
}

export function useTheme() {
  return useQuery<Theme>({
    queryKey: ['store', 'theme'],
    queryFn: () => fetchAPI('/store/theme'),
  });
}

// Categories hooks
export function useCategories(params?: { page?: number; maxPage?: number; parent?: number }) {
  const queryString = new URLSearchParams();
  if (params?.page) queryString.set('page', params.page.toString());
  if (params?.maxPage) queryString.set('max_page', params.maxPage.toString());
  if (params?.parent !== undefined) queryString.set('parent', params.parent.toString());

  const query = queryString.toString();
  
  return useQuery<CategoriesResponse>({
    queryKey: ['store', 'categories', params],
    queryFn: () => fetchAPI(`/store/categories${query ? `?${query}` : ''}`),
  });
}

// Products hooks
export function useProducts(params?: { 
  page?: number; 
  maxPage?: number; 
  details?: boolean; 
  onlyEnabled?: boolean;
  category?: number;
}) {
  const queryString = new URLSearchParams();
  if (params?.page) queryString.set('page', params.page.toString());
  if (params?.maxPage) queryString.set('max_page', params.maxPage.toString());
  if (params?.details !== undefined) queryString.set('details', params.details.toString());
  if (params?.onlyEnabled !== undefined) queryString.set('only_enabled', params.onlyEnabled.toString());
  if (params?.category !== undefined) queryString.set('category', params.category.toString());

  const query = queryString.toString();
  
  return useQuery<ProductsResponse>({
    queryKey: ['store', 'products', params],
    queryFn: () => fetchAPI(`/store/products${query ? `?${query}` : ''}`),
    placeholderData: (previousData) => previousData,
  });
}

export function useProduct(slug: string, details: boolean = true) {
  return useQuery<ProductDetailed>({
    queryKey: ['store', 'product', 'slug', slug, details],
    queryFn: () => fetchAPI(`/store/product/slug/${encodeURIComponent(slug)}?details=${details}`),
    enabled: !!slug,
  });
}

// Checkout hooks
export function useCheckoutIdentifiers(storeId: string, productIds: number[]) {
  const productsJson = JSON.stringify(productIds);
  const queryString = `store=${storeId}&products=${encodeURIComponent(productsJson)}`;
  
  return useQuery<CheckoutIdentifiersResponse>({
    queryKey: ['checkout', 'identifiers', storeId, productIds],
    queryFn: () => fetchAPI(`/checkout/identifiers?${queryString}`),
    enabled: !!storeId && productIds.length > 0,
  });
}

export function useCheckout(storeId: string) {
  return useMutation<CheckoutResponse, Error, CheckoutRequest>({
    mutationFn: async (checkoutData) => {
      return fetchAPI(`/checkout?store=${storeId}&redirect=true`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(checkoutData),
      });
    },
  });
}
