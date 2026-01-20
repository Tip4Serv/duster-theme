import { NextRequest, NextResponse } from 'next/server';
import { fetchFromTip4Serv, apiCache } from '@/lib/api-client';
import { StoreSchema } from '@/lib/schemas';

export async function GET() {
  try {
    const cacheKey = 'store:whoami';
    const cached = apiCache.get(cacheKey);
    
    if (cached) {
      return NextResponse.json(cached);
    }

    const response = await fetchFromTip4Serv('/store/whoami');
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch store information' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const validated = StoreSchema.parse(data);
    
    apiCache.set(cacheKey, validated);
    
    return NextResponse.json(validated);
  } catch (error) {
    console.error('Error fetching store info:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
