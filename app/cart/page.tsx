'use client';

import { useCart } from '@/hooks/use-cart';
import { calculateNumberRangeCharge } from '@/lib/cart-utils';
import { formatCustomFieldsForDisplay } from '@/lib/cart-utils';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useStore } from '@/hooks/use-api';

export default function CartPage() {
  const cart = useCart();
  const router = useRouter();
  const { data: store } = useStore();
  const [handleCustomerIdentification, setHandleCustomerIdentification] = useState(false);
  const [flagsLoaded, setFlagsLoaded] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    cart.clearIfExpired();
  }, []);

  useEffect(() => {
    const loadFlags = async () => {
      try {
        const res = await fetch('/api/config');
        if (res.ok) {
          const data = await res.json();
          setHandleCustomerIdentification(!!data.handleCustomerIdentification);
        }
      } catch (err) {
        console.error('Failed to load feature flags', err);
      } finally {
        setFlagsLoaded(true);
      }
    };
    loadFlags();
  }, []);

  const handleCheckout = async () => {
    if (!flagsLoaded || !store?.id) {
      return;
    }

    if (handleCustomerIdentification) {
      router.push('/checkout');
      return;
    }

    // Precheckout flow (direct API call)
    setIsCheckingOut(true);

    const precheckoutData = {
      products: cart.items.map(item => {
        const product: any = {
          product_id: item.product.id,
          type: item.product.subscription && item.subscriptionType === 'recurring' ? 'subscribe' : 'addtocart',
          quantity: item.quantity,
        };
        
        if (item.customFields && Object.keys(item.customFields).length > 0) {
          product.custom_fields = item.customFields;
        }
        
        if (item.serverSelection !== undefined && item.serverSelection !== null) {
          product.server_selection = item.serverSelection;
        }
        
        if (item.donationAmount !== undefined && item.donationAmount !== null && item.donationAmount > 0) {
          product.donation_amount = item.donationAmount;
        }
        
        return product;
      }),
      redirect_success_checkout: `${window.location.origin}/checkout/success`,
      redirect_canceled_checkout: `${window.location.origin}/checkout/canceled`,
      redirect_pending_checkout: `${window.location.origin}/checkout/pending`,
    };

    try {
      const response = await fetch(`/api/tip4serv/precheckout?store=${store.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(precheckoutData),
      });

      if (!response.ok) {
        setIsCheckingOut(false);
        return;
      }

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setIsCheckingOut(false);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setIsCheckingOut(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center py-20">
            <ShoppingCart className="w-24 h-24 text-muted mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
            <p className="text-muted mb-8">
              Looks like you haven't added any products to your cart yet.
            </p>
            <Link href="/shop">
              <button className="px-8 py-4 rounded-xl bg-primary hover:bg-primary/90 text-background font-semibold text-lg transition-all glow-primary hover:scale-105 inline-flex items-center gap-2 cursor-pointer">
                Browse Products
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Shopping Cart</h1>
            <p className="text-muted">{cart.getItemCount()} item{cart.getItemCount() !== 1 ? 's' : ''} in your cart</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item, index) => {
                // Check if this product appears multiple times with different custom fields
                const duplicateCount = cart.items.filter((i) => i.product.id === item.product.id).length;
                const showCustomFieldsDetail = duplicateCount > 1;
                const customFieldsDisplay = showCustomFieldsDetail && item.customFields && 'custom_fields' in item.product
                  ? formatCustomFieldsForDisplay(item.customFields, item.product.custom_fields || [])
                  : '';

                return (
                <div
                  key={`${item.product.id}-${index}`}
                  className="flex gap-4 p-4 rounded-xl bg-card border border-border"
                >
                  {/* Image */}
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gradient-card flex-shrink-0">
                    {(() => {
                      const imageSrc = item.product.image || ("gallery" in item.product ? item.product.gallery?.[0] : undefined);
                      if (!imageSrc) {
                        return (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingCart className="w-8 h-8 text-primary/30" />
                          </div>
                        );
                      }

                      return (
                        <Image
                          src={imageSrc}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      );
                    })()}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/product/${item.product.slug}`}>
                      <h3 className="font-semibold text-lg mb-1 hover:text-primary transition-colors truncate">
                        {item.product.name}
                      </h3>
                    </Link>
                    <p className="text-2xl font-bold text-primary mb-2">
                      ${(() => {
                        let price = item.product.price;
                        
                        // Add custom field prices
                        if (item.customFields && 'custom_fields' in item.product && item.product.custom_fields) {
                          item.product.custom_fields.forEach((field) => {
                            const key = field.id.toString();
                            const value = item.customFields?.[key];
                            
                            if (field.type === 'checkbox' && value) {
                              price += field.price || 0;
                            } else if ((field.type === 'select' || field.type === 'selection' || field.type === 'dropdown' || field.type === 'choice') && value && field.options) {
                              const selectedOption = field.options.find((opt) => opt.id.toString() === value.toString());
                              if (selectedOption) {
                                price += selectedOption.price || 0;
                              }
                            } else if (field.type === 'number' || field.type === 'range') {
                              price += calculateNumberRangeCharge(field, value);
                            }
                          });
                        }
                        
                        return price.toFixed(2);
                      })()}
                    </p>
                    {item.product.subscription && (
                      <p className="text-xs text-muted">
                        Subscription - Renews every {item.product.period_num} {item.product.duration_periodicity}
                        {item.product.period_num && item.product.period_num > 1 ? 's' : ''}
                      </p>
                    )}
                    {customFieldsDisplay && (
                      <p className="text-xs text-primary/80 mt-2 italic">
                        {customFieldsDisplay}
                      </p>
                    )}
                  </div>

                  {/* Quantity & Remove */}
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => cart.removeItem(item.product.id, item.customFields)}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors cursor-pointer"
                      aria-label="Remove from cart"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => cart.updateQuantity(item.product.id, item.quantity - 1, item.customFields)}
                        className="w-8 h-8 rounded-lg bg-background border border-border hover:border-primary transition-colors flex items-center justify-center cursor-pointer"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => {
                          const maxQuantity = typeof item.product.stock === 'number' ? item.product.stock : item.quantity + 1;
                          if (item.quantity < maxQuantity) {
                            cart.updateQuantity(item.product.id, item.quantity + 1, item.customFields);
                          }
                        }}
                        disabled={typeof item.product.stock === 'number' && item.quantity >= item.product.stock}
                        className="w-8 h-8 rounded-lg bg-background border border-border hover:border-primary transition-colors flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 p-6 rounded-xl bg-card border border-border">
                <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6">
                  {cart.items.map((item, index) => {
                    const duplicateCount = cart.items.filter((i) => i.product.id === item.product.id).length;
                    const showCustomFieldsDetail = duplicateCount > 1;
                    const customFieldsDisplay = showCustomFieldsDetail && item.customFields && 'custom_fields' in item.product
                      ? formatCustomFieldsForDisplay(item.customFields, item.product.custom_fields || [])
                      : '';

                    return (
                    <div key={`${item.product.id}-${index}`} className="flex flex-col gap-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted truncate pr-2">
                          {item.product.name} x{item.quantity}
                        </span>
                        <span className="font-semibold whitespace-nowrap">
                          ${(() => {
                            let price = item.product.price;
                            
                            // Add custom field prices
                            if (item.customFields && 'custom_fields' in item.product && item.product.custom_fields) {
                              item.product.custom_fields.forEach((field) => {
                                const key = field.id.toString();
                                const value = item.customFields?.[key];
                                
                                if (field.type === 'checkbox' && value) {
                                  price += field.price || 0;
                                } else if ((field.type === 'select' || field.type === 'selection' || field.type === 'dropdown' || field.type === 'choice') && value && field.options) {
                                  const selectedOption = field.options.find((opt) => opt.id.toString() === value.toString());
                                  if (selectedOption) {
                                    price += selectedOption.price || 0;
                                  }
                                } else if (field.type === 'number' || field.type === 'range') {
                                  price += calculateNumberRangeCharge(field, value);
                                }
                              });
                            }
                          
                            return (price * item.quantity).toFixed(2);
                          })()}
                        </span>
                      </div>
                      {customFieldsDisplay && (
                        <span className="text-xs text-primary/60 italic ml-2">
                          {customFieldsDisplay}
                        </span>
                      )}
                    </div>
                    );
                  })}
                </div>

                <div className="pt-6 border-t border-border">
                  <div className="flex justify-between items-baseline mb-6">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-3xl font-bold text-primary">
                      ${cart.getTotal().toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={isCheckingOut || !flagsLoaded}
                    className="w-full px-8 py-4 rounded-xl bg-primary hover:bg-primary/90 text-background font-semibold text-lg transition-all glow-primary hover:scale-105 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isCheckingOut ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Proceed to Checkout
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
