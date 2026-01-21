import { NextRequest, NextResponse } from 'next/server';
import { fetchFromTip4Serv, apiCache } from '@/lib/api-client';
import { config } from '@/lib/config';
import { CustomersResponseSchema } from '@/lib/schemas';

export async function GET(request: NextRequest) {
  try {
    const requestId = Date.now().toString(36);
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page') || '1';
    const maxPage = searchParams.get('max_page') || '10';
    const sort = searchParams.get('sort') || 'revenue';
    const dateFilter = searchParams.get('date_filter');

    const params = new URLSearchParams();
    params.set('page', page);
    params.set('max_page', maxPage);
    params.set('sort', sort);
    if (dateFilter) {
      params.set('date_filter', dateFilter);
    }
    // Tip4Serv also accepts the API key as a query param; send it in addition to the bearer header
    if (config.api.key) {
      params.set('key', config.api.key);
    }

    const queryString = params.toString();
    const cacheKey = `store:customers:${queryString}`;
    const cached = apiCache.get(cacheKey);
    if (cached) {
      console.info(`[customers:${requestId}] cache hit`, { page, maxPage, sort, dateFilter, keyProvided: Boolean(config.api.key) });
      return NextResponse.json(cached);
    }

    console.info(`[customers:${requestId}] fetching`, { page, maxPage, sort, dateFilter, keyProvided: Boolean(config.api.key) });
    const response = await fetchFromTip4Serv(`/store/customers?${queryString}`);
    console.info(`[customers:${requestId}] response status`, response.status);

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error(`[customers:${requestId}] error response`, { status: response.status, body: errorText?.slice(0, 500) });
      return NextResponse.json(
        { error: 'Failed to fetch customers' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.info(`[customers:${requestId}] parsed response`, { customers: Array.isArray(data?.customers) ? data.customers.length : 0 });
    const validated = CustomersResponseSchema.parse(data);

    apiCache.set(cacheKey, validated);

    return NextResponse.json(validated);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
