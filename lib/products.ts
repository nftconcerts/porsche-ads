export interface Product {
  id: string;
  name: string;
  description: string;
  priceInCents: number;
  type: "one_time" | "subscription";
  recurring?: {
    interval: "month" | "year";
  };
}

export const PRODUCTS: Product[] = [
  {
    id: "image-3pack",
    name: "3-Pack Image Export",
    description: "Download 3 custom Porsche ads as high-resolution images",
    priceInCents: 550, // $5.50
    type: "one_time",
  },
  {
    id: "monthly-subscription",
    name: "Monthly Unlimited",
    description: "Unlimited image exports and saves - billed monthly",
    priceInCents: 911, // $9.11
    type: "subscription",
    recurring: {
      interval: "month",
    },
  },
];
