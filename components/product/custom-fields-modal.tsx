'use client';

import { useState, useEffect } from 'react';
import { X, ShoppingCart, AlertCircle, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ProductDetailed, CustomField } from '@/lib/schemas';
import { useCart } from '@/hooks/use-cart';
import { validateCustomRules, getCustomRulesErrorMessage } from '@/lib/custom-rules-utils';
import { calculateNumberRangeCharge } from '@/lib/cart-utils';
import Image from 'next/image';

type CustomFieldsModalProps = {
  product: ProductDetailed;
  isOpen: boolean;
  onClose: () => void;
};

export function CustomFieldsModal({ product, isOpen, onClose }: CustomFieldsModalProps) {
  const cart = useCart();
  const [quantity, setQuantity] = useState(1);
  const [customFields, setCustomFields] = useState<Record<string, any>>({});
  const [error, setError] = useState<string | null>(null);
  const [subscriptionType, setSubscriptionType] = useState<'onetime' | 'recurring'>('recurring');
  const [serverSelection, setServerSelection] = useState<number | undefined>(undefined);

  // Determine if we should show subscription type choice
  const isSubscription = product.subscription;
  const canChooseOnetimeSubscription = isSubscription && product.onetime_sub === true;

  const handleCustomFieldChange = (field: CustomField, value: any) => {
    const key = field.id.toString();
    setCustomFields((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Initialize server selection to first option
  useEffect(() => {
    if (!serverSelection && product.server_options?.length) {
      setServerSelection(product.server_options[0].id);
    }
  }, [product, serverSelection]);

  const calculateTotalPrice = () => {
    let total = product.price;
    
    if (product.custom_fields) {
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

  const handleAddToCart = () => {
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
      cart.updateServerSelection(product.id, serverSelection);
    }
    onClose();
    
    // Reset form
    setQuantity(1);
    setCustomFields({});
    setSubscriptionType('recurring');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-start gap-4 p-6 border-b border-border">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gradient-card flex-shrink-0">
                  {(() => {
                    const imageSrc = product.image || product.gallery?.[0];
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
                        alt={product.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    );
                  })()}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-primary">
                      {calculateTotalPrice() > 0 ? `$${calculateTotalPrice().toFixed(2)}` : 'Free'}
                    </p>
                    {product.subscription && product.period_num && product.duration_periodicity && (
                      <span className="text-sm text-muted">
                          / {product.period_num > 1 && product.period_num} {product.duration_periodicity}
                        {product.period_num > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-background rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Server Selection */}
                {product.server_choice && product.server_options && product.server_options.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Server</label>
                    <select
                      value={serverSelection ?? ''}
                      onChange={(e) => setServerSelection(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-primary outline-none transition-colors cursor-pointer"
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
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Customize Your Order</h3>
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
                              {field.price && field.price > 0 && field.type !== 'selection' && (
                                <span className="text-primary text-xs">
                                  +${field.price.toFixed(2)}
                                </span>
                              )}
                            </label>

                            {/* Checkbox */}
                            {field.type === 'checkbox' && (
                              <label className="flex items-start gap-3 p-4 rounded-lg bg-background border border-border hover:border-primary transition-colors cursor-pointer">
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
                                className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-primary outline-none transition-colors"
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
                                    className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-primary outline-none transition-colors"
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
                                  className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-primary outline-none transition-colors cursor-pointer appearance-none pr-10"
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
                          </div>
                        );
                      })}
                  </div>
                )}

                {/* Custom Rules Display */}
                {product.custom_rules && product.custom_rules.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Field Limits</h3>
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
                  <div className="space-y-2">
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

                {/* Quantity */}
                {product.quantity && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Quantity</label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 rounded-lg bg-background border border-border hover:border-primary transition-colors cursor-pointer"
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
                        className="w-20 h-10 text-center rounded-lg bg-background border border-border"
                      />
                      <button
                        onClick={() => {
                          const maxQuantity = typeof product.stock === 'number' ? product.stock : quantity + 1;
                          setQuantity(Math.min(quantity + 1, maxQuantity));
                        }}
                        disabled={typeof product.stock === 'number' && quantity >= product.stock}
                        className="w-10 h-10 rounded-lg bg-background border border-border hover:border-primary transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-border space-y-3">
                {/* Error Message */}
                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-red-500">{error}</p>
                  </div>
                )}

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  className="w-full px-8 py-4 rounded-xl bg-primary hover:bg-primary/90 text-background font-semibold text-lg transition-all glow-primary hover:scale-105 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {product.subscription && subscriptionType === 'recurring' ? 'Subscribe' : 'Add to Cart'} - {calculateTotalPrice() > 0 ? `$${calculateTotalPrice().toFixed(2)}` : 'Free'}
                  {product.subscription && subscriptionType === 'recurring' && product.period_num && product.duration_periodicity && (
                    <span>/ {product.period_num > 1 && product.period_num} {product.duration_periodicity}{product.period_num > 1 ? 's' : ''}</span>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
