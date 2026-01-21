'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Zap, Check, Loader2 } from 'lucide-react';
import type { ProductDetailed, ProductGeneral } from '@/lib/schemas';
import { useCart } from '@/hooks/use-cart';
import { motion } from 'framer-motion';
import { useState, useCallback } from 'react';
import { useProduct } from '@/hooks/use-api';
import { CustomFieldsModal } from './custom-fields-modal';

type ProductCardProps = {
  product: ProductGeneral;
  hideFeaturedBadge?: boolean;
};

export function ProductCard({ product, hideFeaturedBadge = false }: ProductCardProps) {
  const cart = useCart();
  const [added, setAdded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalProduct, setModalProduct] = useState<ProductDetailed | null>(null);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const { data: detailedProduct, refetch: refetchProduct } = useProduct(product.slug, true, {
    enabled: false, // Lazy-load details only when the user interacts
    staleTime: 5 * 60 * 1000,
  });

  // Helper to ensure we have the detailed product only when needed
  const ensureDetailedProduct = useCallback(async () => {
    if (detailedProduct) return detailedProduct;

    setFetchingDetails(true);
    setFetchError(null);
    try {
      const result = await refetchProduct();
      if (result.data) return result.data;
      setFetchError('Unable to load product details.');
      return null;
    } catch (err) {
      setFetchError('Unable to load product details.');
      return null;
    } finally {
      setFetchingDetails(false);
    }
  }, [detailedProduct, refetchProduct]);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();

    // Prevent adding if out of stock or stock is 0
    if (typeof product.stock === 'number' && product.stock === 0) return;

    // Lazy-load details to determine if we need the modal
    const fullProduct = await ensureDetailedProduct();
    if (!fullProduct) return;

    const hasCustomFields = fullProduct.custom_fields?.length > 0;
    const hasServerSelection = fullProduct.server_choice && fullProduct.server_options && fullProduct.server_options.length > 0;
    const isSubscriptionWithChoice = fullProduct.subscription && fullProduct.onetime_sub === true;

    // If product needs modal (custom fields, server selection, or subscription toggle), open it
    if (hasCustomFields || hasServerSelection || isSubscriptionWithChoice) {
      setModalProduct(fullProduct);
      setShowModal(true);
      return;
    }

    // For subscriptions without custom fields, default to recurring
    const subscriptionType = fullProduct.subscription ? 'recurring' : undefined;
    // Prevent adding more than stock (if stock is defined)
    const currentInCart = cart.items.find((item) => item.product.id === product.id)?.quantity || 0;
    if (typeof product.stock === 'number' && currentInCart + 1 > product.stock) {
      // Optionally show a toast or error here
      setAdded(false);
      return;
    }
    cart.addItem(fullProduct, 1, {}, subscriptionType);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  // Strip HTML tags from description
  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, '').trim();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link href={`/product/${product.slug}`}>
        <div className="group relative h-full rounded-2xl bg-card border border-border hover:border-primary/70 transition-all duration-300 overflow-hidden">
          {/* Badges */}
          <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 items-end">
            {product.subscription && (
              <span className="px-3 py-1.5 text-xs font-semibold rounded-full border border-primary/70 text-primary bg-background/60">
                Subscription
              </span>
            )}
            {product.featured && !hideFeaturedBadge && (
              <span className="px-3 py-1.5 text-xs font-semibold rounded-full border border-primary/70 text-primary bg-background/60">
                Featured
              </span>
            )}
            {product.percent_off && product.percent_off > 0 && product.price > 0 && (
              <span className="px-3 py-1.5 text-xs font-semibold rounded-full border border-primary/70 text-primary bg-background/60">
                -{product.percent_off}%
              </span>
            )}
            {typeof product.stock === 'number' && (
              <span className="px-3 py-1.5 text-xs font-semibold rounded-full border border-red-500/70 text-red-400 bg-background/60">
                {product.stock === 0 ? 'Out of stock' : `Stock: ${product.stock}`}
              </span>
            )}
          </div>

          {/* Image */}
          <div className="relative w-full h-44 md:h-48 bg-gradient-card overflow-hidden">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-contain group-hover:scale-105 transition-transform duration-300"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Zap className="w-16 h-16 text-primary/30" />
              </div>
            )}
            {/* dim vignette */}
            <div className="absolute inset-0 bg-linear-to-t from-background/60 via-transparent to-transparent" />
          </div>

          {/* Content */}
          <div className="p-4 flex flex-col gap-3 h-full">
            <h3 className="font-semibold text-base md:text-lg line-clamp-1 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            
            <div className="min-h-10 text-xs md:text-sm text-muted">
              {product.small_description ? (
                <p className="line-clamp-2">{stripHtml(product.small_description)}</p>
              ) : (
                <span className="invisible">placeholder</span>
              )}
            </div>

            {/* Price & CTA */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-xl md:text-2xl font-bold text-primary">
                    {product.price > 0 ? `$${product.price.toFixed(2)}` : 'Free'}
                    {product.subscription && product.period_num && product.duration_periodicity && (
                      <span className="text-sm text-muted ml-1">
                        / {product.period_num > 1 ? `${product.period_num} ` : ''}{product.duration_periodicity}
                        {product.period_num > 1 ? 's' : ''}
                      </span>
                    )}
                  </span>
                  {product.old_price && product.old_price > 0 && product.old_price > product.price ? (
                    <span className="text-sm text-muted line-through">
                      ${product.old_price.toFixed(2)}
                    </span>
                  ) : null}
                </div>

                <motion.button
                  onClick={handleAddToCart}
                  whileTap={{ scale: 0.9 }}
                  animate={added ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.3 }}
                  className={`px-3 py-2 rounded-lg text-background transition-all glow-primary cursor-pointer ${
                    added ? 'bg-green-500' : 'pill-orange hover:brightness-110'
                  }`}
                  aria-label="Add to cart"
                  disabled={fetchingDetails || (typeof product.stock === 'number' && product.stock === 0)}
                >
                  {fetchingDetails ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : added ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <ShoppingCart className="w-5 h-5" />
                  )}
                </motion.button>
              </div>
              {fetchError && (
                <p className="text-xs text-red-400">{fetchError}</p>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* Custom Fields Modal */}
      {modalProduct && (
        <CustomFieldsModal
          product={modalProduct}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      )}
    </motion.div>
  );
}
