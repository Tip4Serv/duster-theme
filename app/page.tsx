import { ProductCard } from '@/components/product/product-card';
import { ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { getStoreWhoami } from '@/lib/api-client';
import { ProductsGrid } from '@/components/home/products-grid';

async function HomePage() {
  const store = await getStoreWhoami();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 glow-primary">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Premium Gaming Products</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-white">
                {store?.title || 'Duster Theme'}
              </span>
            </h1>

            <div 
              className="text-xl md:text-2xl text-muted mb-8 max-w-2xl mx-auto"
              dangerouslySetInnerHTML={{ 
                __html: store?.description || 'Discover premium VIP ranks, exclusive perks, and gaming products' 
              }}
            />

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/shop">
                <button className="px-8 py-4 rounded-xl bg-primary hover:bg-primary/90 text-background font-semibold text-lg transition-all glow-primary hover:scale-105 flex items-center gap-2 justify-center w-full sm:w-auto cursor-pointer">
                  Browse Products
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid - Client Component */}
      <ProductsGrid />

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center p-12 rounded-2xl bg-gradient-card border border-primary/20">
            <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-muted mb-8">
              Browse our collection of premium gaming products and enhance your experience today.
            </p>
            <Link href="/shop">
              <button className="px-8 py-4 rounded-xl bg-primary hover:bg-primary/90 text-background font-semibold text-lg transition-all glow-primary hover:scale-105 inline-flex items-center gap-2 cursor-pointer">
                Explore Shop
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
