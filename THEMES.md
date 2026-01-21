# Theme System Documentation

## Overview

This DusterStore theme system allows you to create multiple visual themes while maintaining the same core logic, custom fields, server-side rendering, and functionality.

**No Emojis** - We use professional icon libraries instead.

## Available Themes

1. **Duster** (Default) - Lime green gaming aesthetic with cyan accents
2. **Neon Nights** - Vibrant neon pink and electric blue
3. **Twilight** - Purple and golden hour vibes
4. **Obsidian** - Sleek dark with emerald and silver accents
5. **Crystal Dawn** - Light and pristine with sapphire accents

## How It Works

### Theme Configuration (`lib/themes.ts`)

All themes are defined in a centralized configuration file with CSS color variables:

```typescript
export const themes: Record<Theme, ThemeConfig> = {
  duster: {
    name: 'duster',
    label: 'Duster (Default)',
    colors: {
      background: '#0a0a0f',
      foreground: '#f5f5f7',
      primary: '#d4ff00',      // Main accent color
      secondary: '#00e5ff',    // Secondary accent
      accent: '#9945ff',       // Tertiary accent
      card: '#13131a',         // Card/panel background
      border: '#1f1f2e',       // Border color
      muted: '#808080',        // Muted text
    },
  },
  // ... other themes
};
```

### Theme Switching (`components/layout/theme-switcher.tsx`)

The theme switcher component:
- Displays available themes in a dropdown
- Updates CSS variables dynamically
- Persists selection in localStorage
- Works on both desktop and mobile

Located in the header for easy access.

### Applying Themes

Themes are applied by updating CSS custom properties:

```typescript
export function applyTheme(theme: ThemeConfig) {
  const root = document.documentElement;
  root.style.setProperty('--background', theme.colors.background);
  root.style.setProperty('--foreground', theme.colors.foreground);
  // ... etc
}
```

All Tailwind classes automatically use these variables via `@theme inline`.

## Creating a New Theme

### Step 1: Add Theme to `lib/themes.ts`

```typescript
export const themes: Record<Theme, ThemeConfig> = {
  // ... existing themes
  
  myTheme: {
    name: 'myTheme',
    label: 'My Custom Theme',
    description: 'My awesome theme description',
    colors: {
      background: '#color1',
      foreground: '#color2',
      primary: '#color3',
      secondary: '#color4',
      accent: '#color5',
      card: '#color6',
      border: '#color7',
      muted: '#color8',
    },
  },
};
```

### Step 2: Update Type Definition

Add your theme name to the `Theme` type:

```typescript
export type Theme = 'duster' | 'neon' | 'twilight' | 'obsidian' | 'crystal' | 'myTheme';
```

That's it! The theme switcher will automatically display it.

## Icon Libraries

### No Emojis - Use Icons Instead

We use professional icon libraries:

#### **Lucide React** (Default)
```tsx
import { Sparkles, ShoppingCart, Lock, Gift } from 'lucide-react';

<Sparkles className="w-4 h-4" />
```

- Consistent, clean SVG icons
- ~400+ icons available
- Perfect for UI elements and badges

#### **React Icons** (Optional)
```tsx
import { FaCrown, FaStar, FaShieldAlt } from 'react-icons/fa';
import { SiNintendo, SiSteam } from 'react-icons/si';

<FaCrown className="w-4 h-4" />
```

- Multiple icon packs (Font Awesome, Simple Icons, etc.)
- Great for gaming-related icons
- Platform-specific icons (Steam, PlayStation, Xbox, etc.)

### Using Icons in Components

```tsx
import { Sparkles, ShoppingCart } from 'lucide-react';
import { ThemeBadge } from '@/components/layout/theme-components';

export function MyComponent() {
  return (
    <ThemeBadge variant="primary">
      <Sparkles className="w-4 h-4" />
      Premium Feature
    </ThemeBadge>
  );
}
```

## Theme-Aware Components

Located in `components/layout/theme-components.tsx`:

### ThemeCard
```tsx
<ThemeCard hover>
  <ThemeCardHeader>Title</ThemeCardHeader>
  <ThemeCardBody>Content</ThemeCardBody>
  <ThemeCardFooter>Actions</ThemeCardFooter>
</ThemeCard>
```

### ThemeBadge
```tsx
<ThemeBadge variant="primary" size="md">
  <Sparkles className="w-4 h-4" /> Label
</ThemeBadge>
```

Variants: `primary`, `secondary`, `accent`, `success`, `warning`, `danger`

### ThemeButton
```tsx
<ThemeButton variant="primary" size="md">
  <ShoppingCart className="w-4 h-4" /> Add to Cart
</ThemeButton>
```

Variants: `primary`, `secondary`, `accent`, `ghost`

### ThemeContainer
```tsx
<ThemeContainer maxWidth="lg">
  Content
</ThemeContainer>
```

### ThemeGradientSection
```tsx
<ThemeGradientSection>
  <h1>Gradient Section</h1>
</ThemeGradientSection>
```

## Customizing Themes for Specific Stores

You can also make themes store-specific by modifying colors based on store data:

```typescript
export function createStoreTheme(store: Store, baseTheme: ThemeConfig): ThemeConfig {
  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: store.primary_color || baseTheme.colors.primary,
      secondary: store.secondary_color || baseTheme.colors.secondary,
    },
  };
}
```

## Viewing All Themes

Visit `/themes` to see a showcase of all available themes with:
- Color palettes
- Sample components
- Icon usage examples
- CSS variable previews

## Core Logic Remains Unchanged

All themes share:
- ✓ Custom fields implementation
- ✓ Server-side rendering
- ✓ Cart management
- ✓ API integration
- ✓ Checkout flow
- ✓ Product pagination
- ✓ OAuth authentication

Only the visual presentation changes between themes.

## CSS Structure

The styling system uses:
- **Tailwind CSS v4** with custom theme properties
- **CSS Custom Properties** (variables) for dynamic theming
- **Framer Motion** for animations (theme-agnostic)
- **No utility duplication** - all themes share the same CSS

## Performance

- Minimal JavaScript overhead (theme switching is CSS-only)
- No re-renders when switching themes
- LocalStorage persistence for user preference
- ~1KB total for theme system code

## Future Enhancements

- Admin panel to customize themes per store
- Color picker UI
- Theme preview before switching
- Auto-generated contrast-safe color schemes
- Theme inheritance/composition
