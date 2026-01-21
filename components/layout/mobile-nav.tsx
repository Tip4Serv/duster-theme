'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useState, useEffect } from 'react';

export function MobileNav() {
  const pathname = usePathname();
  const cart = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cartItemCount = cart.getItemCount();

  const items = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/shop', label: 'Shop', icon: ShoppingBag },
    { href: '/cart', label: 'Cart', icon: ShoppingCart, badge: mounted ? cartItemCount : 0 },
  ];

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0d0f14] border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {items.map(({ href, label, icon: Icon, badge }) => {
          const active = isActive(href);

          return (
            <Link key={href} href={href as Route} className="flex-1">
              <div className="flex flex-col items-center gap-1 py-2 relative">
                <div className={`relative p-2 rounded-xl transition-all ${
                  active 
                    ? 'bg-primary/20 text-primary' 
                    : 'text-foreground/60'
                }`}>
                  <Icon className="w-6 h-6" />
                  {badge !== undefined && badge > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-background text-[10px] font-bold flex items-center justify-center">
                      {badge > 99 ? '99+' : badge}
                    </span>
                  )}
                </div>
                <span className={`text-[11px] font-medium ${
                  active ? 'text-primary' : 'text-foreground/60'
                }`}>
                  {label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
