// Theme system - No emojis, using only CSS and icon libraries

export type Theme = 'duster' | 'neon' | 'twilight' | 'obsidian' | 'crystal' | 'sunset' | 'forest';

export interface ThemeConfig {
  name: Theme;
  label: string;
  colors: {
    background: string;
    foreground: string;
    primary: string;
    secondary: string;
    accent: string;
    card: string;
    border: string;
    muted: string;
  };
  description: string;
}

export const themes: Record<Theme, ThemeConfig> = {
  duster: {
    name: 'duster',
    label: 'Duster (Default)',
    description: 'Lime green gaming aesthetic with cyan accents',
    colors: {
      background: '#0a0a0f',
      foreground: '#f5f5f7',
      primary: '#d4ff00', // Lime green
      secondary: '#00e5ff', // Cyan
      accent: '#9945ff', // Purple
      card: '#13131a',
      border: '#1f1f2e',
      muted: '#808080',
    },
  },
  neon: {
    name: 'neon',
    label: 'Neon Nights',
    description: 'Vibrant neon pink and electric blue',
    colors: {
      background: '#0d0221',
      foreground: '#faf9f9',
      primary: '#ff006e', // Hot pink
      secondary: '#00f5ff', // Electric cyan
      accent: '#3a86ff', // Electric blue
      card: '#180828',
      border: '#2a1a3a',
      muted: '#7a7a8a',
    },
  },
  twilight: {
    name: 'twilight',
    label: 'Twilight',
    description: 'Purple and golden hour vibes',
    colors: {
      background: '#0f0419',
      foreground: '#ede7e1',
      primary: '#ffa500', // Golden orange
      secondary: '#c77dff', // Light purple
      accent: '#7209b7', // Deep purple
      card: '#1a0f2e',
      border: '#2d1b4e',
      muted: '#8a7fa8',
    },
  },
  obsidian: {
    name: 'obsidian',
    label: 'Obsidian',
    description: 'Sleek dark with emerald and silver accents',
    colors: {
      background: '#0a0e27',
      foreground: '#f0f4f8',
      primary: '#10b981', // Emerald green
      secondary: '#e0e7ff', // Light slate
      accent: '#06b6d4', // Cyan
      card: '#111827',
      border: '#1f2937',
      muted: '#6b7280',
    },
  },
  crystal: {
    name: 'crystal',
    label: 'Crystal Dawn',
    description: 'Light and pristine with sapphire accents',
    colors: {
      background: '#f8f9fa',
      foreground: '#1a1a1a',
      primary: '#0066ff', // Royal blue
      secondary: '#00d4ff', // Crystal cyan
      accent: '#9d4edd', // Vivid purple
      card: '#ffffff',
      border: '#e5e7eb',
      muted: '#6b7280',
    },
  },
  sunset: {
    name: 'sunset',
    label: 'Sunset Paradise',
    description: 'Warm sunset hues with coral and gold',
    colors: {
      background: '#1a0a0a',
      foreground: '#fef3f0',
      primary: '#ff6b35', // Warm orange
      secondary: '#f7931e', // Golden
      accent: '#c41e3a', // Deep red
      card: '#2a1515',
      border: '#3a2525',
      muted: '#a0907f',
    },
  },
  forest: {
    name: 'forest',
    label: 'Forest Depth',
    description: 'Natural greens with earthy tones',
    colors: {
      background: '#0a1f12',
      foreground: '#e8f5e9',
      primary: '#2e7d32', // Forest green
      secondary: '#81c784', // Light green
      accent: '#558b2f', // Olive
      card: '#1b3a26',
      border: '#2d5a3d',
      muted: '#7da97c',
    },
  },
};

export function getThemeConfig(theme?: string): ThemeConfig {
  const themeKey = (theme as Theme) || 'duster';
  return themes[themeKey] || themes.duster;
}

export function applyTheme(theme: ThemeConfig) {
  const root = document.documentElement;
  root.style.setProperty('--background', theme.colors.background);
  root.style.setProperty('--foreground', theme.colors.foreground);
  root.style.setProperty('--primary', theme.colors.primary);
  root.style.setProperty('--secondary', theme.colors.secondary);
  root.style.setProperty('--accent', theme.colors.accent);
  root.style.setProperty('--card', theme.colors.card);
  root.style.setProperty('--border', theme.colors.border);
  root.style.setProperty('--muted', theme.colors.muted);
}
