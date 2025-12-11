"use server";

import { stripe } from "@/lib/stripe";
import { PRODUCTS } from "@/lib/products";

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
    payment_method_types: ["card", "link", "apple_pay", "google_pay"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            description: product.description,
          },
          unit_amount: product.priceInCents,
          ...(product.type === "subscription" && product.recurring
            ? {
                recurring: {
                  interval: product.recurring.interval,
                },
              }
            : {}),
        },
        quantity: 1,
      },
    ],
    mode: product.type === "subscription" ? "subscription" : "payment",
    // Collect customer email (required for account creation)
    customer_email: undefined, // Let Stripe collect it
    billing_address_collection: "auto",
    // Store product ID in metadata for the webhook
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
