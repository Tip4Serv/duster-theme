'use client';

import Image from 'next/image';
import { Sparkles } from 'lucide-react';

interface EventBannerProps {
  title: string;
  subtitle?: string;
  imageUrl?: string;
}

export function EventBanner({ title, subtitle, imageUrl }: EventBannerProps) {
  return (
    <section className="relative rounded-2xl overflow-hidden border border-border bg-card mx-4">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src={imageUrl || '/home-banner.jpg'}
          alt="Top Event"
          fill
          className="object-cover opacity-35"
          unoptimized
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-linear-to-r from-background/70 via-background/40 to-transparent" />

      {/* Content */}
      <div className="relative z-10 p-6 md:p-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="px-3 py-1 rounded-full bg-primary/20 border border-primary/40 text-primary glow-primary text-xs font-semibold flex items-center gap-2">
            <Sparkles className="w-3 h-3" /> TOP EVENT
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-wide">{title}</h1>
        {subtitle ? (
          <p className="text-muted mt-2 max-w-2xl">{subtitle}</p>
        ) : null}
      </div>
    </section>
  );
}
