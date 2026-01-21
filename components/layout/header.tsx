'use client';

import Link from 'next/link';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useStore } from '@/hooks/use-api';
import { useCart } from '@/hooks/use-cart';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeSwitcher } from './theme-switcher';
import type { Store } from '@/lib/schemas';

interface HeaderProps {
  initialStore?: Store | null;
}

export function Header({ initialStore }: HeaderProps) {
  const { data: fetchedStore } = useStore();
  const store = fetchedStore || initialStore;
  const cart = useCart();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [prevCount, setPrevCount] = useState(0);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cartItemCount = cart.getItemCount();

  useEffect(() => {
    if (mounted && cartItemCount > prevCount) {
      setAnimate(true);
      setTimeout(() => setAnimate(false), 600);
    }
    setPrevCount(cartItemCount);
  }, [cartItemCount, mounted, prevCount]);

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            {store?.logo ? (
              <div className="relative w-10 h-10 rounded-lg overflow-hidden group-hover:scale-105 transition-transform">
                <Image
                  src={store.logo}
                  alt={store.title || 'Store'}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center text-2xl font-bold text-white">
                {store?.title?.[0] || 'D'}
              </div>
            )}
            <span className="text-xl font-bold text-white">
              {store?.title || 'Duster Theme'}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <ThemeSwitcher />
            {isActive('/') ? (
              <span className="text-sm text-white font-semibold cursor-default">
                Home
              </span>
            ) : (
              <Link href="/" className="text-sm text-foreground/80 hover:text-foreground transition-colors">
                Home
              </Link>
            )}
            {isActive('/shop') ? (
              <span className="text-sm text-white font-semibold cursor-default">
                Shop
              </span>
            ) : (
              <Link href="/shop" className="text-sm text-foreground/80 hover:text-foreground transition-colors">
                Shop
              </Link>
            )}
            {store?.menu_links?.map((menuLink, index) => (
              <a
                key={index}
                href={menuLink.link.trim()}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-foreground/80 hover:text-foreground transition-colors"
              >
                {menuLink.title}
              </a>
            ))}
            <Link href="/cart" className="relative">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border hover:border-primary transition-colors">
                <ShoppingCart className="w-5 h-5" />
                <span className="text-sm font-medium">Cart</span>
                <AnimatePresence>
                  {mounted && cartItemCount > 0 && (
                    <motion.span
                      key={cartItemCount}
                      initial={{ scale: 0 }}
                      animate={{ 
                        scale: animate ? [1, 1.5, 1] : 1,
                        rotate: animate ? [0, 10, -10, 0] : 0
                      }}
                      exit={{ scale: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-background text-xs font-bold flex items-center justify-center glow-primary"
                    >
                      {cartItemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 space-y-2 border-t border-border">
            <Link 
              href="/" 
              className="block py-2 text-foreground/80 hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="/shop" 
              className="block py-2 text-foreground/80 hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Shop
            </Link>
            {store?.menu_links?.map((menuLink, index) => (
              <a
                key={index}
                href={menuLink.link.trim()}
                target="_blank"
                rel="noopener noreferrer"
                className="block py-2 text-foreground/80 hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {menuLink.title}
              </a>
            ))}
            <Link 
              href="/cart" 
              className="flex items-center justify-between py-2 text-foreground/80 hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span>Cart</span>
              <AnimatePresence>
                {cartItemCount > 0 && (
                  <motion.span
                    key={cartItemCount}
                    initial={{ scale: 0 }}
                    animate={{ 
                      scale: animate ? [1, 1.5, 1] : 1,
                      rotate: animate ? [0, 10, -10, 0] : 0
                    }}
                    exit={{ scale: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-6 h-6 rounded-full bg-primary text-background text-xs font-bold flex items-center justify-center"
                  >
                    {cartItemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
