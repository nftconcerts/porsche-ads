# Porsche Ad Builder

Create your own classic Porsche advertisement with custom images and taglines. Built with Next.js, Stripe, and Firebase.

## Features

- 🎨 **Custom Ad Builder** - Upload your Porsche image and customize text
- 📱 **Multiple Formats** - Mobile Story (9:16), Square Post (1:1), Classic Poster (3:2)
- 💳 **Stripe Payments** - Secure checkout for digital downloads and prints
- 🔐 **Firebase Auth** - Automatic account creation after purchase
- 📧 **Email Integration** - Password reset and welcome emails
- 🎯 **Role-based Access** - Custom claims for different customer types

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your credentials:

```bash
cp .env.local.example .env.local
```

See `SETUP.md` for detailed instructions on getting Firebase and Stripe credentials.

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### 4. Test Stripe Webhooks Locally

In a separate terminal:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Documentation

- **[SETUP.md](./SETUP.md)** - Complete setup guide for Firebase & Stripe
- **[INTEGRATION_SUMMARY.md](./INTEGRATION_SUMMARY.md)** - Integration details and next steps

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS
- **Payments:** Stripe Checkout (embedded)
- **Auth:** Firebase Authentication
- **Database:** Cloud Firestore
- **Image Export:** html-to-image
- **UI Components:** Radix UI + shadcn/ui

## Project Structure

```
├── app/
│   ├── actions/         # Server actions (Stripe)
│   ├── api/             # API routes (webhooks)
│   ├── login/           # Login page
│   └── page.tsx         # Main ad builder page
├── components/
│   ├── ui/              # Reusable UI components
│   ├── porsche-ad-builder.tsx
│   ├── checkout-modal.tsx
│   ├── auth-modal.tsx
│   └── ClientProvider.tsx
├── hooks/
│   ├── use-auth.ts      # Authentication hooks
│   └── use-toast.ts
├── lib/
│   ├── firebase.ts      # Client Firebase config
│   ├── firebase-admin.ts # Server Firebase config
│   ├── stripe.ts        # Stripe config
│   └── products.ts      # Product definitions
└── public/
    └── images/          # Porsche ad frames
```

## Payment Flow

1. User creates their custom Porsche ad
2. Clicks "Digital Download" or "Premium Print & Ship"
3. Stripe checkout modal opens (collects email + payment)
4. On successful payment:
   - Webhook creates Firebase user account
   - Sets custom claims (role, customerId, etc.)
   - Sends password reset email
5. User can log in and access their purchase

## Custom Claims

After purchase, users get these custom claims:

```typescript
{
  role: "digital_customer" | "print_customer",
  stripeCustomerId: "cus_xxx",
  purchasedAt: 1234567890
}
```

Access them in your code:

```typescript
import { useAuth } from "@/hooks/use-auth";

const { user, userRole } = useAuth();
console.log(userRole?.role); // "digital_customer"
```

## Development Tips

### Test Payments Without Stripe

Hold **Shift** while clicking export buttons to bypass payment (dev mode).

### Stripe Test Cards

- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Use any future expiry date and any CVC

### Firebase Emulator (Optional)

```bash
firebase emulators:start
```

## Deploy on Vercel

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Set up Stripe webhook for production URL
5. Deploy!

## License

Copyright 2024 p-ads.com. All Rights Reserved.

---

Built with ❤️ using [v0.dev](https://v0.dev)
