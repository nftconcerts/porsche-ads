export interface Product {
  id: string;
  name: string;
  description: string;
  priceInCents: number;
  stripePriceId: string; // Stripe Price ID
  type: "one_time" | "subscription";
  recurring?: {
    interval: "month" | "year";
  };
}

export const PRODUCTS: Product[] = [
  {
    id: "single-download",
    name: "Single Download",
    description: "Download 1 custom Porsche ad as high-resolution image",
    priceInCents: 1000, // $10.00
    stripePriceId: "price_1SgH90IN1N57cIQQhvVkDIvX",
    type: "one_time",
  },
  {
    id: "monthly-subscription",
    name: "Monthly Unlimited",
    description: "Unlimited image exports and saves - billed monthly",
    priceInCents: 911, // $9.11
    stripePriceId: "price_1SgH9dIN1N57cIQQvwy9TlG2",
    type: "subscription",
    recurring: {
      interval: "month",
    },
  },
];
