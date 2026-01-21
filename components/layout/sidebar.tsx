'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';
import { useStore } from '@/hooks/use-api';
import { Home, ShoppingBag, ShoppingCart, Trophy, Layers } from 'lucide-react';
import { safeInitials } from '@/lib/text-utils';
import type { Store } from '@/lib/schemas';

type SidebarProps = {
  initialStore?: Store | null;
};

export function Sidebar({ initialStore }: SidebarProps) {
  const pathname = usePathname();
  const { data: store } = useStore(initialStore ?? undefined);

  const items = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/shop', label: 'Shop', icon: ShoppingBag },
    { href: '/cart', label: 'Cart', icon: ShoppingCart },
  ];

  const tools = [
    { href: '/best-customers', label: 'Leaderboard', icon: Trophy },
  ];

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));
  const logoInitials = safeInitials(store?.title, 'DS');

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-screen w-20 border-r border-border sidebar-blur z-40 flex-col items-center py-4 bg-[#0d0f14]">
      {/* Logo */}
      <Link href={'/' as Route} className="mb-6 flex items-center justify-center w-12 h-12 rounded-lg bg-card border border-border hover:border-primary transition">
        {/* Use store logo if available */}
        <span className="text-xl font-bold text-primary">{logoInitials}</span>
      </Link>

      {/* Main nav */}
      <nav className="flex-1 w-full flex flex-col items-center gap-3">
        {items.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          const itemClasses = (
            'mx-auto flex flex-col items-center gap-1 w-16 py-3 rounded-xl border ' +
            (active ? 'border-primary bg-card ring-1 ring-primary/70 shadow-[0_0_12px_rgba(255,107,53,0.35)]' : 'border-border bg-card hover:border-primary/70') +
            ' transition'
          );
          const iconClasses = 'w-5 h-5 ' + (active ? 'text-primary' : 'text-foreground/70');
          const textClasses = 'text-[11px] tracking-wide ' + (active ? 'text-primary' : 'text-muted');

          return (
            <Link key={href} href={href as Route} className="w-full">
              <div className={itemClasses}>
                <div className={active ? 'w-8 h-8 rounded-md bg-primary/15 border border-primary flex items-center justify-center' : 'w-8 h-8 rounded-md bg-card border border-border flex items-center justify-center'}>
                  <Icon className={iconClasses} />
                </div>
                <span className={textClasses}>{label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Tools section */}
      <div className="w-full flex flex-col items-center gap-3 pb-4">
        {tools.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href as Route} className="w-full">
            <div className="mx-auto flex flex-col items-center gap-1 w-16 py-3 rounded-xl border border-border bg-card hover:border-primary transition">
              <Icon className="w-5 h-5 text-foreground/80" />
              <span className="text-[11px] text-muted">{label}</span>
            </div>
          </Link>
        ))}
      </div>
    </aside>
  );
}
