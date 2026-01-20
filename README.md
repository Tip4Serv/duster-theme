# Duster Theme - Tip4Serv Storefront

![Duster Theme Banner](duster-theme-banner.png)

A complete, modern storefront application built with Next.js that demonstrates full integration with the Tip4Serv API. This is a reference implementation for developers building checkout-enabled marketplaces.

## Overview

Duster Theme is a production-ready example of:

- Dark-themed gaming marketplace UI with neon accents
- Server-side API proxying for secure key handling
- Dynamic checkout flow with form-based identifier collection
- Client-side cart management with persistent storage
- TanStack Query for efficient API data fetching and caching
- Full TypeScript type safety with Zod validation

## Architecture

### Tech Stack

- **Framework**: Next.js 15+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand (cart) + TanStack Query (server data)
- **Animations**: Framer Motion
- **Validation**: Zod
- **Icons**: Lucide React

### Key Design Decisions

1. **Server-Only API Keys**: Tip4Serv API key is only accessible in Node.js environment (Route Handlers, server components). Never exposed to browser.

2. **Lightweight Caching**: In-memory cache (TTL: 5 minutes) for store info, theme, categories, and products. No external cache required.

3. **Dynamic Checkout Form**: Identifiers are fetched dynamically from the checkout endpoint, allowing the form to adapt to product requirements without hardcoding fields.

4. **Client-Side Cart**: Uses Zustand with localStorage persistence. Cart operations are optimistic and do not require server calls until checkout.

5. **Minimal Backend Logic**: Route handlers only proxy requests, validate responses with Zod, and apply caching. All complex state lives client-side.

## Project Structure

```
.
├── app/
│   ├── api/tip4serv/           # API proxy route handlers
│   │   ├── store/
│   │   │   ├── whoami/
│   │   │   ├── theme/
│   │   │   ├── categories/
│   │   │   └── product/[id]/
│   │   └── checkout/
│   │       ├── identifiers/
│   │       └── route.ts
│   ├── checkout/               # Checkout flow pages
│   │   ├── page.tsx
│   │   ├── success/
│   │   ├── canceled/
│   │   └── pending/
│   ├── product/[id]/           # Product detail page
│   ├── shop/                   # Shop listing page
│   ├── cart/                   # Cart page
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Home page
│   └── globals.css             # Dark theme + utility styles
├── components/
│   ├── layout/
│   │   ├── header.tsx
│   │   └── footer.tsx
│   ├── product/
│   │   └── product-card.tsx
│   └── providers/
│       └── query-provider.tsx
├── hooks/
│   ├── use-api.ts              # TanStack Query hooks
│   └── use-cart.ts             # Zustand cart store
├── lib/
│   ├── config.ts               # Environment configuration
│   ├── schemas.ts              # Zod schemas for validation
│   └── api-client.ts           # Fetch + cache utilities
├── public/                     # Static assets
├── .env.example                # Environment template
├── .env.local                  # Local env (git ignored)
└── package.json
```

