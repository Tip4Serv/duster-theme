'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Zap, Check } from 'lucide-react';
import type { ProductGeneral } from '@/lib/schemas';
import { useCart } from '@/hooks/use-cart';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
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
  const [needsCustomFields, setNeedsCustomFields] = useState(false);
  const { data: detailedProduct } = useProduct(product.slug);

  useEffect(() => {
    // Check if product has custom fields, is a subscription that allows onetime purchase, is a donation product, or requires server selection
    if (detailedProduct) {
      const hasCustomFields = 'custom_fields' in detailedProduct && detailedProduct.custom_fields && detailedProduct.custom_fields.length > 0;
      const isSubscriptionWithChoice = detailedProduct.subscription && detailedProduct.onetime_sub === true;
      const isDonation = 'donation' in detailedProduct && detailedProduct.donation === true;
      const hasServerChoice = 'server_choice' in detailedProduct && detailedProduct.server_choice === true;
      setNeedsCustomFields(hasCustomFields || isSubscriptionWithChoice || isDonation || hasServerChoice);
    }
  }, [detailedProduct]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();

    // Prevent adding if out of stock or stock is 0
    if (typeof product.stock === 'number' && product.stock === 0) return;

    // If product needs modal (custom fields or subscription type choice), open it
    if (needsCustomFields && detailedProduct) {
      setShowModal(true);
      return;
    }

    // For subscriptions without custom fields, default to recurring
    const subscriptionType = product.subscription ? 'recurring' : undefined;
    // Prevent adding more than stock (if stock is defined)
    const currentInCart = cart.items.find((item) => item.product.id === product.id)?.quantity || 0;
    if (typeof product.stock === 'number' && currentInCart + 1 > product.stock) {
      // Optionally show a toast or error here
      setAdded(false);
      return;
    }
    cart.addItem(product, 1, {}, subscriptionType);
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
        <div className="group relative h-full rounded-xl bg-card border border-border hover:border-primary transition-all duration-300 overflow-hidden">
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
          <div className="relative w-full h-48 bg-gradient-card overflow-hidden">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-contain group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Zap className="w-16 h-16 text-primary/30" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4 flex flex-col gap-3 h-full">
            <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            
            <div className="min-h-[44px] text-sm text-muted">
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
                  <span className="text-2xl font-bold text-primary">
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
                  className={`p-2 rounded-lg text-background transition-all glow-primary cursor-pointer ${
                    added ? 'bg-green-500' : 'bg-primary hover:bg-primary/90'
                  }`}
                  aria-label="Add to cart"
                  disabled={typeof product.stock === 'number' && product.stock === 0}
                >
                  {added ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Custom Fields Modal */}
      {needsCustomFields && detailedProduct && (
        <CustomFieldsModal
          product={detailedProduct}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      )}
    </motion.div>
  );
}
