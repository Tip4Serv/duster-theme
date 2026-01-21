'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '@/hooks/use-api';
import { useCart } from '@/hooks/use-cart';
import { Search, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { safeInitials } from '@/lib/text-utils';
import type { Store } from '@/lib/schemas';

type TopbarProps = {
  initialStore?: Store | null;
};

export function Topbar({ initialStore }: TopbarProps) {
  const { data: store } = useStore(initialStore ?? undefined);
  const cart = useCart();
  const [animate, setAnimate] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const prevCountRef = useRef(0);

  const cartItemCount = cart.getItemCount();
  const logoInitials = safeInitials(store?.title, 'DS');
  
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    
    if (cartItemCount > prevCountRef.current) {
      const start = setTimeout(() => setAnimate(true), 0);
      const stop = setTimeout(() => setAnimate(false), 600);
      return () => { clearTimeout(start); clearTimeout(stop); };
    }
    prevCountRef.current = cartItemCount;
  }, [cartItemCount, isHydrated]);

  return (
    <div className="fixed left-0 md:left-20 right-0 top-0 h-14 border-b border-border topbar-blur z-40">
      <div className="px-4 h-full flex items-center justify-between">
        {/* Left: Logo + Tabs */}
        <div className="flex items-center gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            {store?.logo ? (
              <div className="relative w-8 h-8 rounded-md overflow-hidden">
                <Image src={store.logo} alt={store.title || 'Store'} fill className="object-cover" unoptimized />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-md bg-primary text-background flex items-center justify-center font-bold">{logoInitials}</div>
            )}
            <span className="font-bold text-white hidden sm:block">{store?.title || 'Store'}</span>
          </Link>

          {/* Tabs */}
          <div className="hidden md:flex items-center gap-2">
            <Link href="/" className="px-3 py-2 rounded-lg text-sm hover:bg-card">Home</Link>
            <Link href="/shop" className="px-3 py-2 rounded-lg text-sm hover:bg-card">Shop</Link>
          </div>
        </div>

        {/* Right: Search + Cart */}
        <div className="flex items-center gap-3">
          {/* Search stub */}
          <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border">
            <Search className="w-4 h-4 text-muted" />
            <input className="bg-transparent outline-none text-sm placeholder:text-muted" placeholder="Search" />
          </div>

          {/* Cart */}
          <Link href="/cart" className="relative">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg pill-orange hover:brightness-105 transition">
              <ShoppingCart className="w-5 h-5" />
              <span className="text-sm font-semibold">Cart</span>
              {isHydrated && (
                <AnimatePresence>
                  {cartItemCount > 0 && (
                    <motion.span
                      key={cartItemCount}
                      initial={{ scale: 0 }}
                      animate={{ scale: animate ? [1, 1.4, 1] : 1 }}
                      exit={{ scale: 0 }}
                      transition={{ duration: 0.25 }}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-background text-primary text-xs font-bold flex items-center justify-center border border-primary"
                    >
                      {cartItemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              )}
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
