import { NextRequest, NextResponse } from 'next/server';
import { fetchFromTip4Serv, apiCache } from '@/lib/api-client';
import { CategoriesResponseSchema } from '@/lib/schemas';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page') || '1';
    const maxPage = searchParams.get('max_page') || '50';
    const parent = searchParams.get('parent');

    let queryParams = `page=${page}&max_page=${maxPage}`;
    if (parent) {
      queryParams += `&parent=${parent}`;
    }

    const cacheKey = `store:categories:${queryParams}`;
    const cached = apiCache.get(cacheKey);
    
    if (cached) {
      return NextResponse.json(cached);
    }

    const response = await fetchFromTip4Serv(`/store/categories?${queryParams}`);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch categories' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const validated = CategoriesResponseSchema.parse(data);
    
    apiCache.set(cacheKey, validated);
    
    return NextResponse.json(validated);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
