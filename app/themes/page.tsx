import { themes } from '@/lib/themes';
import { ShoppingCart, Sparkles, TrendingUp, Lock, Gift, CheckCircle } from 'lucide-react';
import { ThemeBadge, ThemeButton } from '@/components/layout/theme-components';

export default function ThemesShowcase() {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Available Themes</h1>
          <p className="text-xl text-muted">
            Switch between different visual themes in the header. No emojis, clean design with icon libraries.
          </p>
        </div>

        {/* Themes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {Object.entries(themes).map(([key, theme]) => (
            <div
              key={key}
              className="p-8 rounded-xl border border-border bg-card hover:border-primary transition-all"
              style={{
                borderColor: theme.colors.primary + '40',
              }}
            >
              {/* Theme Header */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2" style={{ color: theme.colors.primary }}>
                  {theme.label}
                </h2>
                <p className="text-muted">{theme.description}</p>
              </div>

              {/* Color Palette */}
              <div className="grid grid-cols-4 gap-3 mb-8">
                <div
                  className="h-12 rounded-lg border-2"
                  style={{
                    backgroundColor: theme.colors.primary,
                    borderColor: theme.colors.secondary,
                  }}
                  title="Primary"
                />
                <div
                  className="h-12 rounded-lg border-2"
                  style={{
                    backgroundColor: theme.colors.secondary,
                    borderColor: theme.colors.primary,
                  }}
                  title="Secondary"
                />
                <div
                  className="h-12 rounded-lg border-2"
                  style={{
                    backgroundColor: theme.colors.accent,
                    borderColor: theme.colors.primary,
                  }}
                  title="Accent"
                />
                <div
                  className="h-12 rounded-lg border-2"
                  style={{
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.border,
                  }}
                  title="Card"
                />
              </div>

              {/* Sample Components */}
              <div className="space-y-4">
                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <ThemeBadge variant="primary" size="sm">
                    <Sparkles className="w-3 h-3" /> Premium
                  </ThemeBadge>
                  <ThemeBadge variant="secondary" size="sm">
                    <TrendingUp className="w-3 h-3" /> Featured
                  </ThemeBadge>
                  <ThemeBadge variant="accent" size="sm">
                    <Lock className="w-3 h-3" /> Exclusive
                  </ThemeBadge>
                </div>

                {/* Buttons */}
                <div className="flex flex-wrap gap-2 pt-4">
                  <ThemeButton size="sm" variant="primary">
                    <ShoppingCart className="w-4 h-4" /> Add to Cart
                  </ThemeButton>
                  <ThemeButton size="sm" variant="ghost">
                    <Gift className="w-4 h-4" /> Learn More
                  </ThemeButton>
                </div>

                {/* Status indicators with icons */}
                <div className="pt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" style={{ color: theme.colors.primary }} />
                    <span>Using icon libraries (lucide-react & react-icons)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" style={{ color: theme.colors.secondary }} />
                    <span>No emojis - Pure SVG icons</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" style={{ color: theme.colors.accent }} />
                    <span>Same core logic, visual variations only</span>
                  </div>
                </div>
              </div>

              {/* CSS Variables Preview */}
              <div className="mt-6 p-4 rounded-lg bg-background/50 border border-border text-xs font-mono">
                <div className="font-semibold mb-2">CSS Variables:</div>
                <div className="space-y-1 text-muted">
                  <div>--primary: {theme.colors.primary}</div>
                  <div>--secondary: {theme.colors.secondary}</div>
                  <div>--accent: {theme.colors.accent}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Usage Instructions */}
        <div className="rounded-xl border border-border bg-card p-8 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">How to Use</h2>
          <ol className="space-y-4 text-lg">
            <li className="flex gap-4">
              <span className="font-bold text-primary">1.</span>
              <span>Click the theme selector in the header (palette icon) to switch themes</span>
            </li>
            <li className="flex gap-4">
              <span className="font-bold text-primary">2.</span>
              <span>Your selection is saved locally and persists across sessions</span>
            </li>
            <li className="flex gap-4">
              <span className="font-bold text-primary">3.</span>
              <span>All themes share the same core logic and structure</span>
            </li>
            <li className="flex gap-4">
              <span className="font-bold text-primary">4.</span>
              <span>Only visual styling and colors change between themes</span>
            </li>
            <li className="flex gap-4">
              <span className="font-bold text-primary">5.</span>
              <span>Icons come from lucide-react and react-icons libraries</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
