// OAuth helper functions for Steam and Discord integration

export function getDiscordOAuthUrl(): string {
  const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || '';
  const redirectUri = `${typeof window !== 'undefined' ? window.location.origin : ''}/api/oauth/discord/callback`;
  const scope = 'identify';
  const responseType = 'code';
  
  return `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&scope=${scope}`;
}

export function getSteamOAuthUrl(): string {
  const returnUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/api/oauth/steam/callback`;
  const realm = typeof window !== 'undefined' ? window.location.origin : '';
  
  return `https://steamcommunity.com/openid/login?openid.ns=http://specs.openid.net/auth/2.0&openid.mode=checkid_setup&openid.return_to=${encodeURIComponent(returnUrl)}&openid.realm=${encodeURIComponent(realm)}&openid.identity=http://specs.openid.net/auth/2.0/identifier_select&openid.claimed_id=http://specs.openid.net/auth/2.0/identifier_select`;
}

export async function extractDiscordId(code: string): Promise<string | null> {
  try {
    const response = await fetch('/api/oauth/discord/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    
    if (!response.ok) return null;
    const data = await response.json();
    return data.id || null;
  } catch (error) {
    console.error('Error extracting Discord ID:', error);
    return null;
  }
}

export async function extractSteamId(code: string): Promise<string | null> {
  try {
    const response = await fetch('/api/oauth/steam/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    
    if (!response.ok) return null;
    const data = await response.json();
    return data.id || null;
  } catch (error) {
    console.error('Error extracting Steam ID:', error);
    return null;
  }
}
