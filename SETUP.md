# Porsche Ad Builder - Environment Variables Setup

## Required Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

### Stripe Configuration

```bash
# Get these from https://dashboard.stripe.com/apikeys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Get this from https://dashboard.stripe.com/webhooks
# After creating a webhook endpoint pointing to: https://yourdomain.com/api/webhooks/stripe
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Firebase Client Configuration

```bash
# Get these from Firebase Console > Project Settings > General > Your apps > Web app
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### Firebase Admin Configuration

```bash
# Get these from Firebase Console > Project Settings > Service Accounts > Generate New Private Key
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourPrivateKeyHere\n-----END PRIVATE KEY-----\n"
```

## Setup Instructions

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable Email/Password provider
4. Enable Firestore Database:
   - Go to Firestore Database
   - Create database in production mode
5. Get your config:
   - Project Settings > General > Your apps
   - Add a web app if you haven't already
   - Copy the config values to your `.env.local`
6. Get service account key:
   - Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Copy the values to your `.env.local`

### 2. Stripe Setup

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Get API keys from Developers > API keys
3. Create webhook:
   - Go to Developers > Webhooks
   - Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Select events to listen to: `checkout.session.completed`
   - Copy the webhook signing secret

### 3. Testing Locally

For local development, use Stripe CLI to forward webhooks:

```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

This will give you a webhook secret starting with `whsec_` - use this in your `.env.local` for local testing.

## Firestore Security Rules

Add these rules to your Firestore to secure user data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read their own user document
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if false; // Only admin/server can write

      // Users can read their own purchases
      match /purchases/{purchaseId} {
        allow read: if request.auth != null && request.auth.uid == userId;
        allow write: if false; // Only admin/server can write
      }
    }
  }
}
```

## Custom Claims

After successful payment, the webhook automatically sets custom claims on the Firebase user:

- `role`: Either "digital_customer" or "print_customer"
- `stripeCustomerId`: The Stripe customer ID
- `purchasedAt`: Timestamp of purchase

Access these in your code:

```typescript
const idTokenResult = await auth.currentUser?.getIdTokenResult();
const role = idTokenResult?.claims.role;
```
