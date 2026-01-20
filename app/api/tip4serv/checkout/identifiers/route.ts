import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';
import { CheckoutIdentifiersResponseSchema } from '@/lib/schemas';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const store = searchParams.get('store');
    const productsParam = searchParams.get('products');

    if (!store || !productsParam) {
      return NextResponse.json(
        { error: 'Missing required parameters: store and products' },
        { status: 400 }
      );
    }

    // Parse products from JSON array format
    let products: number[];
    try {
      products = JSON.parse(productsParam);
      if (!Array.isArray(products)) {
        throw new Error('products must be an array');
      }
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid products format - must be JSON array' },
        { status: 400 }
      );
    }

    // Build query string with JSON array format for products
    const productsJson = JSON.stringify(products);
    const url = `${config.api.baseUrl}/store/checkout/identifiers?store=${store}&products=${encodeURIComponent(productsJson)}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Note: /store/checkout/identifiers does NOT require authentication according to OpenAPI spec
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Checkout identifiers error:', errorText);
      console.error('Identifiers URL was:', url);
      console.error('Response status:', response.status);
      
      try {
        const errorData = JSON.parse(errorText);
        console.error('Parsed error:', errorData);
      } catch (e) {
        // couldn't parse
      }
      
      // Don't fall back - let it fail so we can see what's wrong
      return NextResponse.json(
        { error: 'Failed to fetch identifiers', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // API returns array directly, but our schema expects { identifiers: [...] }
    const responseData = Array.isArray(data) ? { identifiers: data } : data;
    const validated = CheckoutIdentifiersResponseSchema.parse(responseData);

    return NextResponse.json(validated);
  } catch (error) {
    console.error('Error fetching checkout identifiers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
