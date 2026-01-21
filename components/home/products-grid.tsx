'use client';

import { useProducts } from '@/hooks/use-api';
import { ProductCard } from '@/components/product/product-card';
import { ArrowRight, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export function ProductsGrid() {
  const { data: products, isLoading } = useProducts({ maxPage: 12, onlyEnabled: true });

  const featuredProducts = products?.products.filter(p => p.featured) || [];
  const allProducts = products?.products || [];

  return (
    <>
      {/* Featured Products */}
      {featuredProducts.length > 0 ? (
        <section className="py-16 relative">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-8">
              <TrendingUp className="w-6 h-6 text-primary" />
              <h2 className="text-3xl font-bold">Featured Products</h2>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-96 rounded-xl bg-card border border-border animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {featuredProducts.slice(0, 4).map((product) => (
                  <ProductCard key={product.id} product={product} hideFeaturedBadge />
                ))}
              </div>
            )}
          </div>
        </section>
      ) : null}

      {/* All Products */}
      <section className="py-16 relative">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">All Products</h2>
            <Link href="/shop" className="text-primary hover:text-primary/80 font-medium flex items-center gap-2">
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-96 rounded-xl bg-card border border-border animate-pulse" />
              ))}
            </div>
          ) : allProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {allProducts.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} hideFeaturedBadge />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted">No products available at the moment.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
