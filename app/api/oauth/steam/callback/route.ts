import { NextRequest, NextResponse } from 'next/server';

const STEAM_API_URL = 'https://steamcommunity.com/openid/login';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const mode = searchParams.get('openid.mode');
    const queryOrigin = searchParams.get('origin');
    
    if (mode === 'id_res') {
      // Verify the response
      const verifyParams = new URLSearchParams();
      
      // Copy all parameters from the response
      for (const [key, value] of searchParams) {
        verifyParams.append(key, value);
      }
      
      // Change mode to check_authentication
      verifyParams.set('openid.mode', 'check_authentication');

      const verifyResponse = await fetch(STEAM_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: verifyParams,
      });

      const verifyText = await verifyResponse.text();

      if (verifyText.includes('is_valid:true')) {
        const identity = searchParams.get('openid.identity');
        const steamId = identity?.split('/').pop();
        
        if (steamId) {
          // Use origin query param if provided; fall back to request origin
          const baseOrigin = queryOrigin || request.nextUrl.origin;
          const redirectUrl = new URL('/checkout', baseOrigin);
          redirectUrl.searchParams.set('steam_id', steamId);
          
          return NextResponse.redirect(redirectUrl);
        }
      }
    }

    return NextResponse.redirect(
      new URL('/checkout?steam_error=verification_failed', request.url)
    );
  } catch (error) {
    console.error('❌ Steam OAuth error:', error);
    return NextResponse.redirect(
      new URL('/checkout?steam_error=unknown', request.url)
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { identity } = await request.json();

    if (!identity) {
      return NextResponse.json({ error: 'No identity provided' }, { status: 400 });
    }

    const steamId = identity.split('/').pop();
    
    if (!steamId) {
      return NextResponse.json({ error: 'Could not extract Steam ID' }, { status: 400 });
    }

    return NextResponse.json({ id: steamId });
  } catch (error) {
    console.error('Steam OAuth POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
