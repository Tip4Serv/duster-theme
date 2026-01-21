'use client';

// EXAMPLE: How to use the theme system in your components
// This file demonstrates best practices for theme-aware components

import React from 'react';
import { ThemeCard, ThemeCardHeader, ThemeCardBody, ThemeCardFooter, ThemeBadge, ThemeButton } from '@/components/layout/theme-components';
import { Sparkles, ShoppingCart, Gift, TrendingUp, Lock, Zap } from 'lucide-react';
import Link from 'next/link';

export function ThemeComponentsExample() {
  return (
    <div className="min-h-screen py-12 space-y-12">
      <div className="container mx-auto px-4">
        {/* SECTION 1: Card Examples */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold">Card Examples</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Card */}
            <ThemeCard>
              <ThemeCardHeader className="bg-gradient-to-r from-primary/20 to-secondary/20">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Premium Pack
                </h3>
              </ThemeCardHeader>
              <ThemeCardBody>
                <p className="text-muted mb-4">Unlock exclusive features and benefits</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <ThemeBadge variant="primary" size="sm">
                    <Zap className="w-3 h-3" /> Boost
                  </ThemeBadge>
                  <ThemeBadge variant="secondary" size="sm">
                    <Gift className="w-3 h-3" /> Gifts
                  </ThemeBadge>
                </div>
              </ThemeCardBody>
              <ThemeCardFooter>
                <ThemeButton variant="primary" className="flex-1">
                  <ShoppingCart className="w-4 h-4" /> Add to Cart
                </ThemeButton>
              </ThemeCardFooter>
            </ThemeCard>

            {/* Featured Card */}
            <ThemeCard className="border-primary/50 bg-card hover:bg-card/80">
              <div className="absolute top-4 right-4">
                <ThemeBadge variant="accent" size="sm">
                  <TrendingUp className="w-3 h-3" /> Featured
                </ThemeBadge>
              </div>
              <ThemeCardHeader>
                <h3 className="font-bold text-lg">Exclusive Bundle</h3>
                <p className="text-sm text-muted mt-1">Limited time offer</p>
              </ThemeCardHeader>
              <ThemeCardBody>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Original Price:</span>
                    <span className="line-through text-muted">$99.99</span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Now:</span>
                    <span className="text-primary">$49.99</span>
                  </div>
                </div>
              </ThemeCardBody>
              <ThemeCardFooter>
                <ThemeButton variant="secondary" className="flex-1">
                  Get Now
                </ThemeButton>
              </ThemeCardFooter>
            </ThemeCard>
          </div>
        </section>

        {/* SECTION 2: Badge Variants */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold">Badge Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-lg bg-card border border-border">
              <h3 className="font-bold mb-4">Size Variants</h3>
              <div className="space-y-3">
                <ThemeBadge variant="primary" size="sm">
                  <Lock className="w-3 h-3" /> Small Badge
                </ThemeBadge>
                <ThemeBadge variant="primary" size="md">
                  <Lock className="w-4 h-4" /> Medium Badge
                </ThemeBadge>
                <ThemeBadge variant="primary" size="lg">
                  <Lock className="w-5 h-5" /> Large Badge
                </ThemeBadge>
              </div>
            </div>

            <div className="p-6 rounded-lg bg-card border border-border">
              <h3 className="font-bold mb-4">Color Variants</h3>
              <div className="space-y-3">
                <ThemeBadge variant="primary" size="md">Primary</ThemeBadge>
                <ThemeBadge variant="secondary" size="md">Secondary</ThemeBadge>
                <ThemeBadge variant="accent" size="md">Accent</ThemeBadge>
                <ThemeBadge variant="success" size="md">Success</ThemeBadge>
                <ThemeBadge variant="warning" size="md">Warning</ThemeBadge>
                <ThemeBadge variant="danger" size="md">Danger</ThemeBadge>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: Button Variants */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold">Button Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-lg bg-card border border-border">
              <h3 className="font-bold mb-4">Button Styles</h3>
              <div className="space-y-3">
                <ThemeButton variant="primary" size="md">
                  <ShoppingCart className="w-4 h-4" /> Primary Button
                </ThemeButton>
                <ThemeButton variant="secondary" size="md">
                  <Gift className="w-4 h-4" /> Secondary Button
                </ThemeButton>
                <ThemeButton variant="accent" size="md">
                  <Zap className="w-4 h-4" /> Accent Button
                </ThemeButton>
                <ThemeButton variant="ghost" size="md">
                  <TrendingUp className="w-4 h-4" /> Ghost Button
                </ThemeButton>
              </div>
            </div>

            <div className="p-6 rounded-lg bg-card border border-border">
              <h3 className="font-bold mb-4">Button Sizes</h3>
              <div className="space-y-3">
                <ThemeButton variant="primary" size="sm">
                  Small
                </ThemeButton>
                <ThemeButton variant="primary" size="md">
                  Medium
                </ThemeButton>
                <ThemeButton variant="primary" size="lg">
                  Large
                </ThemeButton>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: Product Card Example */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold">Product Card Layout</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <ThemeCard key={i}>
                {/* Image Placeholder */}
                <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center relative">
                  <Sparkles className="w-12 h-12 text-primary/50" />
                  <div className="absolute top-3 right-3">
                    <ThemeBadge variant="primary" size="sm">
                      {i === 1 ? 'Featured' : i === 2 ? 'On Sale' : 'New'}
                    </ThemeBadge>
                  </div>
                </div>

                <ThemeCardBody className="space-y-3">
                  <h3 className="font-bold text-lg">Product {i}</h3>
                  <p className="text-sm text-muted">
                    Amazing product with great features and benefits
                  </p>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-2xl font-bold text-primary">
                      ${19.99 * i}
                    </span>
                    <div className="flex gap-2">
                      <ThemeBadge variant="secondary" size="sm">
                        <Zap className="w-3 h-3" />
                      </ThemeBadge>
                    </div>
                  </div>
                </ThemeCardBody>

                <ThemeCardFooter>
                  <ThemeButton variant="primary" className="flex-1">
                    <ShoppingCart className="w-4 h-4" /> Add
                  </ThemeButton>
                  <ThemeButton variant="ghost" className="px-3">
                    <Gift className="w-4 h-4" />
                  </ThemeButton>
                </ThemeCardFooter>
              </ThemeCard>
            ))}
          </div>
        </section>

        {/* SECTION 5: Best Practices */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold">Best Practices</h2>
          <ThemeCard>
            <ThemeCardBody>
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold mb-2 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Always use theme-aware components
                  </h4>
                  <p className="text-muted">Use ThemeCard, ThemeButton, ThemeBadge from theme-components.tsx for consistent styling</p>
                </div>
                <div>
                  <h4 className="font-bold mb-2 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    Use icon libraries instead of emojis
                  </h4>
                  <p className="text-muted">Import from lucide-react or react-icons - they scale and look professional on all themes</p>
                </div>
                <div>
                  <h4 className="font-bold mb-2 flex items-center gap-2">
                    <Gift className="w-5 h-5 text-primary" />
                    Maintain core logic separation
                  </h4>
                  <p className="text-muted">Theme changes only affect visual styling, never touch custom fields or SSR logic</p>
                </div>
                <div>
                  <h4 className="font-bold mb-2 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Test with all themes
                  </h4>
                  <p className="text-muted">Always switch between themes to ensure your components look good in all color schemes</p>
                </div>
              </div>
            </ThemeCardBody>
          </ThemeCard>
        </section>

        {/* SECTION 6: Quick Links */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/themes">
              <ThemeButton variant="primary" className="w-full justify-center">
                <Sparkles className="w-4 h-4" /> View All Themes
              </ThemeButton>
            </Link>
            <Link href="/">
              <ThemeButton variant="secondary" className="w-full justify-center">
                <ShoppingCart className="w-4 h-4" /> Back to Home
              </ThemeButton>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ThemeComponentsExample;
