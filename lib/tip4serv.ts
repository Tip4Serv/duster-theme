/**
 * TypeScript types for the tip4serv.js library
 * @see https://js.tip4serv.com/
 */

export interface Tip4ServProductSimple {
  product: string | number; // Product slug or ID
  quantity?: number;
  serverSelection?: number;
  donationAmount?: number;
  subscription?: boolean; // false to disable auto-renewal
  customFields?: Record<string | number, string | number | boolean>;
}

export interface Tip4ServCheckoutOptions {
  // Store ID (optional if set via data-store-id on script tag)
  storeId?: number | string;
  
  // Single product mode
  product?: string | number;
  quantity?: number;
  donationAmount?: number;
  serverSelection?: number;
  subscription?: boolean;
  customFields?: Record<string | number, string | number | boolean>;
  
  // Multi-product mode (Expert)
  products?: (string | number | Tip4ServProductSimple)[];
  
  // Redirect URLs
  successUrl?: string;
  cancelUrl?: string;
  
  // Callbacks
  onSuccess?: () => void;
  onPending?: () => void;
  onCancel?: () => void;
  onFail?: (error: Error) => void;
}

export interface Tip4ServCheckout {
  open(options: Tip4ServCheckoutOptions): void;
}

export interface Tip4ServGlobal {
  Checkout: Tip4ServCheckout;
}

// Extend the global Window interface
declare global {
  interface Window {
    Tip4Serv?: Tip4ServGlobal;
  }
}

/**
 * Strip HTML tags from a string
 */
function stripHtmlTags(text: string): string {
  return text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/<[^>]*>/g, '');
}

/**
 * Custom error class to preserve HTML messages
 */
export class Tip4ServError extends Error {
  public readonly htmlMessage: string;
  public readonly code: string;

  constructor(message: string, code: string = 'UNKNOWN') {
    super(message);
    this.name = 'Tip4ServError';
    this.htmlMessage = message;
    this.code = code;
  }
}

/**
 * Wait for Tip4Serv library to be available
 * Polls every 100ms for up to 5 seconds
 */
function waitForTip4Serv(timeout = 5000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Tip4Serv) {
      resolve();
      return;
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      if (window.Tip4Serv) {
        clearInterval(interval);
        resolve();
      } else if (Date.now() - startTime > timeout) {
        clearInterval(interval);
        reject(new Error('Tip4Serv library failed to load. Please refresh the page and try again.'));
      }
    }, 100);
  });
}

// Store reference to the checkout popup window
let checkoutPopupRef: Window | null = null;

/**
 * Close the Tip4Serv checkout popup/overlay
 * The library uses window.open for the popup and creates an overlay on the page
 */
function closeTip4ServPopup(): void {
  // Remove the Tip4Serv overlay from the page
  const overlay = document.getElementById('tip4serv-overlay');
  if (overlay) {
    overlay.remove();
  }
  
  // Remove the overlay style
  const overlayStyle = document.getElementById('tip4serv-overlay-style');
  if (overlayStyle) {
    overlayStyle.remove();
  }
  
  // Close the popup window if we have a reference to it
  if (checkoutPopupRef && !checkoutPopupRef.closed) {
    try {
      checkoutPopupRef.close();
    } catch {
      // Ignore errors
    }
  }
  checkoutPopupRef = null;
}

/**
 * Intercept window.open to capture the checkout popup reference
 */
function setupPopupInterceptor(): void {
  const originalOpen = window.open.bind(window);
  window.open = function(url?: string | URL, target?: string, features?: string): Window | null {
    const popup = originalOpen(url, target, features);
    if (target === 'tip4serv_checkout' && popup) {
      checkoutPopupRef = popup;
    }
    return popup;
  };
}

// Set up the interceptor when the module loads
if (typeof window !== 'undefined') {
  setupPopupInterceptor();
}

/**
 * Helper function to open Tip4Serv checkout
 * Returns a promise that resolves/rejects based on checkout result
 */
export async function openTip4ServCheckout(options: Tip4ServCheckoutOptions): Promise<'success' | 'pending'> {
  // Wait for the library to be loaded
  await waitForTip4Serv();

  return new Promise((resolve, reject) => {
    window.Tip4Serv!.Checkout.open({
      ...options,
      onSuccess: () => {
        options.onSuccess?.();
        resolve('success');
      },
      onPending: () => {
        options.onPending?.();
        resolve('pending');
      },
      onCancel: () => {
        options.onCancel?.();
        reject(new Error('Checkout cancelled'));
      },
      onFail: (error) => {
        options.onFail?.(error);
        // Close the popup and overlay
        closeTip4ServPopup();
        // Tip4Serv error format is {code: string, message: string}
        let errorMessage = 'An error occurred during checkout';
        let errorCode = 'UNKNOWN';
        if (error && typeof error === 'object') {
          const errorObj = error as unknown as Record<string, unknown>;
          // Tip4Serv uses 'message' field for the error text (may contain HTML)
          if ('message' in errorObj && typeof errorObj.message === 'string') {
            errorMessage = stripHtmlTags(errorObj.message);
          } else if ('error' in errorObj && typeof errorObj.error === 'string') {
            errorMessage = stripHtmlTags(errorObj.error);
          } else if (error instanceof Error) {
            errorMessage = error.message;
          }
          if ('code' in errorObj && typeof errorObj.code === 'string') {
            errorCode = errorObj.code;
          }
        } else if (typeof error === 'string') {
          errorMessage = stripHtmlTags(error);
        }
        // Use custom error class to preserve the message
        reject(new Tip4ServError(errorMessage, errorCode));
      },
    });
  });
}
