"use client";

import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  PaymentElement,
  LinkAuthenticationElement,
  Elements,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PRODUCTS } from "@/lib/products";
import { createPaymentIntent, createSubscription } from "@/app/actions/stripe";
import { useAuth } from "@/hooks/use-auth";
import { X } from "lucide-react";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface PaymentFormProps {
  productId: string;
  onSuccess: () => void;
  onClose: () => void;
}

function PaymentForm({ productId, onSuccess, onClose }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const product = PRODUCTS.find((p) => p.id === productId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !product) {
      return;
    }

    setProcessing(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message || "An error occurred");
      setProcessing(false);
      return;
    }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin,
      },
      redirect: "if_required",
    });

    if (confirmError) {
      setError(confirmError.message || "Payment failed");
      setProcessing(false);
    } else {
      // Payment succeeded
      onSuccess();
    }
  };

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
        <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
        <p className="text-sm text-muted-foreground mb-2">
          {product.description}
        </p>
        <p className="text-2xl font-bold">
          ${(product.priceInCents / 100).toFixed(2)}
          {product.type === "subscription" && (
            <span className="text-sm text-muted-foreground">/month</span>
          )}
        </p>
      </div>

      <LinkAuthenticationElement />
      <PaymentElement
        options={{
          fields: {
            billingDetails: {
              address: "auto",
            },
          },
          wallets: {
            applePay: "auto",
            googlePay: "auto",
          },
        }}
      />

      <div>
        <label className="text-sm font-medium mb-2 block">
          Promo Code (optional)
        </label>
        <input
          type="text"
          placeholder="Enter promo code"
          className="w-full px-3 py-2 border rounded-md"
          onChange={(e) => {
            // Stripe automatically applies promo codes when entered
            // We can enhance this later with real-time validation
          }}
        />
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={processing}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || processing}
          className="flex-1"
        >
          {processing
            ? "Processing..."
            : `Pay $${(product.priceInCents / 100).toFixed(2)}`}
        </Button>
      </div>
    </form>
  );
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  onSuccess: () => void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  productId,
  onSuccess,
}: PaymentModalProps) {
  const { user } = useAuth();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  const product = PRODUCTS.find((p) => p.id === productId);

  useEffect(() => {
    if (!isOpen || !product) {
      setClientSecret(null);
      setLoading(true);
      return;
    }

    const initializePayment = async () => {
      try {
        setLoading(true);

        // For subscriptions, redirect to Checkout
        if (product.type === "subscription") {
          const { url } = await createSubscription(
            productId,
            user?.email || undefined
          );
          setRedirectUrl(url);
          // Redirect immediately
          window.location.href = url;
          return;
        }

        // For one-time payments, use Payment Element
        const { clientSecret: secret } = await createPaymentIntent(
          productId,
          user?.email || undefined
        );
        setClientSecret(secret);
      } catch (error: any) {
        console.error("Failed to initialize payment:", error);
        alert(error.message || "Failed to initialize payment");
        onClose();
      } finally {
        setLoading(false);
      }
    };

    initializePayment();
  }, [isOpen, productId, product, user, onClose]);

  if (!product) {
    return null;
  }

  // Don't show modal for subscriptions - we redirect instead
  if (product.type === "subscription" && redirectUrl) {
    return null;
  }

  const options = clientSecret
    ? {
        clientSecret,
        appearance: {
          theme: "stripe" as const,
          variables: {
            colorPrimary: "#000000",
          },
        },
        fields: {
          billingDetails: {
            address: {
              country: "auto",
            },
          },
        },
      }
    : undefined;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Complete Purchase
            <button
              onClick={onClose}
              className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
          </div>
        ) : clientSecret && options ? (
          <Elements stripe={stripePromise} options={options}>
            <PaymentForm
              productId={productId}
              onSuccess={onSuccess}
              onClose={onClose}
            />
          </Elements>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Failed to load payment form
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
