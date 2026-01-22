import { NextRequest, NextResponse } from 'next/server';
import { fetchFromTip4Serv } from '@/lib/api-client';
import { CheckoutResponseSchema } from '@/lib/schemas';

export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const storeId = searchParams.get('store');
    const redirect = searchParams.get('redirect');

    if (!storeId) {
      return NextResponse.json(
        { error: 'Store ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Pass the precheckout request directly to Tip4Serv
    const response = await fetchFromTip4Serv('/store/checkout?store=' + storeId + (redirect ? '&redirect=true' : ''), {
      method: 'POST',
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to process checkout';
      const errorText = await response.text().catch(() => '');

      console.error('[precheckout] error response', { status: response.status, body: errorText?.slice(0, 500) });

      // Try to parse JSON error response
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error) {
          errorMessage = errorJson.error;
        } else if (errorJson.details) {
          errorMessage = errorJson.details;
        } else if (errorJson.message) {
          errorMessage = errorJson.message;
        }
      } catch {
        // If not JSON, use the raw text (up to 200 chars)
        if (errorText) {
          errorMessage = errorText.slice(0, 200);
        }
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    const data = await response.json();
    const validated = CheckoutResponseSchema.parse(data);

    return NextResponse.json(validated);
  } catch (error) {
    console.error('Error in precheckout:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
