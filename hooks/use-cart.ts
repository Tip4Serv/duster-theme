'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { areCustomFieldsDifferent, calculateNumberRangeCharge } from '@/lib/cart-utils';
import type { ProductGeneral, ProductDetailed } from '@/lib/schemas';

export type CartItem = {
  product: ProductGeneral | ProductDetailed;
  quantity: number;
  customFields?: Record<string, any>;
  serverSelection?: number;
  donationAmount?: number;
  subscriptionType?: 'onetime' | 'recurring';
};

type CartStore = {
  items: CartItem[];
  lastModified: number;
  addItem: (product: ProductGeneral | ProductDetailed, quantity?: number, customFields?: Record<string, any>, subscriptionType?: 'onetime' | 'recurring') => void;
  removeItem: (productId: number, customFields?: Record<string, any>) => void;
  removeItemByIndex: (index: number) => void;
  updateQuantity: (productId: number, quantity: number, customFields?: Record<string, any>) => void;
  updateCustomFields: (productId: number, fields: Record<string, any>, customFields?: Record<string, any>) => void;
  updateServerSelection: (productId: number, serverId: number, customFields?: Record<string, any>) => void;
  updateDonationAmount: (productId: number, amount: number, customFields?: Record<string, any>) => void;
  updateSubscriptionType: (productId: number, type: 'onetime' | 'recurring', customFields?: Record<string, any>) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  isExpired: () => boolean;
  clearIfExpired: () => void;
};

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      lastModified: Date.now(),

      addItem: (product, quantity = 1, customFields = {}, subscriptionType) => {
        set((state) => {
          // Ensure we always have an items array to prevent cart replacement
          const currentItems = Array.isArray(state.items) ? [...state.items] : [];
          
          // Validate stock constraint - check ALL instances of this product regardless of custom fields
          if (typeof product.stock === 'number') {
            const totalCurrentInCart = currentItems
              .filter((item) => item.product.id === product.id)
              .reduce((sum, item) => sum + item.quantity, 0);
            const totalWillBe = totalCurrentInCart + quantity;
            
            // If adding would exceed stock, cap the quantity
            if (totalWillBe > product.stock) {
              // Only add what's remaining
              const remaining = Math.max(0, product.stock - totalCurrentInCart);
              quantity = remaining;
              
              // If nothing left to add, don't proceed
              if (quantity <= 0) {
                return { items: currentItems, lastModified: Date.now() };
              }
            }
          }
          
          // Only check if THIS product is a recurring subscription (not just any subscription)
          const isAddingRecurringSubscription = product.subscription && subscriptionType === 'recurring';
          
          // If adding a recurring subscription, clear the entire cart
          if (isAddingRecurringSubscription) {
            return {
              items: [{ product, quantity, customFields, subscriptionType }],
              lastModified: Date.now(),
            };
          }
          
          // If cart already has a recurring subscription and we're adding a non-subscription product,
          // remove the recurring subscriptions
          const hasRecurringSubscriptionInCart = currentItems.some((item) => item.subscriptionType === 'recurring');
          let newItems = currentItems;
          
          if (hasRecurringSubscriptionInCart && !product.subscription) {
            newItems = currentItems.filter((item) => item.subscriptionType !== 'recurring');
          }
          
          // Check if this exact product already exists in cart with the SAME custom fields AND donation amount
          // If custom fields or donation amount are different, treat as a separate item
          const existingItemIndex = newItems.findIndex((item) => {
            if (item.product.id !== product.id) {
              return false;
            }
            // If both have no custom fields, check donation amount
            const item1Empty = !item.customFields || Object.keys(item.customFields).length === 0;
            const item2Empty = !customFields || Object.keys(customFields).length === 0;
            if (item1Empty && item2Empty) {
              // Same custom fields (both empty), but check donation amount
              return item.donationAmount === undefined;
            }
            // Check if custom fields are identical AND donation amounts match
            const sameCustomFields = !areCustomFieldsDifferent(item.customFields, customFields);
            const sameDonation = item.donationAmount === undefined;
            return sameCustomFields && sameDonation;
          });

          if (existingItemIndex >= 0) {
            // Update existing item - increase quantity only (don't change custom fields)
            const existingItem = newItems[existingItemIndex];
            
            // Create new array with updated item
            const updatedItems = [...newItems];
            updatedItems[existingItemIndex] = { 
              ...existingItem, 
              quantity: existingItem.quantity + quantity,
              subscriptionType: subscriptionType || existingItem.subscriptionType 
            };
            
            return {
              items: updatedItems,
              lastModified: Date.now(),
            };
          }

          // Product with different custom fields - add as separate item
          return {
            items: [...newItems, { product, quantity, customFields, subscriptionType }],
            lastModified: Date.now(),
          };
        });
      },

      removeItem: (productId: number, customFields?: Record<string, any>) => {
        set((state) => ({
          items: state.items.filter((item) => {
            if (item.product.id !== productId) {
              return true;
            }
            // If no custom fields provided, remove all instances of this product
            if (!customFields || Object.keys(customFields).length === 0) {
              return !(!item.customFields || Object.keys(item.customFields).length === 0);
            }
            // Otherwise, only remove the item with matching custom fields
            return areCustomFieldsDifferent(item.customFields, customFields);
          }),
          lastModified: Date.now(),
        }));
      },

      removeItemByIndex: (index: number) => {
        set((state) => ({
          items: state.items.filter((_, i) => i !== index),
          lastModified: Date.now(),
        }));
      },

      updateQuantity: (productId: number, quantity: number, customFields?: Record<string, any>) => {
        if (quantity <= 0) {
          get().removeItem(productId, customFields);
          return;
        }

        set((state) => ({
          items: state.items.map((item) => {
            if (item.product.id !== productId) {
              return item;
            }
            // Match by custom fields if provided, otherwise match first item with this product ID
            if (!customFields || Object.keys(customFields).length === 0) {
              const itemHasNoCustomFields = !item.customFields || Object.keys(item.customFields).length === 0;
              if (itemHasNoCustomFields) {
                return { ...item, quantity };
              }
              return item;
            }
            if (!areCustomFieldsDifferent(item.customFields, customFields)) {
              return { ...item, quantity };
            }
            return item;
          }),
          lastModified: Date.now(),
        }));
      },

      updateCustomFields: (productId: number, fields: Record<string, any>, customFields?: Record<string, any>) => {
        set((state) => ({
          items: state.items.map((item) => {
            if (item.product.id !== productId) {
              return item;
            }
            // Match by old custom fields if provided
            if (!customFields || Object.keys(customFields).length === 0) {
              const itemHasNoCustomFields = !item.customFields || Object.keys(item.customFields).length === 0;
              if (itemHasNoCustomFields) {
                return { ...item, customFields: fields };
              }
              return item;
            }
            if (!areCustomFieldsDifferent(item.customFields, customFields)) {
              return { ...item, customFields: fields };
            }
            return item;
          }),
          lastModified: Date.now(),
        }));
      },

      updateServerSelection: (productId: number, serverId: number, customFields?: Record<string, any>) => {
        set((state) => ({
          items: state.items.map((item) => {
            if (item.product.id !== productId) {
              return item;
            }
            if (!customFields || Object.keys(customFields).length === 0) {
              const itemHasNoCustomFields = !item.customFields || Object.keys(item.customFields).length === 0;
              if (itemHasNoCustomFields) {
                return { ...item, serverSelection: serverId, product: { ...(item.product as any), server_selection: serverId } };
              }
              return item;
            }
            if (!areCustomFieldsDifferent(item.customFields, customFields)) {
              return { ...item, serverSelection: serverId, product: { ...(item.product as any), server_selection: serverId } };
            }
            return item;
          }),
          lastModified: Date.now(),
        }));
      },

      updateDonationAmount: (productId: number, amount: number, customFields?: Record<string, any>) => {
        set((state) => {
          // Find the exact item to update - match product ID and custom fields
          // This handles the case where the same product might have different donation amounts
          let found = false;
          const updatedItems = state.items.map((item) => {
            if (item.product.id !== productId || found) {
              return item;
            }
            // Match custom fields exactly
            if (!customFields || Object.keys(customFields).length === 0) {
              const itemHasNoCustomFields = !item.customFields || Object.keys(item.customFields).length === 0;
              if (itemHasNoCustomFields && !item.donationAmount) {
                found = true;
                return { ...item, donationAmount: amount };
              }
              return item;
            }
            if (!areCustomFieldsDifferent(item.customFields, customFields)) {
              found = true;
              return { ...item, donationAmount: amount };
            }
            return item;
          });
          return { items: updatedItems, lastModified: Date.now() };
        });
      },

      updateSubscriptionType: (productId: number, type: 'onetime' | 'recurring', customFields?: Record<string, any>) => {
        set((state) => ({
          items: state.items.map((item) => {
            if (item.product.id !== productId) {
              return item;
            }
            if (!customFields || Object.keys(customFields).length === 0) {
              const itemHasNoCustomFields = !item.customFields || Object.keys(item.customFields).length === 0;
              if (itemHasNoCustomFields) {
                return { ...item, subscriptionType: type };
              }
              return item;
            }
            if (!areCustomFieldsDifferent(item.customFields, customFields)) {
              return { ...item, subscriptionType: type };
            }
            return item;
          }),
          lastModified: Date.now(),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotal: () => {
        const state = get();
        return state.items.reduce((total, item) => {
          // For donation products, use donation amount as the item price (not multiplied by quantity)
          if ('donation' in item.product && item.product.donation && item.donationAmount !== undefined) {
            return total + item.donationAmount;
          }

          let itemPrice = item.product.price;
          
          // Add custom field prices
          if (item.customFields && 'custom_fields' in item.product && item.product.custom_fields) {
            item.product.custom_fields.forEach((field) => {
              const key = field.id.toString();
              const value = item.customFields?.[key];
              
              if (field.type === 'checkbox' && value) {
                itemPrice += field.price || 0;
              } else if ((field.type === 'select' || field.type === 'selection' || field.type === 'dropdown' || field.type === 'choice') && value && field.options) {
                const selectedOption = field.options.find((opt) => opt.id.toString() === value.toString());
                if (selectedOption) {
                  itemPrice += selectedOption.price || 0;
                }
              } else if (field.type === 'number' || field.type === 'range') {
                itemPrice += calculateNumberRangeCharge(field, value);
              }
            });
          }
          
          return total + (itemPrice * item.quantity);
        }, 0);
      },

      getItemCount: () => {
        const state = get();
        return state.items.reduce((count, item) => count + item.quantity, 0);
      },

      isExpired: () => {
        const state = get();
        const TWELVE_HOURS = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
        return Date.now() - state.lastModified > TWELVE_HOURS;
      },

      clearIfExpired: () => {
        const state = get();
        if (state.isExpired()) {
          set({ items: [], lastModified: Date.now() });
        }
      },
    }),
    {
      name: 'duster-theme-cart',
      version: 0,
    }
  )
);
