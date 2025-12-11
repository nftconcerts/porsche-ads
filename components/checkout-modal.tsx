"use client";

import { useCallback } from "react";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { startCheckoutSession } from "@/app/actions/stripe";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  onSuccess: () => void;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  productId,
  onSuccess,
}: CheckoutModalProps) {
  const fetchClientSecret = useCallback(async () => {
    return await startCheckoutSession(productId, true); // Enable promotion codes
  }, [productId]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogTitle className="sr-only">Checkout</DialogTitle>
        <EmbeddedCheckoutProvider
          stripe={stripePromise}
          options={{
            fetchClientSecret,
            onComplete: () => {
              onSuccess();
              setTimeout(() => onClose(), 2000);
            },
          }}
        >
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </DialogContent>
    </Dialog>
  );
}
