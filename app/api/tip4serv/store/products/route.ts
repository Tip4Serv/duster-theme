import { NextRequest, NextResponse } from 'next/server';
import { fetchFromTip4Serv, apiCache } from '@/lib/api-client';
import { ProductsResponseSchema } from '@/lib/schemas';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page') || '1';
    const maxPage = searchParams.get('max_page') || '50';
    const details = searchParams.get('details') || 'false';
    const onlyEnabled = searchParams.get('only_enabled') || 'true';
    const category = searchParams.get('category');

    let queryParams = `page=${page}&max_page=${maxPage}&details=${details}&only_enabled=${onlyEnabled}`;
    if (category) {
      queryParams += `&category=${category}`;
    }
    const cacheKey = `store:products:${queryParams}`;
    const cached = apiCache.get(cacheKey);
    
    if (cached) {
      return NextResponse.json(cached);
    }

    const response = await fetchFromTip4Serv(`/store/products?${queryParams}`);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const validated = ProductsResponseSchema.parse(data);
    
    apiCache.set(cacheKey, validated);
    
    return NextResponse.json(validated);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