## Environment Setup

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Tip4Serv/duster-theme.git
  cd duster-theme
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Edit `.env.local` and add your credentials:
   ```env
   TIP4SERV_API_KEY=your_jwt_token_here
   TIP4SERV_API_BASE=https://api.tip4serv.com/v1
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```
(You can find your API key here : https://tip4serv.com/dashboard/api-keys)
### Required Environment Variables

| Variable | Purpose | Required | Example |
|----------|---------|----------|---------|
| `TIP4SERV_API_KEY` | JWT token for API authentication | Yes | `eyJ0eXAi...` |
| `TIP4SERV_API_BASE` | API base URL | Yes | `https://api.tip4serv.com/v1` |
| `NEXT_PUBLIC_SITE_URL` | Application URL for redirects | Yes | `http://localhost:3000` |

**Security Note**: The API key is only accessible in Node.js (Route Handlers). It is never exposed to the browser, even though the name `NEXT_PUBLIC` doesn't apply here due to the `next/server` import guard.

## Running the Application

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

### Production Build

```bash
npm run build
npm start
```

## API Integration

### Authenticated Endpoints (Server Proxy)

These endpoints require the `TIP4SERV_API_KEY` and are called via `/api/tip4serv/*`:

- `GET /api/tip4serv/store/whoami` - Fetch store information
- `GET /api/tip4serv/store/theme` - Fetch theme configuration
- `GET /api/tip4serv/store/categories` - Fetch product categories
- `GET /api/tip4serv/store/products` - Fetch product list
- `GET /api/tip4serv/store/product/[id]` - Fetch single product details

### Public Endpoints (Client-Safe)

These are proxied for consistency but don't require auth:

- `GET /api/tip4serv/checkout/identifiers?store={store_id}&products=[{product_id1},{product_id2}]` - Fetch required checkout fields
- `POST /api/tip4serv/checkout?store={store_id}` - Create checkout session

## Checkout Flow

The checkout flow follows this mandatory sequence:

### 1. Build Cart Client-Side

```typescript
const cart = useCart();
cart.addItem(product, quantity);
```

Cart state is stored in localStorage and persists across sessions.

### 2. Fetch Required Identifiers

When the user reaches checkout, the app queries which user fields are required:

```typescript
const { data: identifiers } = useCheckoutIdentifiers(storeId, productIds);
// Example response: { identifiers: ['email', 'minecraft_username', 'discord_id'] }
```

### 3. Render Dynamic Form

The checkout page renders form fields based on the required identifiers:

```typescript
const requiredIdentifiers = identifiersData?.identifiers || [];

{requiredIdentifiers.map(identifier => (
  <input
    key={identifier}
    name={identifier}
    placeholder={IDENTIFIER_LABELS[identifier]}
    required
  />
))}
```

### 4. Validate and Submit

On form submission, all required fields are validated. The cart contents are transformed into the Tip4Serv checkout format:

```typescript
const checkoutData = {
  products: [
    {
      product_id: 87,
      type: 'addtocart',
      quantity: 1,
      custom_fields: { /* if applicable */ },
      server_selection: 1, /* if applicable */
      donation_amount: 0.00, /* if applicable */
    }
  ],
  user: {
    email: 'user@example.com',
    minecraft_username: 'PlayerName',
    discord_id: '123456789',
    // ... other required identifiers
  },
  redirect_success_checkout: 'https://yourdomain.com/checkout/success',
  redirect_canceled_checkout: 'https://yourdomain.com/checkout/canceled',
  redirect_pending_checkout: 'https://yourdomain.com/checkout/pending',
};
```

### 5. Redirect to Payment Gateway

The checkout endpoint returns a URL:

```typescript
POST /api/tip4serv/checkout?store=762&redirect=true
// Response: { url: 'https://checkout.tip4serv.com/...' }
```

The browser is redirected to this URL. After payment, users are directed back to success/canceled/pending pages.

## API Testing Guide

### Test with cURL

Before integrating endpoints, validate them with curl:

```bash
# Test store info
$headers = @{ "Authorization" = "Bearer YOUR_API_KEY" }
$response = Invoke-RestMethod -Uri "https://api.tip4serv.com/v1/store/whoami" `
  -Headers $headers -Method Get
$response | ConvertTo-Json
```

### Expected Responses

All responses are validated against Zod schemas. See [lib/schemas.ts](lib/schemas.ts) for full type definitions.

Example `/store/whoami` response:

```json
{
  "id": 762,
  "title": "Duster Theme",
  "description": "Premium gaming products",
  "domain": "teststore",
  "logo": "https://cdn.example.com/logo.png",
  "currency": "USD",
  "timezone": "Europe/London",
  "color": "#d4ff00"
}
```

## Data Fetching

### Using Hooks

```typescript
// In any client component
import { useProducts, useProduct } from '@/hooks/use-api';

export function MyComponent() {
  const { data: products, isLoading } = useProducts({ maxPage: 20 });
  const { data: product } = useProduct(87);

  if (isLoading) return <div>Loading...</div>;
  
  return <div>{products?.products.length} products</div>;
}
```

### Caching Behavior

- Server-side cache (TTL: 5 min) reduces redundant API calls
- TanStack Query caches (TTL: 1 min) for client-side data
- Stale-while-revalidate: queries marked stale after TTL but returned immediately if cached

### Cache Invalidation

To refresh data in development:

```typescript
queryClient.invalidateQueries({ queryKey: ['store', 'products'] });
```

## Cart Management

### Add/Remove/Update

```typescript
const cart = useCart();

// Add product
cart.addItem(product, quantity);

// Update quantity
cart.updateQuantity(productId, newQuantity);

// Remove product
cart.removeItem(productId);

// Clear entire cart
cart.clearCart();

// Get totals
const total = cart.getTotal();
const count = cart.getItemCount();
```

All changes are persisted to localStorage automatically.

## UI/UX Features

### Dark Theme with Neon Accents

The design uses:

- **Primary**: Lime green (#d4ff00)
- **Secondary**: Cyan (#00e5ff)
- **Accent**: Purple (#9945ff)
- **Background**: Charcoal (#0a0a0f)

CSS utilities available:

```css
.glow-primary   /* Box shadow glow effect */
.gradient-primary /* Lime to cyan gradient */
.grid-pattern   /* Subtle grid background */
```

### Animations

Framer Motion is used for entrance animations on product cards and checkouts. Components are marked with `'use client'` to support animations.

### Responsive Design

Mobile-first approach using Tailwind breakpoints:
- Mobile: Single column
- Tablet (md): 2 columns
- Desktop (lg/xl): 3-4 columns

## Error Handling

### API Errors

All Route Handlers:
1. Catch errors and log them
2. Return appropriate HTTP status codes
3. Provide user-friendly error messages in the response

### Validation Errors

Zod schemas validate all responses. If the API returns malformed data:
- Error is caught and logged
- User sees a generic error message
- Check browser console for details

### Network Errors

TanStack Query retries failed requests automatically (configurable in query-provider.tsx).

## Performance Optimization

1. **Code Splitting**: Next.js App Router automatically splits code per route
2. **Image Optimization**: Next.js Image component optimizes product images
3. **Caching**: In-memory server cache reduces API calls
4. **Lazy Loading**: Product cards use Framer Motion for performance
5. **Stale-While-Revalidate**: Cache serves immediately, background refetch

## Security Best Practices

1. **API Key Protection**: Never imported in client code. Stored only in `.env.local` (git ignored).
2. **CORS**: Requests proxied through Route Handlers to avoid CORS issues.
3. **Input Validation**: All form inputs validated with Zod before submission.
4. **Redirect URLs**: Hardcoded in environment, not user-supplied.

## Troubleshooting

### "API Key is required" Error

The API key is not set in `.env.local`. Ensure:
```env
TIP4SERV_API_KEY=eyJ0eXAi...
```

### Products Not Showing

Verify your API key is valid (you can generate a new one at https://tip4serv.com/dashboard/api-keys)

### Checkout Form Showing Wrong Fields

The required identifiers are fetched from the API based on product requirements. If fields are missing:
1. Check the checkout/identifiers endpoint in DevTools
2. Verify product has server choice or custom fields enabled

### Cart Not Persisting

localStorage may be disabled or storage quota exceeded. Check browser console:
```javascript
console.log(localStorage.getItem('duster-theme-cart'));
```

## Building for Production

1. Run type checking:
   ```bash
   npm run type-check
   ```

2. Build the project:
   ```bash
   npm run build
   ```

3. Deploy the `.next` folder to your hosting (Vercel, AWS, etc.)

## Contributing

This is a reference implementation. Fork and customize as needed!

## License

This project is provided as-is for integration with Tip4Serv.

## Support

- [Tip4Serv API Docs](https://tip4serv.com/api-docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## Store Information

Your store ID is automatically fetched from `GET /store/whoami`. To change the store, update the API key in `.env.local`.

Current store details are displayed in the header and footer, dynamically pulled from the API.
