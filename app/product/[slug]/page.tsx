'use client';

import { useProduct } from '@/hooks/use-api';
import { useCart } from '@/hooks/use-cart';
import { ShoppingCart, ArrowLeft, Check, X, AlertCircle, ChevronLeft, ChevronRight, Maximize, ArrowRight, HelpCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, use, useEffect } from 'react';
import type { CustomField } from '@/lib/schemas';
import { validateCustomRules, getCustomRulesErrorMessage } from '@/lib/custom-rules-utils';
import { calculateNumberRangeCharge } from '@/lib/cart-utils';

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: product, isLoading } = useProduct(slug);
  const cart = useCart();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [customFields, setCustomFields] = useState<Record<string, any>>({});
  const [serverSelection, setServerSelection] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionType, setSubscriptionType] = useState<'onetime' | 'recurring'>('recurring');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [shouldTransition, setShouldTransition] = useState(true);

  useEffect(() => {
    cart.clearIfExpired();
  }, []);

  useEffect(() => {
    if (!serverSelection && product?.server_options?.length) {
      setServerSelection(product.server_options[0].id);
    }
  }, [product, serverSelection]);

  // Determine if we should show subscription type choice
  const canChooseOnetimeSubscription = product?.subscription && product?.onetime_sub === true;

  // Get all available images (main image + gallery)
  const allImages = product ? [
    ...(product.image ? [product.image] : []),
    ...(product.gallery || [])
  ].filter(Boolean) : [];

  const handlePreviousImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
    setIsDragging(true);
    setShouldTransition(false);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const currentTouch = e.targetTouches[0].clientX;
    setTouchEnd(currentTouch);
    if (touchStart) {
      setDragOffset(currentTouch - touchStart);
    }
  };

  const onTouchEnd = () => {
    setIsDragging(false);
    setShouldTransition(true);
    
    if (!touchStart || !touchEnd) {
      setDragOffset(0);
      return;
    }
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      // Move to next image
      setSelectedImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
    } else if (isRightSwipe) {
      // Move to previous image
      setSelectedImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
    }
    
    // Reset drag offset to snap to the selected image
    setDragOffset(0);
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    // Validate stock - consider what's already in cart
    const currentInCart = cart.items.find((item) => item.product.id === product.id)?.quantity || 0;
    const totalWillBe = currentInCart + quantity;

    if (typeof product.stock === 'number' && product.stock === 0) {
      setError('This product is out of stock');
      setTimeout(() => setError(null), 5000);
      return;
    }

    if (typeof product.stock === 'number' && totalWillBe > product.stock) {
      const remaining = product.stock - currentInCart;
      setError(`You already have ${currentInCart} in cart. Only ${remaining} more item${remaining !== 1 ? 's' : ''} available in stock`);
      setTimeout(() => setError(null), 5000);
      return;
    }
    
    // Validate required custom fields
    if (product.custom_fields) {
      const missingRequired = product.custom_fields.some(
        (field) => field.required && !customFields[field.marker || field.id.toString()]
      );
      if (missingRequired) {
        setError('Please fill in all required fields');
        setTimeout(() => setError(null), 5000);
        return;
      }
    }

    // Validate custom rules
    if (product.custom_rules && product.custom_rules.length > 0) {
      const ruleValidations = validateCustomRules(product.custom_rules, customFields, product.custom_fields);
      if (!ruleValidations.every((v) => v.isValid)) {
        const errorMessage = getCustomRulesErrorMessage(ruleValidations);
        setError(errorMessage || 'Custom field rules validation failed');
        setTimeout(() => setError(null), 5000);
        return;
      }
    }

    if (product.server_choice && product.server_options?.length && !serverSelection) {
      setError('Please select a server');
      setTimeout(() => setError(null), 5000);
      return;
    }
    
    setError(null);
    // Only pass subscriptionType if this is actually a subscription product
    const typeToPass = product.subscription ? subscriptionType : undefined;
    cart.addItem(product, quantity, customFields, typeToPass);
    if (serverSelection) {
      cart.updateServerSelection(product.id, serverSelection, customFields);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (!product) return;
    
    // Validate stock - consider what's already in cart
    const currentInCart = cart.items.find((item) => item.product.id === product.id)?.quantity || 0;
    const totalWillBe = currentInCart + quantity;

    if (typeof product.stock === 'number' && product.stock === 0) {
      setError('This product is out of stock');
      setTimeout(() => setError(null), 5000);
      return;
    }

    if (typeof product.stock === 'number' && totalWillBe > product.stock) {
      const remaining = product.stock - currentInCart;
      setError(`You already have ${currentInCart} in cart. Only ${remaining} more item${remaining !== 1 ? 's' : ''} available in stock`);
      setTimeout(() => setError(null), 5000);
      return;
    }
    
    // Validate required custom fields
    if (product.custom_fields) {
      const missingRequired = product.custom_fields.some(
        (field) => field.required && !customFields[field.marker || field.id.toString()]
      );
      if (missingRequired) {
        setError('Please fill in all required fields');
        setTimeout(() => setError(null), 5000);
        return;
      }
    }

    // Validate custom rules
    if (product.custom_rules && product.custom_rules.length > 0) {
      const ruleValidations = validateCustomRules(product.custom_rules, customFields, product.custom_fields);
      if (!ruleValidations.every((v) => v.isValid)) {
        const errorMessage = getCustomRulesErrorMessage(ruleValidations);
        setError(errorMessage || 'Custom field rules validation failed');
        setTimeout(() => setError(null), 5000);
        return;
      }
    }
    
    setError(null);
    // Only pass subscriptionType if this is actually a subscription product
    const typeToPass = product.subscription ? subscriptionType : undefined;
    cart.addItem(product, quantity, customFields, typeToPass);
    if (serverSelection) {
      cart.updateServerSelection(product.id, serverSelection, customFields);
    }
    
    // Immediately redirect to cart
    router.push('/cart');
  };

  const handleCustomFieldChange = (field: CustomField, value: any) => {
    const key = field.id.toString();
    setCustomFields((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const calculateTotalPrice = () => {
    let total = product?.price || 0;
    
    if (product?.custom_fields) {
      product.custom_fields.forEach((field) => {
        const key = field.id.toString();
        const value = customFields[key];
        
        if (field.type === 'checkbox' && value) {
          total += field.price || 0;
        } else if ((field.type === 'select' || field.type === 'selection' || field.type === 'dropdown' || field.type === 'choice') && value && field.options) {
          const selectedOption = field.options.find((opt) => opt.id.toString() === value.toString());
          if (selectedOption) {
            total += selectedOption.price || 0;
          }
        } else if (field.type === 'number' || field.type === 'range') {
          total += calculateNumberRangeCharge(field, value);
        }
      });
    }
    
    return total * quantity;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="h-96 rounded-xl bg-card border border-border animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          <div className="text-center py-20">
            <X className="w-16 h-16 text-muted mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Product Not Found</h1>
            <p className="text-muted mb-8">The product you're looking for doesn't exist.</p>
            <Link href="/shop">
              <button className="px-6 py-3 rounded-lg bg-primary text-background font-semibold cursor-pointer">
                Back to Shop
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
          {/* Back Button */}
          <Link href="/shop" className="inline-flex items-center gap-2 text-muted hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Shop
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-card border border-border group">
                {allImages.length > 0 ? (
                  <>
                    <div 
                      className="relative w-full h-full cursor-pointer"
                      onClick={() => setIsFullscreen(true)}
                    >
                      <Image
                        src={allImages[selectedImageIndex]}
                        alt={product.name}
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>

                    {/* Navigation Arrows - Hidden on mobile */}
                    {allImages.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePreviousImage();
                          }}
                          className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                          aria-label="Previous image"
                        >
                          <ChevronLeft className="w-6 h-6 text-white" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNextImage();
                          }}
                          className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                          aria-label="Next image"
                        >
                          <ChevronRight className="w-6 h-6 text-white" />
                        </button>
                      </>
                    )}

                    {/* Fullscreen Button */}
                    <button
                      onClick={() => setIsFullscreen(true)}
                      className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                      aria-label="Fullscreen"
                    >
                      <Maximize className="w-5 h-5 text-white" />
                    </button>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingCart className="w-32 h-32 text-primary/30" />
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                  {product.subscription && (
                    <span className="px-3 py-1.5 text-xs font-semibold rounded-full border border-primary/70 text-primary bg-background/60">
                      Subscription
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
              </div>

              {/* Thumbnail Gallery */}
              {allImages.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {allImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative aspect-square rounded-lg overflow-hidden bg-gradient-card border-2 transition-all cursor-pointer ${
                        selectedImageIndex === index
                          ? 'border-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex flex-col">
              <h1 className="text-4xl font-bold mb-4">{product.name}</h1>

              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-5xl font-bold text-primary">
                  {calculateTotalPrice() > 0 ? `$${calculateTotalPrice().toFixed(2)}` : 'Free'}
                </span>
                {product.subscription && product.period_num > 0 && product.duration_periodicity ? (
                  <span className="text-lg text-muted">
                    / {product.period_num > 1 ? `${product.period_num} ` : ''}{product.duration_periodicity}
                    {product.period_num > 1 ? 's' : ''}
                  </span>
                ) : null}
                {product.old_price && product.old_price > product.price && product.price > 0 ? (
                  <span className="text-2xl text-muted line-through">
                    ${(product.old_price * quantity).toFixed(2)}
                  </span>
                ) : null}
                {product.custom_fields && product.custom_fields.length > 0 && product.price > 0 ? (
                  <span className="text-sm text-muted">
                    (Base: ${(product.price * quantity).toFixed(2)})
                  </span>
                ) : null}
              </div>

              {product.subscription ? (
                <div className="mb-6 p-4 rounded-lg bg-secondary/10 border border-secondary/20">
                  <p className="text-sm">
                    <span className="font-semibold">Subscription:</span> Renews every{' '}
                    {product.period_num && product.period_num > 1 ? `${product.period_num} ` : ''}{product.duration_periodicity}
                    {product.period_num && product.period_num > 1 ? 's' : ''}
                  </p>
                  {product.trial && product.trial > 0 ? (
                    <p className="text-sm mt-2">
                      <span className="font-semibold text-primary">Free Trial:</span> {product.trial} day
                      {product.trial > 1 ? 's' : ''}
                    </p>
                  ) : null}
                </div>
              ) : null}

              {product.description && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2">Description</h2>
                  <div 
                    className="text-white leading-relaxed prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                </div>
              )}

              {/* Server Selection */}
              {product.server_choice && product.server_options && product.server_options.length > 0 && (
                <div className="mb-6 space-y-2">
                  <h2 className="text-lg font-semibold">Select Server</h2>
                  <select
                    value={serverSelection ?? ''}
                    onChange={(e) => setServerSelection(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-lg bg-card border border-border focus:border-primary outline-none transition-colors cursor-pointer"
                  >
                    <option value="" disabled>
                      Choose a server
                    </option>
                    {product.server_options.map((server) => (
                      <option key={server.id} value={server.id}>
                        {server.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Custom Fields */}
              {product.custom_fields && product.custom_fields.length > 0 && (
                <div className="mb-6 space-y-4">
                  <h2 className="text-lg font-semibold">Customize Your Order</h2>
                  {product.custom_fields
                    .sort((a, b) => a.order - b.order)
                    .map((field) => {
                      const key = field.marker || field.id.toString();
                      
                      return (
                        <div key={field.id} className="space-y-2">
                          <label className="text-sm font-medium flex items-center gap-2">
                            {field.name}
                            {field.required && <span className="text-accent">*</span>}
                            {field.instruction && (
                              <div className="relative group">
                                <HelpCircle className="w-4 h-4 text-muted hover:text-primary cursor-help transition-colors" />
                                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-10 w-64">
                                  <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-xs text-foreground whitespace-pre-wrap">
                                    {field.instruction}
                                  </div>
                                </div>
                              </div>
                            )}
                            {field.price && field.price > 0 && field.type !== 'select' && (
                              <span className="text-primary text-xs">
                                +${field.price.toFixed(2)}
                              </span>
                            )}
                          </label>

                          {/* Checkbox */}
                          {field.type === 'checkbox' && (
                            <label className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border hover:border-primary transition-colors cursor-pointer">
                              <input
                                type="checkbox"
                                checked={customFields[key] || false}
                                onChange={(e) => handleCustomFieldChange(field, e.target.checked)}
                                className="w-5 h-5 mt-0.5 rounded border-border bg-card"
                              />
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">{field.name}</span>
                                  {field.price && field.price > 0 && (
                                    <span className="text-primary font-semibold">
                                      +${field.price.toFixed(2)}
                                    </span>
                                  )}
                                </div>
                                {field.default_value && (
                                  <p className="text-sm text-muted mt-1">{field.default_value}</p>
                                )}
                              </div>
                            </label>
                          )}

                          {/* Text Input */}
                          {field.type === 'text' && (
                            <input
                              type="text"
                              value={customFields[key] || ''}
                              onChange={(e) => handleCustomFieldChange(field, e.target.value)}
                              placeholder={field.default_value?.toString() || ''}
                              required={field.required}
                              className="w-full px-4 py-3 rounded-lg bg-card border border-border focus:border-primary outline-none transition-colors"
                            />
                          )}

                          {/* Number/Range Input */}
                          {(field.type === 'number' || field.type === 'range') && (
                            <div className="space-y-2">
                              {field.number_type === 'range' ? (
                                <>
                                  <input
                                    type="range"
                                    min={field.minimum || 0}
                                    max={field.maximum || 100}
                                    step={field.step || 1}
                                    value={customFields[key] || field.default_value || field.minimum || 0}
                                    onChange={(e) => handleCustomFieldChange(field, parseFloat(e.target.value))}
                                    className="w-full accent-primary"
                                  />
                                  <div className="flex justify-between text-sm text-muted">
                                    <span>{field.minimum || 0}</span>
                                    <span className="text-foreground font-semibold">
                                      {customFields[key] || field.default_value || field.minimum || 0}
                                    </span>
                                    <span>{field.maximum || 100}</span>
                                  </div>
                                </>
                              ) : (
                                <input
                                  type="number"
                                  min={field.minimum}
                                  max={field.maximum}
                                  step={field.step || 1}
                                  value={customFields[key] || ''}
                                  onChange={(e) => handleCustomFieldChange(field, parseFloat(e.target.value))}
                                  placeholder={field.default_value?.toString() || ''}
                                  required={field.required}
                                  className="w-full px-4 py-3 rounded-lg bg-card border border-border focus:border-primary outline-none transition-colors"
                                />
                              )}
                            </div>
                          )}

                          {/* Select/Dropdown */}
                          {(field.type === 'select' || field.type === 'selection' || field.type === 'dropdown' || field.type === 'choice') && field.options && field.options.length > 0 && (
                            <div className="relative">
                              <select
                                value={customFields[key] || ''}
                                onChange={(e) => handleCustomFieldChange(field, e.target.value)}
                                required={field.required}
                                className="w-full px-4 py-3 rounded-lg bg-card border border-border focus:border-primary outline-none transition-colors cursor-pointer appearance-none pr-10"
                              >
                                <option value="" disabled>
                                  Choose your {field.name.toLowerCase()}
                                </option>
                                {field.options
                                  .sort((a, b) => a.order - b.order)
                                  .map((option) => (
                                    <option key={option.id} value={option.id.toString()}>
                                      {option.name}
                                      {option.price !== undefined && option.price !== null && option.price > 0 && ` (+$${option.price.toFixed(2)})`}
                                    </option>
                                  ))}
                              </select>
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>
                          )}

                          {/* Debug: Unknown field type */}
                          {field.type !== 'checkbox' && 
                           field.type !== 'text' && 
                           field.type !== 'number' && 
                           field.type !== 'range' && 
                           field.type !== 'select' && 
                           field.type !== 'selection' && 
                           field.type !== 'dropdown' && 
                           field.type !== 'choice' && (
                            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                              <p className="text-xs text-yellow-500">
                                Unknown field type: &quot;{field.type}&quot;
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}

              {/* Custom Rules Display */}
              {product.custom_rules && product.custom_rules.length > 0 && (
                <div className="mb-6 space-y-3">
                  <h2 className="text-lg font-semibold">Field Limits</h2>
                  {validateCustomRules(product.custom_rules, customFields, product.custom_fields)
                    .map((validation) => {
                      const { rule, total, isValid } = validation;
                      const statusColor = isValid ? 'text-green-400' : 'text-red-400';
                      const bgColor = isValid ? 'bg-green-500/10' : 'bg-red-500/10';
                      const borderColor = isValid ? 'border-green-500/30' : 'border-red-500/30';

                      return (
                        <div
                          key={rule.id}
                          className={`p-4 rounded-lg border ${bgColor} ${borderColor}`}
                        >
                          <p className={`text-sm font-medium ${statusColor}`}>
                            Total {rule.name}: <span className="font-bold">{total}</span>
                          </p>
                          {(rule.min !== undefined || rule.max !== undefined) && (
                            <p className="text-xs text-muted mt-1">
                              {rule.min !== undefined && rule.max !== undefined
                                ? `Between ${rule.min} and ${rule.max}`
                                : rule.min !== undefined
                                  ? `Minimum: ${rule.min}`
                                  : `Maximum: ${rule.max}`}
                            </p>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}

              {/* Subscription Type Choice */}
              {canChooseOnetimeSubscription && (
                <div className="mb-6 space-y-2">
                  <label className="text-sm font-semibold">Subscription Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setSubscriptionType('onetime')}
                      className={`px-4 py-3 rounded-lg border-2 transition-all font-medium ${
                        subscriptionType === 'onetime'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-background hover:border-primary/50'
                      }`}
                    >
                      One-time
                    </button>
                    <button
                      onClick={() => setSubscriptionType('recurring')}
                      className={`px-4 py-3 rounded-lg border-2 transition-all font-medium ${
                        subscriptionType === 'recurring'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-background hover:border-primary/50'
                      }`}
                    >
                      Subscribe
                    </button>
                  </div>
                  {product.period_num && product.duration_periodicity && (
                    <p className="text-xs text-muted">
                      {subscriptionType === 'onetime' 
                        ? 'One-time purchase with interval: ' + (product.period_num > 1 ? product.period_num + ' ' : '') + product.duration_periodicity + (product.period_num > 1 ? 's' : '')
                        : 'Renews every ' + (product.period_num > 1 ? product.period_num + ' ' : '') + product.duration_periodicity + (product.period_num > 1 ? 's' : '')
                      }
                    </p>
                  )}
                </div>
              )}

              {/* Quantity Selector (if allowed) */}
              {product.quantity && (
                <div className="mb-6">
                  <label className="text-sm font-semibold mb-2 block">Quantity</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-lg bg-card border border-border hover:border-primary transition-colors cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => {
                        const newQuantity = parseInt(e.target.value) || 1;
                        const maxQuantity = typeof product.stock === 'number' ? product.stock : newQuantity;
                        setQuantity(Math.max(1, Math.min(newQuantity, maxQuantity)));
                      }}
                      min={1}
                      max={typeof product.stock === 'number' ? product.stock : undefined}
                      className="w-20 h-10 text-center rounded-lg bg-card border border-border"
                    />
                    <button
                      onClick={() => {
                        const maxQuantity = typeof product.stock === 'number' ? product.stock : quantity + 1;
                        setQuantity(Math.min(quantity + 1, maxQuantity));
                      }}
                      disabled={typeof product.stock === 'number' && quantity >= product.stock}
                      className="w-10 h-10 rounded-lg bg-card border border-border hover:border-primary transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                  {typeof product.stock === 'number' && (
                    <p className="text-xs text-muted mt-2">
                      Max available: {product.stock}
                    </p>
                  )}
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-500">{error}</p>
                  </div>
                  <button
                    onClick={() => setError(null)}
                    className="text-red-500/60 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Add to Cart & Buy Now Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={added || (typeof product.stock === 'number' && product.stock === 0)}
                  className="w-full px-8 py-4 rounded-xl bg-primary hover:bg-primary/90 text-background font-semibold text-lg transition-all glow-primary hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {added ? (
                    <>
                      <Check className="w-5 h-5" />
                      Added to Cart
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      Add to Cart
                    </>
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={typeof product.stock === 'number' && product.stock === 0}
                  className="w-full px-8 py-4 rounded-xl bg-secondary hover:bg-secondary/90 text-background font-semibold text-lg transition-all glow-secondary hover:scale-105 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowRight className="w-5 h-5" />
                  {product.subscription && subscriptionType === 'recurring' ? 'Subscribe Now' : 'Buy Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Image Modal */}
      {isFullscreen && allImages.length > 0 && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center overflow-hidden"
          style={{ touchAction: 'none' }}
          onClick={() => setIsFullscreen(false)}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Close Button */}
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer z-10"
            aria-label="Close fullscreen"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Image Counter */}
          {allImages.length > 1 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium">
              {selectedImageIndex + 1} / {allImages.length}
            </div>
          )}

          {/* Main Fullscreen Image */}
          <div 
            className="relative overflow-hidden pointer-events-none"
            style={{ width: '60%', height: '60%', WebkitOverflowScrolling: 'touch' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex h-full"
              style={{
                transform: `translateX(calc(-${selectedImageIndex * 100}% + ${dragOffset}px))`,
                transition: shouldTransition ? 'transform 0.3s ease-out' : 'none',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {/* Render all images in a row */}
              {allImages.map((image, index) => (
                <div 
                  key={index} 
                  className="relative flex-shrink-0" 
                  style={{ width: '60vw', height: '60vh' }}
                >
                  <Image
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows - Hidden on mobile */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePreviousImage();
                }}
                className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 items-center justify-center transition-colors cursor-pointer"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-8 h-8 text-white" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextImage();
                }}
                className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 items-center justify-center transition-colors cursor-pointer"
                aria-label="Next image"
              >
                <ChevronRight className="w-8 h-8 text-white" />
              </button>
            </>
          )}

          {/* Thumbnail Navigation */}
          {allImages.length > 1 && (
            <div 
              className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-full px-4 overflow-x-auto"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              <style jsx>{`
                div::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              {allImages.map((image, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIndex(index);
                  }}
                  className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                    selectedImageIndex === index
                      ? 'border-primary'
                      : 'border-white/30 hover:border-white/60'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
