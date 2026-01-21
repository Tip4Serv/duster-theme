import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getStoreWhoami } from '@/lib/api-client';
import { ProductsGrid } from '@/components/home/products-grid';
import { EventBanner } from '@/components/layout/event-banner';
import { BestCustomersWidget } from '@/components/home/best-customers-widget';

async function HomePage() {
  const store = await getStoreWhoami();

  return (
    <div className="min-h-screen px-4">
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          {/* Top Event banner like reference layout */}
          <div className="pt-2">
            <EventBanner
              title={store?.title ? store.title : 'TOP EVENT'}
              subtitle={store?.description ? store.description.replace(/<[^>]*>/g, '') : 'Weekly updates and exclusive crates'}
            />
          </div>

          {/* Products Grid - Client Component */}
          <ProductsGrid />

          {/* CTA Section (compact) */}
          <section className="py-6">
            <div className="text-center p-8 rounded-2xl bg-card border border-border">
              <h2 className="text-3xl font-bold mb-3">Ready to Get Started?</h2>
              <p className="text-muted mb-6">Explore exclusive crates and perks now.</p>
              <Link href="/shop">
                <button className="px-6 py-3 rounded-xl pill-orange font-semibold text-base transition-all hover:brightness-105 inline-flex items-center gap-2 cursor-pointer">
                  Explore Shop <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            </div>
          </section>
        </div>

        <div className="pt-2">
          <BestCustomersWidget limit={5} />
        </div>
      </div>
    </div>
  );
}

export default HomePage;
