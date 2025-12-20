"use server";

import { stripe } from "@/lib/stripe";
import { PRODUCTS } from "@/lib/products";

export async function createPaymentIntent(
  productId: string,
  userEmail?: string
) {
  const product = PRODUCTS.find((p) => p.id === productId);
  if (!product) {
    throw new Error(`Product with id "${productId}" not found`);
  }

  if (product.type === "subscription") {
    throw new Error("Use createSubscription for subscription products");
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: product.priceInCents,
    currency: "usd",
    automatic_payment_methods: {
      enabled: true, // Enables Apple Pay, Google Pay, etc.
    },
    metadata: {
      productId: productId,
      userEmail: userEmail || "",
    },
  });

  return {
    clientSecret: paymentIntent.client_secret!,
    paymentIntentId: paymentIntent.id,
  };
}

export async function createSubscription(
  productId: string,
  userEmail?: string
) {
  const product = PRODUCTS.find((p) => p.id === productId);
  if (!product) {
    throw new Error(`Product with id "${productId}" not found`);
  }

  if (product.type !== "subscription") {
    throw new Error("Use createPaymentIntent for one-time products");
  }

  // For subscriptions, we need to use Checkout Session
  // Payment Element doesn't support subscriptions directly
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: product.stripePriceId,
        quantity: 1,
      },
    ],
    success_url: `${
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    }/my-account?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    }/`,
    customer_email: userEmail,
    allow_promotion_codes: true,
    metadata: {
      productId: productId,
      userEmail: userEmail || "",
    },
  });

  return {
    sessionId: session.id,
    url: session.url!,
  };
}

// Legacy function for backward compatibility
export async function startCheckoutSession(
  productId: string,
  allowPromotionCodes = true
) {
  const product = PRODUCTS.find((p) => p.id === productId);
  if (!product) {
    throw new Error(`Product with id "${productId}" not found`);
  }

  const sessionConfig: any = {
    ui_mode: "embedded",
    redirect_on_completion: "never",
    allow_promotion_codes: allowPromotionCodes,
    payment_method_types: ["card", "link"],
    line_items: [
      {
        price: product.stripePriceId,
        quantity: 1,
      },
    ],
    mode: product.type === "subscription" ? "subscription" : "payment",
    billing_address_collection: "auto",
    metadata: {
      productId: productId,
    },
  };

  const session = await stripe.checkout.sessions.create(sessionConfig);

  if (!session.client_secret) {
    throw new Error(
      "Failed to create checkout session: no client secret returned"
    );
  }

  return session.client_secret;
}

export async function getCheckoutSession(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return {
      success: true,
      session: {
        id: session.id,
        status: session.status,
        payment_status: session.payment_status,
        customer_email: session.customer_details?.email,
        metadata: session.metadata,
      },
    };
  } catch (error: any) {
    console.error("Error retrieving session:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}
