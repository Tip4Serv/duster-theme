'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/hooks/use-api';

/**
 * Component that loads the tip4serv.js script dynamically
 * Only loads when storeId is available
 */
export function Tip4ServScript() {
  const { data: store } = useStore();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Only load if we have a store ID and script isn't already loaded
    if (!store?.id) return;
    
    // Check if script is already loaded
    const existingScript = document.querySelector('script[src*="tip4serv.min.js"]');
    if (existingScript) {
      // Update the store ID attribute if needed
      if (existingScript.getAttribute('data-store-id') !== store.id.toString()) {
        existingScript.setAttribute('data-store-id', store.id.toString());
      }
      setLoaded(true);
      return;
    }

    // Create and append the script
    const script = document.createElement('script');
    script.src = 'https://js.tip4serv.com/tip4serv.min.js?v=1.0.11';
    script.setAttribute('data-store-id', store.id.toString());
    script.async = true;
    
    script.onload = () => {
      console.log('[Tip4Serv] Script loaded successfully');
      setLoaded(true);
    };
    
    script.onerror = () => {
      console.error('[Tip4Serv] Failed to load script');
    };
    
    document.head.appendChild(script);

    return () => {
      // Don't remove the script on cleanup - it should persist
    };
  }, [store?.id]);

  return null;
}
