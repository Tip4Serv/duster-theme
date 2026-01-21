'use client';

// Theme-specific layout and styling utilities
// This provides consistent visual components across different themes

import React from 'react';

interface ThemeCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function ThemeCard({ children, className = '', hover = true }: ThemeCardProps) {
  return (
    <div
      className={`
        relative rounded-xl bg-card border border-border
        ${hover ? 'hover:border-primary transition-all duration-300' : ''}
        overflow-hidden
        ${className}
      `}
    >
      {children}
    </div>
  );
}

interface ThemeCardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function ThemeCardHeader({ children, className = '' }: ThemeCardHeaderProps) {
  return (
    <div className={`p-4 border-b border-border ${className}`}>
      {children}
    </div>
  );
}

interface ThemeCardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function ThemeCardBody({ children, className = '' }: ThemeCardBodyProps) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}

interface ThemeCardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function ThemeCardFooter({ children, className = '' }: ThemeCardFooterProps) {
  return (
    <div className={`p-4 border-t border-border flex gap-2 ${className}`}>
      {children}
    </div>
  );
}

// Badge component that respects theme colors
interface ThemeBadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const variantStyles: Record<string, string> = {
  primary: 'bg-primary/10 text-primary border-primary/30',
  secondary: 'bg-secondary/10 text-secondary border-secondary/30',
  accent: 'bg-accent/10 text-accent border-accent/30',
  success: 'bg-green-500/10 text-green-400 border-green-500/30',
  warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  danger: 'bg-red-500/10 text-red-400 border-red-500/30',
};

const sizeStyles: Record<string, string> = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base',
};

export function ThemeBadge({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
}: ThemeBadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-2 rounded-full border font-semibold
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}

// Button component with theme support
interface ThemeButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const buttonVariants: Record<string, string> = {
  primary:
    'bg-primary hover:bg-primary/90 text-background font-semibold glow-primary hover:scale-105',
  secondary:
    'bg-secondary hover:bg-secondary/90 text-background font-semibold glow-secondary hover:scale-105',
  accent:
    'bg-accent hover:bg-accent/90 text-white font-semibold glow-accent hover:scale-105',
  ghost:
    'bg-card border border-border hover:border-primary text-foreground transition-all',
};

const buttonSizes: Record<string, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

export function ThemeButton({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ThemeButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 rounded-xl
        transition-all duration-200 cursor-pointer
        ${buttonVariants[variant]}
        ${buttonSizes[size]}
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}

// Container wrapper for consistent spacing and theme application
interface ThemeContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const maxWidths: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

export function ThemeContainer({
  children,
  className = '',
  maxWidth = 'lg',
}: ThemeContainerProps) {
  return (
    <div className={`mx-auto px-4 ${maxWidths[maxWidth]} ${className}`}>
      {children}
    </div>
  );
}

// Gradient section for theme variety
interface ThemeGradientSectionProps {
  children: React.ReactNode;
  className?: string;
}

export function ThemeGradientSection({
  children,
  className = '',
}: ThemeGradientSectionProps) {
  return (
    <section
      className={`
        relative py-20 md:py-32 overflow-hidden
        bg-gradient-to-b from-card/50 via-background/80 to-background
        ${className}
      `}
    >
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div className="relative z-10">{children}</div>
    </section>
  );
}
