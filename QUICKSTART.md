# Quick Start Guide

Get the Duster Theme running in 2 minutes.

## 1. Install Dependencies

```bash
npm install
```

## 2. Start Dev Server

```bash
npm run dev
```

Your app is now at **http://localhost:3000**

## 3. That's It!

The store is fully functional with:

- Full product catalog (fetched from Tip4Serv API)
- Shopping cart (localStorage persisted)
- Dynamic checkout form
- Complete payment flow

## Key URLs to Visit

| URL | Description |
|-----|-------------|
| http://localhost:3000 | Home page with featured products |
| http://localhost:3000/shop | Browse all products |
| http://localhost:3000/product/87 | View product details |
| http://localhost:3000/cart | View shopping cart |
| http://localhost:3000/checkout | Checkout with dynamic form |

## What You Get

### API Endpoints (Proxied)

All endpoints are accessed through `/api/tip4serv/`:

```
GET  /api/tip4serv/store/whoami              # Store info
GET  /api/tip4serv/store/theme               # Theme config
GET  /api/tip4serv/store/categories          # Product categories
GET  /api/tip4serv/store/products            # Product list
GET  /api/tip4serv/store/product/:id         # Product details
GET  /api/tip4serv/checkout/identifiers      # Required checkout fields
POST /api/tip4serv/checkout                  # Create checkout session
```

### Client Features

- Browse products by category
- Add/remove items from cart
- Adjust quantities
- View order summary
- Dynamic checkout form (fields based on product requirements)
- Success/cancel/pending page handling

## Development Workflow

### Add a New Page

1. Create file in `app/[route]/page.tsx`
2. Import hooks from `@/hooks/use-api` or `@/hooks/use-cart`
3. Use server-side caching automatically

### Add a New Component

1. Create file in `components/[name]/component.tsx`
2. Use `'use client'` for client-side interactivity
3. Use hooks for data fetching

### Update Styles

Edit `app/globals.css` to customize the dark theme:

```css
:root {
  --primary: #d4ff00;      /* Lime green */
  --secondary: #00e5ff;    /* Cyan */
  --accent: #9945ff;       /* Purple */
  --background: #0a0a0f;   /* Charcoal */
}
```

## Troubleshooting

**Q: Server not starting?**
- Check Node version: `node --version` (need 18+)
- Kill other processes on port 3000: `netstat -ano | findstr :3000`

**Q: Products not loading?**
- Verify `.env.local` has `TIP4SERV_API_KEY`
- Check API key is valid by visiting `/api/tip4serv/store/whoami`

**Q: Can't see checkout form?**
- Open browser DevTools console for errors
- Check Network tab to see API responses

## Environment Variables

Create `.env.local`:

```env
TIP4SERV_API_KEY=your_key_here
TIP4SERV_API_BASE=https://api.tip4serv.com/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Production Build

```bash
npm run build
npm start
```

## Deploy

### To Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

Set environment variables in Vercel dashboard, then redeploy.

### To Any Node Host

Push to git, set env variables on your host, and run:
```bash
npm install
npm run build
npm start
```

## File Structure Cheat Sheet

```
app/                          # Next.js App Router
  ├── page.tsx               # Home page
  ├── layout.tsx             # Root wrapper
  ├── globals.css            # Dark theme
  ├── api/tip4serv/         # API proxies
  ├── shop/                 # Shop listing
  ├── product/[id]/         # Product detail
  ├── cart/                 # Cart page
  └── checkout/             # Checkout pages

components/                   # React components
  ├── layout/               # Header, Footer
  ├── product/              # Product card
  └── providers/            # Query provider

hooks/                        # Custom hooks
  ├── use-api.ts            # API queries
  └── use-cart.ts           # Cart store

lib/                          # Utilities
  ├── config.ts             # Config & env
  ├── schemas.ts            # Zod types
  └── api-client.ts         # Fetch + cache
```

## What's Included

- Full Next.js 16 project with TypeScript
- Tailwind CSS with dark theme
- Zustand for cart state
- TanStack Query for server data
- Zod for validation
- Framer Motion for animations
- Lucide React icons
- Complete Tip4Serv API integration
- Server-side caching
- Comprehensive documentation

## Next Steps

1. Customize store info in Tip4Serv dashboard
2. Add your own products
3. Test the full checkout flow
4. Deploy to production
5. Monitor with your hosting provider

## Support

- [README.md](README.md) - Full documentation
- [IMPLEMENTATION.md](IMPLEMENTATION.md) - Technical details
- [API_TESTING.md](API_TESTING.md) - Testing guide
- [Tip4Serv Docs](https://tip4serv.com)

---

**Happy selling!** Your store is ready to accept payments.
