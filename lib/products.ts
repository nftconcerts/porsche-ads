export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
}

export const PRODUCTS: Product[] = [
  {
    id: "jpg-export",
    name: "JPG Export",
    description: "Download your custom Porsche ad as a high-resolution JPG",
    priceInCents: 100, // $1.00
  },
  {
    id: "print-mail",
    name: "Print & Mail",
    description: "Professional print and delivery to your address",
    priceInCents: 5000, // $50.00
  },
]
