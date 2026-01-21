'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Route } from 'next';
import { Trophy, ArrowRight } from 'lucide-react';
import { useCustomers, useStore } from '@/hooks/use-api';
import { safeInitials } from '@/lib/text-utils';

function formatCurrency(amount: number, currency: string) {
  const rounded = amount.toFixed(2);
  return `${currency} ${rounded}`;
}

export function BestCustomersWidget({ limit = 5 }: { limit?: number }) {
  const { data: store } = useStore();
  const { data, isLoading } = useCustomers({ maxPage: limit, sort: 'revenue' });

  const customers = data?.customers?.slice(0, limit) || [];
  const currency = store?.currency || 'USD';

  return (
    <div className="rounded-2xl border border-border bg-card shadow-[0_0_30px_rgba(0,0,0,0.25)] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-[#0f1219]">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm text-muted">Top supporters</p>
            <h3 className="text-lg font-semibold leading-tight">Best Customers</h3>
          </div>
        </div>
        <Link href={'/best-customers' as Route} className="text-primary hover:text-primary/80 text-sm font-medium inline-flex items-center gap-1">
          View all
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="divide-y divide-border">
        {isLoading ? (
          [...Array(limit)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-muted/20" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/3 bg-muted/20 rounded" />
                <div className="h-3 w-1/4 bg-muted/20 rounded" />
              </div>
              <div className="h-4 w-16 bg-muted/20 rounded" />
            </div>
          ))
        ) : customers.length > 0 ? (
          customers.map((customer, index) => {
            const rank = index + 1;
            const initials = safeInitials(customer.username, 'C');
            const avatar = customer.avatar;

            return (
              <div key={customer.user_id ?? `${customer.username}-${index}`} className="flex items-center gap-3 px-4 py-3">
                <div className="w-10 h-10 rounded-full bg-[#121623] border border-border flex items-center justify-center overflow-hidden">
                  {avatar ? (
                    <Image src={avatar} alt={customer.username} width={40} height={40} className="w-full h-full object-cover" unoptimized />
                  ) : (
                    <span className="text-sm font-semibold text-primary">{initials}</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{customer.username}</span>
                    <span className="text-xs text-muted">#{rank}</span>
                  </div>
                  <p className="text-xs text-muted">{customer.payments} orders</p>
                </div>
                <div className="text-sm font-semibold text-primary">{formatCurrency(customer.total_revenue, currency)}</div>
              </div>
            );
          })
        ) : (
          <div className="px-4 py-6 text-muted text-sm">No customers yet.</div>
        )}
      </div>
    </div>
  );
}
