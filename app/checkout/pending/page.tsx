'use client';

import { Clock } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useCart } from '@/hooks/use-cart';

export default function CheckoutPendingPage() {
  const clearCart = useCart((state) => state.clearCart);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen py-12 flex items-center justify-center">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="w-24 h-24 rounded-full bg-secondary/20 border-4 border-secondary flex items-center justify-center mx-auto mb-6 glow-secondary">
            <Clock className="w-12 h-12 text-secondary" />
          </div>

          <h1 className="text-4xl font-bold mb-4">Payment Pending</h1>
          <p className="text-xl text-muted mb-8">
            Your payment is being processed. This may take a few moments.
          </p>

          <div className="p-6 rounded-xl bg-card border border-border mb-8">
            <p className="text-sm text-muted">
              We'll send you a confirmation email once your payment has been processed.
              Please do not close this page or refresh your browser.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <button className="px-8 py-3 rounded-xl bg-primary hover:bg-primary/90 text-background font-semibold transition-all glow-primary cursor-pointer">
                Back to Home
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
