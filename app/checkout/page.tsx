'use client';

import { useCart } from '@/hooks/use-cart';
import { useStore, useCheckoutIdentifiers, useCheckout } from '@/hooks/use-api';
import { ShoppingCart, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { CheckoutUser } from '@/lib/schemas';
import { openTip4ServCheckout, type Tip4ServProductSimple } from '@/lib/tip4serv';

const IDENTIFIER_LABELS: Record<string, string> = {
  email: 'Email Address',  username: 'Username',  minecraft_username: 'Minecraft Username',
  minecraft_uid: 'Minecraft Username',
  minecraft_uuid: 'Minecraft Username',
  steam_id: 'Steam ID',
  discord_id: 'Discord ID',
  epic_id: 'Epic Games ID',
  eos_id: 'EOS ID',
  fivem_citizen_id: 'FiveM Citizen ID',
  ingame_username: 'In-Game Username',
  rust_username: 'Rust Username',
};

// Map UUID/UID fields to username field in formData
const IDENTIFIER_FIELD_MAPPING: Record<string, string> = {
  minecraft_uid: 'minecraft_username',
  minecraft_uuid: 'minecraft_username',
};

function CheckoutContent() {
  const cart = useCart();
  const { data: store } = useStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const productIds = useMemo(() => cart.items.map(item => item.product.id), [cart.items]);
  // Use numeric store id when available
  const storeId = store?.id ? store.id.toString() : undefined;
  
  const { data: identifiersData, isLoading: loadingIdentifiers } = useCheckoutIdentifiers(
    storeId || '',
    productIds
  );
  
  const [handleCustomerIdentification, setHandleCustomerIdentification] = useState(false);
  const [flagsLoaded, setFlagsLoaded] = useState(false);
  
  const checkoutMutation = useCheckout(storeId || '');
  const mutation = checkoutMutation;
  
  const [formData, setFormData] = useState<Partial<CheckoutUser>>({
    email: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const requiredIdentifiers = identifiersData?.identifiers || [];

  // Initialize from localStorage on mount
  useEffect(() => {
    const savedFormData = localStorage.getItem('checkout_form_data');
    
    if (savedFormData) {
      try {
        const parsed = JSON.parse(savedFormData);
        setFormData(prev => ({
          ...prev,
          ...parsed,
        }));
      } catch (e) {
        console.error('Failed to parse saved form data:', e);
      }
    }
    
    setIsHydrated(true);
  }, []);

  // Handle OAuth callbacks
  useEffect(() => {
    if (!isHydrated) return;
    
    const discordId = searchParams.get('discord_id');
    const steamId = searchParams.get('steam_id');
    
    if (discordId) {
      setFormData(prev => {
        const updated = { ...prev, discord_id: discordId };
        localStorage.setItem('checkout_form_data', JSON.stringify(updated));
        return updated;
      });
      // Clean up URL
      window.history.replaceState({}, '', '/checkout');
    }
    
    if (steamId) {
      setFormData(prev => {
        const updated = { ...prev, steam_id: steamId };
        localStorage.setItem('checkout_form_data', JSON.stringify(updated));
        return updated;
      });
      // Clean up URL
      window.history.replaceState({}, '', '/checkout');
    }
  }, [searchParams, isHydrated]);

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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      // Save all form data to localStorage
      localStorage.setItem('checkout_form_data', JSON.stringify(updated));
      return updated;
    });
    
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate email (always required)
    if (!formData.email || !formData.email.includes('@')) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validate required identifiers
    requiredIdentifiers.forEach(identifier => {
      // Map UUID/UID to username field
      const fieldKey = IDENTIFIER_FIELD_MAPPING[identifier] || identifier;
      const value = formData[fieldKey as keyof CheckoutUser];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        newErrors[identifier] = `${IDENTIFIER_LABELS[identifier] || identifier} is required`;
      }
    });

    console.log('Validation errors:', newErrors);
    console.log('Required identifiers:', requiredIdentifiers);
    console.log('Form data:', formData);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);

    if (!flagsLoaded) {
      setCheckoutError('Loading checkout configuration, please try again.');
      return;
    }

    // In precheckout mode (handleCustomerIdentification=false), use tip4serv.js
    if (!handleCustomerIdentification) {
      // Build cart in tip4serv.js Expert format
      const tip4servProducts: Tip4ServProductSimple[] = cart.items.map(item => {
        const product: Tip4ServProductSimple = {
          product: item.product.id,
          quantity: item.quantity,
        };
        
        // Handle subscription type
        if (item.product.subscription && item.subscriptionType === 'onetime') {
          product.subscription = false; // Disable auto-renewal
        }
        
        // Handle custom fields
        if (item.customFields && Object.keys(item.customFields).length > 0) {
          product.customFields = item.customFields;
        }
        
        // Handle server selection
        if (item.serverSelection !== undefined && item.serverSelection !== null) {
          product.serverSelection = item.serverSelection;
        }
        
        // Handle donation amount
        if (item.donationAmount !== undefined && item.donationAmount !== null && item.donationAmount > 0) {
          product.donationAmount = item.donationAmount;
        }
        
        return product;
      });

      try {
        setIsRedirecting(true);
        
        await openTip4ServCheckout({
          storeId: storeId ? parseInt(storeId, 10) : undefined,
          products: tip4servProducts,
          successUrl: `${window.location.origin}/checkout/success`,
          cancelUrl: `${window.location.origin}/checkout/canceled`,
        });
        
        // If we get here, checkout was successful or pending
        // The library will handle the redirect
      } catch (error) {
        console.error('Tip4Serv checkout error:', error);
        setIsRedirecting(false);
        
        // Check if error has htmlMessage property (Tip4ServError)
        if (error && typeof error === 'object' && 'htmlMessage' in error) {
          setCheckoutError((error as { htmlMessage: string }).htmlMessage);
        } else if (error instanceof Error) {
          if (error.message === 'Checkout cancelled') {
            // User cancelled, no need to show error
            return;
          }
          setCheckoutError(error.message);
        } else {
          setCheckoutError('An error occurred during checkout. Please try again.');
        }
      }
      return;
    }

    // Standard checkout mode (handleCustomerIdentification=true)
    if (!validateForm()) {
      return;
    }

    let finalFormData: any = { ...formData };

    // Ensure email is always included
    if (!finalFormData.email) {
      finalFormData.email = formData.email || '';
    }

    // Ensure all required identifiers are in finalFormData
    requiredIdentifiers.forEach(identifier => {
      const fieldKey = IDENTIFIER_FIELD_MAPPING[identifier] || identifier;
      if (!(fieldKey in finalFormData)) {
        finalFormData[fieldKey] = formData[fieldKey as keyof CheckoutUser] || '';
      }
    });

    // If minecraft_username is provided and minecraft_uuid is required, look it up
    if (
      formData.minecraft_username &&
      requiredIdentifiers.some(id => id === 'minecraft_uuid' || id === 'minecraft_uid')
    ) {
      try {
        const response = await fetch(
          `/api/minecraft/uuid?username=${encodeURIComponent(formData.minecraft_username)}`
        );
        if (!response.ok) {
          throw new Error('Minecraft username not found');
        }
        const data = await response.json();
        finalFormData.minecraft_uuid = data.uuid;
        finalFormData.minecraft_username = formData.minecraft_username;
      } catch (error) {
        setCheckoutError('Could not find Minecraft UUID for the provided username. Please check the username and try again.');
        return;
      }
    }

    const checkoutData: any = {
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
      user: finalFormData,
    };

    try {
      setIsRedirecting(true);
      const response = await mutation.mutateAsync(checkoutData);
      
      if (response.url) {
        window.location.href = response.url;
        return;
      }

      setIsRedirecting(false);
    } catch (error) {
      console.error('Checkout error:', error);
      setIsRedirecting(false);
      
      // Check if error has details property with error field (from API response)
      if (error instanceof Error) {
        const errorData = error.message;
        
        try {
          const parsed = JSON.parse(errorData);
          if (parsed.error) {
            setCheckoutError(parsed.error);
            return;
          }
          if (parsed.details) {
            setCheckoutError(parsed.details);
            return;
          }
        } catch (e) {
          // not JSON, use message as-is
        }
        
        // Fallback to error message
        const errorMessage = error.message;
        if (errorMessage.includes('required')) {
          const fieldsMatch = errorMessage.match(/(\w+\s+\w+|\w+)\s+is required/gi);
          if (fieldsMatch) {
            setCheckoutError(`Please provide the following required information: ${fieldsMatch.join(', ')}`);
          } else {
            setCheckoutError(errorMessage);
          }
        } else {
          setCheckoutError(errorMessage);
        }
      } else {
        setCheckoutError('An error occurred during checkout. Please try again.');
      }
    }
  };

  if (isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-xl w-full p-8 rounded-2xl bg-card border border-border shadow-lg text-center space-y-4">
          <Loader2 className="w-10 h-10 mx-auto text-primary animate-spin" />
          <h1 className="text-2xl font-bold">Preparing your purchase</h1>
          <p className="text-muted text-lg">
            Your purchase is about to be made, you will be redirected please wait.
          </p>
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Checkout</h1>
            <p className="text-muted">Complete your purchase</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Required User Information */}
                <div className="p-6 rounded-xl bg-card border border-border">
                  <h2 className="text-xl font-semibold mb-4">Your Information</h2>
                  
                  {loadingIdentifiers ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Email (always required) */}
                      <div>
                        <label htmlFor="email" className="block text-sm font-semibold mb-2">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          id="email"
                          value={formData.email || ''}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className={`w-full px-4 py-3 rounded-lg bg-background border ${
                            errors.email ? 'border-red-500' : 'border-border'
                          } focus:border-primary focus:outline-none transition-colors`}
                          placeholder="your@email.com"
                        />
                        {errors.email && (
                          <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                        )}
                      </div>

                      {/* Dynamic Required Identifiers */}
                      {requiredIdentifiers.map((identifier) => {
                        if (identifier === 'email') return null;
                        
                        // Skip UUID/UID fields - only show username field
                        if (identifier === 'minecraft_uid' || identifier === 'minecraft_uuid') return null;
                        
                        // Check if this identifier has an OAuth button
                        const hasOAuth = ['discord_id', 'steam_id'].includes(identifier);
                        
                        return (
                          <div key={identifier}>
                            <label htmlFor={identifier} className="block text-sm font-semibold mb-2">
                              {IDENTIFIER_LABELS[identifier] || identifier} <span className="text-red-500">*</span>
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                id={identifier}
                                value={(formData[identifier as keyof CheckoutUser] as string) || ''}
                                onChange={(e) => handleInputChange(identifier, e.target.value)}
                                className={`flex-1 px-4 py-3 rounded-lg bg-background border ${
                                  errors[identifier] ? 'border-red-500' : 'border-border'
                                } focus:border-primary focus:outline-none transition-colors`}
                                placeholder={`Enter your ${IDENTIFIER_LABELS[identifier]?.toLowerCase() || identifier}`}
                              />
                              {identifier === 'discord_id' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || '';
                                    // Build redirect from current origin so it matches the domain the user is on
                                    const redirectUri = `${window.location.origin}/api/oauth/discord/callback`;
                                    // Include current path in state so callback knows where to return
                                    const returnPath = window.location.pathname + window.location.search;
                                    const state = `${window.location.origin}|${returnPath}`; // format: origin|path
                                    const discordUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=identify&state=${encodeURIComponent(state)}`;
                                    window.location.href = discordUrl;
                                  }}
                                  className="px-4 py-3 rounded-lg bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold transition-colors whitespace-nowrap flex items-center gap-2"
                                >
                                  <svg
                                    className="w-5 h-5"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path d="M20.317 4.369a19.8 19.8 0 0 0-4.885-1.515.074.074 0 0 0-.079.036c-.21.375-.444.864-.607 1.25a18.27 18.27 0 0 0-5.487 0c-.163-.386-.397-.875-.61-1.25a.077.077 0 0 0-.079-.036 19.74 19.74 0 0 0-4.885 1.515.07.07 0 0 0-.032.028C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 6.01 3.037.073.073 0 0 0 .084-.026c.462-.63.873-1.295 1.226-1.994a.07.07 0 0 0-.038-.097 13.1 13.1 0 0 1-1.872-.892.073.073 0 0 1-.007-.12c.126-.095.252-.194.373-.293a.072.072 0 0 1 .075-.01c3.928 1.793 8.18 1.793 12.062 0a.072.072 0 0 1 .075.009c.12.099.247.198.373.294a.073.073 0 0 1-.006.12c-.598.35-1.225.645-1.873.891a.07.07 0 0 0-.037.098c.353.698.765 1.363 1.225 1.993a.072.072 0 0 0 .084.028 19.86 19.86 0 0 0 6.01-3.037.071.071 0 0 0 .032-.056c.54-4.659-.91-8.7-3.847-12.291a.056.056 0 0 0-.033-.028ZM8.02 15.33c-1.183 0-2.157-.969-2.157-2.156 0-1.186.974-2.157 2.157-2.157 1.186 0 2.157.972 2.157 2.157 0 1.187-.971 2.156-2.157 2.156Zm7.975 0c-1.183 0-2.157-.969-2.157-2.156 0-1.186.974-2.157 2.157-2.157 1.186 0 2.157.972 2.157 2.157 0 1.187-.971 2.156-2.157 2.156Z" />
                                  </svg>
                                  Connect Discord
                                </button>
                              )}
                              {identifier === 'steam_id' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const origin = window.location.origin;
                                    const returnUrl = `${origin}/api/oauth/steam/callback?origin=${encodeURIComponent(origin)}`;
                                    const realm = origin;
                                    const steamUrl = `https://steamcommunity.com/openid/login?openid.ns=http://specs.openid.net/auth/2.0&openid.mode=checkid_setup&openid.return_to=${encodeURIComponent(returnUrl)}&openid.realm=${encodeURIComponent(realm)}&openid.identity=http://specs.openid.net/auth/2.0/identifier_select&openid.claimed_id=http://specs.openid.net/auth/2.0/identifier_select`;
                                    window.location.href = steamUrl;
                                  }}
                                  className="px-4 py-3 rounded-lg bg-[#1B2838] hover:bg-[#2A3F5F] text-white font-semibold transition-colors whitespace-nowrap flex items-center gap-2"
                                >
                                  <svg
                                    className="w-5 h-5"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.605 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.454 1.012H7.54zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.663 0 3.015-1.35 3.015-3.015zm-5.273-.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.253 0-2.265-1.014-2.265-2.265z" />
                                  </svg>
                                  Connect Steam
                                </button>
                              )}
                            </div>
                            {errors[identifier] && (
                              <p className="text-red-500 text-sm mt-1">{errors[identifier]}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Error Display */}
                {checkoutError && (
                  <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-500">Checkout Failed</p>
                      <p className="text-sm text-red-500/80 mt-1">{checkoutError}</p>
                    </div>
                  </div>
                )}
                
                {mutation.isError && (
                  <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-500">Checkout Failed</p>
                      <p className="text-sm text-red-500/80 mt-1">
                        {mutation.error?.message || 'An error occurred during checkout. Please try again.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isRedirecting}
                  className="w-full px-8 py-4 rounded-xl bg-primary hover:bg-primary/90 text-background font-semibold text-lg transition-all glow-primary hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isRedirecting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Complete Purchase
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 p-6 rounded-xl bg-card border border-border">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  {cart.items.map((item) => (
                    <div key={item.product.id} className="flex justify-between text-sm">
                      <span className="text-muted truncate pr-2">
                        {item.product.name} x{item.quantity}
                      </span>
                      <span className="font-semibold whitespace-nowrap">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex justify-between items-baseline">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-2xl font-bold text-primary">
                      ${cart.getTotal().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-xl w-full p-8 rounded-2xl bg-card border border-border shadow-lg text-center space-y-4">
          <Loader2 className="w-10 h-10 mx-auto text-primary animate-spin" />
          <h1 className="text-2xl font-bold">Loading checkout...</h1>
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
