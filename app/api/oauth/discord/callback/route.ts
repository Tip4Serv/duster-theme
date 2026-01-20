import { NextRequest, NextResponse } from 'next/server';

const DISCORD_API_URL = 'https://discord.com/api/v10';
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get('code');
    const state = request.nextUrl.searchParams.get('state');
    
    if (!code) {
      return NextResponse.redirect(
        new URL('/checkout?discord_error=no_code', request.url)
      );
    }

    const redirectUri = `${state || request.nextUrl.origin}/api/oauth/discord/callback`;

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
        new URL('/checkout?discord_error=token_exchange', request.url)
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
        new URL('/checkout?discord_error=get_user', request.url)
      );
    }

    const userData = await userResponse.json();
    
    const baseOrigin = state || request.nextUrl.origin;
    const redirectUrl = new URL(`/checkout`, baseOrigin);
    redirectUrl.searchParams.set('discord_id', userData.id);
    
    // Redirect back to checkout with Discord ID in URL
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('❌ Discord OAuth error:', error);
    return NextResponse.redirect(
      new URL('/checkout?discord_error=unknown', request.url)
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
