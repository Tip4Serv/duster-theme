import { NextRequest, NextResponse } from 'next/server';
import { fetchFromTip4Serv, apiCache } from '@/lib/api-client';
import { ProductDetailedSchema } from '@/lib/schemas';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const details = searchParams.get('details') || 'true';

    const cacheKey = `store:product:${id}:details=${details}`;
    const cached = apiCache.get(cacheKey);
    
    if (cached) {
      return NextResponse.json(cached);
    }

    const response = await fetchFromTip4Serv(`/store/product/${id}?details=${details}`);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch product' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const validated = ProductDetailedSchema.parse(data);
    
    apiCache.set(cacheKey, validated);
    
    return NextResponse.json(validated);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
