import { NextRequest, NextResponse } from 'next/server';
import { fetchFromTip4Serv, apiCache } from '@/lib/api-client';
import { ThemeSchema } from '@/lib/schemas';

export async function GET() {
  try {
    const cacheKey = 'store:theme';
    const cached = apiCache.get(cacheKey);
    
    if (cached) {
      return NextResponse.json(cached);
    }

    const response = await fetchFromTip4Serv('/store/theme');
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch theme information' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const validated = ThemeSchema.parse(data);
    
    apiCache.set(cacheKey, validated);
    
    return NextResponse.json(validated);
  } catch (error) {
    console.error('Error fetching theme:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
