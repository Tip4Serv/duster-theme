import { NextRequest, NextResponse } from 'next/server';

const DISCORD_API_URL = 'https://discord.com/api/v10';
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get('code');
    const state = request.nextUrl.searchParams.get('state');
    
    // Parse state to extract origin (format: origin|returnPath or just origin)
    let baseOrigin = request.nextUrl.origin;
    let returnPath = '/checkout';
    
    if (state && state.includes('|')) {
      const parts = state.split('|');
      baseOrigin = parts[0];
      if (parts.length === 2) {
        returnPath = parts[1];
      }
    } else if (state) {
      baseOrigin = state;
    }
    
    if (!code) {
      return NextResponse.redirect(
        new URL('/checkout?discord_error=no_code', baseOrigin)
      );
    }

    const redirectUri = `${baseOrigin}/api/oauth/discord/callback`;

    // Exchange code for access token
    const tokenResponse = await fetch(`${DISCORD_API_URL}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: CLIENT_ID || '',
        client_secret: CLIENT_SECRET || '',
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      return NextResponse.redirect(
        new URL('/checkout?discord_error=token_exchange', baseOrigin)
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Get user info
    const userResponse = await fetch(`${DISCORD_API_URL}/users/@me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      return NextResponse.redirect(
        new URL('/checkout?discord_error=get_user', baseOrigin)
      );
    }

    const userData = await userResponse.json();
    
    // Use returnPath that was parsed at the beginning
    const redirectUrl = new URL(returnPath, baseOrigin);
    redirectUrl.searchParams.set('discord_id', userData.id);
    
    // Redirect back with Discord ID in URL
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('❌ Discord OAuth error:', error);
    
    // Try to extract origin from state if available
    const state = request.nextUrl.searchParams.get('state');
    let baseOrigin = request.nextUrl.origin;
    if (state && state.includes('|')) {
      baseOrigin = state.split('|')[0];
    } else if (state) {
      baseOrigin = state;
    }
    
    return NextResponse.redirect(
      new URL('/checkout?discord_error=unknown', baseOrigin)
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }

    const redirectUri = process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI || `${request.nextUrl.origin}/api/oauth/discord/callback`;

    // Exchange code for access token
    const tokenResponse = await fetch(`${DISCORD_API_URL}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: CLIENT_ID || '',
        client_secret: CLIENT_SECRET || '',
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      return NextResponse.json({ error: 'Token exchange failed' }, { status: 400 });
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Get user info
    const userResponse = await fetch(`${DISCORD_API_URL}/users/@me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userResponse.ok) {
      return NextResponse.json({ error: 'Failed to get user info' }, { status: 400 });
    }

    const userData = await userResponse.json();
    return NextResponse.json({ id: userData.id });
  } catch (error) {
    console.error('Discord OAuth POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
