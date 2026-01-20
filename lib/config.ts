export const config = {
  api: {
    baseUrl: process.env.TIP4SERV_API_BASE || 'https://api.tip4serv.com/v1',
    key: process.env.TIP4SERV_API_KEY || '',
  },
  app: {
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  },
} as const;
