'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { JSX } from 'react';
import { ArrowLeft, Medal, Trophy } from 'lucide-react';
import { useCustomers, useStore } from '@/hooks/use-api';
import { safeInitials } from '@/lib/text-utils';

const medalStyles: Record<number, { bg: string; text: string; icon: JSX.Element }> = {
  1: { bg: 'bg-gradient-to-r from-[#ff8a3d] to-[#ffb347]', text: 'text-background', icon: <Trophy className="w-4 h-4" /> },
  2: { bg: 'bg-gradient-to-r from-[#5b6475] to-[#8a94a8]', text: 'text-background', icon: <Medal className="w-4 h-4" /> },
  3: { bg: 'bg-gradient-to-r from-[#6f4f1f] to-[#b2854a]', text: 'text-background', icon: <Medal className="w-4 h-4" /> },
};

function formatCurrency(amount: number, currency: string) {
  const rounded = amount.toFixed(2);
  return `${currency} ${rounded}`;
}

export function BestCustomersLeaderboard() {
  const { data: store } = useStore();
  const { data, isLoading } = useCustomers({ maxPage: 25, sort: 'revenue' });

  const customers = data?.customers || [];
  const currency = store?.currency || 'USD';

  return (
    <div className="space-y-6 px-4 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted">Community champions</p>
          <h1 className="text-3xl font-bold">Best Customers</h1>
        </div>
        <Link href="/" className="text-sm text-muted hover:text-foreground inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card">
          <ArrowLeft className="w-4 h-4" />
          Back home
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.25)]">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2 bg-[#0f1219]">
          <Trophy className="w-5 h-5 text-primary" />
          <div>
            <h2 className="text-lg font-semibold leading-tight">Top supporters by revenue</h2>
            <p className="text-sm text-muted">Sorted by lifetime spend</p>
          </div>
        </div>

        <div className="divide-y divide-border">
          {isLoading ? (
            [...Array(6)].map((_, index) => (
              <div key={index} className="flex items-center gap-4 px-4 py-4 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-muted/20" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/3 bg-muted/20 rounded" />
                  <div className="h-3 w-1/4 bg-muted/20 rounded" />
                </div>
                <div className="h-4 w-20 bg-muted/20 rounded" />
                <div className="h-4 w-16 bg-muted/20 rounded" />
              </div>
            ))
          ) : customers.length > 0 ? (
            customers.map((customer, index) => {
              const rank = index + 1;
              const badge = medalStyles[rank];
              const initials = safeInitials(customer.username, 'C');
              const avatar = customer.avatar;

              return (
                <div key={customer.user_id ?? `${customer.username}-${index}`} className="flex items-center gap-4 px-4 py-4 hover:bg-[#0f1219] transition-colors">
                  <div className="w-10 text-center font-semibold text-muted">#{rank}</div>
                  <div className="w-12 h-12 rounded-full bg-[#121623] border border-border flex items-center justify-center overflow-hidden">
                    {avatar ? (
                      <Image src={avatar} alt={customer.username} width={48} height={48} className="w-full h-full object-cover" unoptimized />
                    ) : (
                      <span className="text-base font-semibold text-primary">{initials}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-base">{customer.username}</span>
                      {badge ? (
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
                          {badge.icon}
                          {rank === 1 ? 'Champion' : rank === 2 ? 'Runner-up' : 'Top 3'}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm text-muted">{customer.payments} orders</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">{formatCurrency(customer.total_revenue, currency)}</p>
                    <p className="text-xs text-muted">{customer.discord_id ? `Discord: ${customer.discord_id}` : customer.steam_id ? `Steam: ${customer.steam_id}` : 'ID on file'}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="px-4 py-6 text-muted text-sm">No customers yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
