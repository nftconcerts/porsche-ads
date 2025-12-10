# API Reference

## Stripe Webhook

### `POST /api/webhooks/stripe`

Handles Stripe webhook events for payment processing and user creation.

#### Events Handled

- `checkout.session.completed` - Creates Firebase user, sets custom claims, stores purchase

#### Security

- Verifies webhook signature using `STRIPE_WEBHOOK_SECRET`
- Only processes events from Stripe

#### Flow

1. Verifies webhook signature
2. Extracts customer email from session
3. Checks if Firebase user exists
   - If exists: Updates user data
   - If not: Creates new user with auto-verified email
4. Sets custom claims based on product:
   - `jpg-export` → `digital_customer`
   - `print-mail` → `print_customer`
5. Stores purchase record in Firestore
6. Generates password reset link
7. Sends email (TODO: integrate email service)

#### Response

**Success (200)**

```json
{
  "success": true,
  "message": "User created and role assigned"
}
```

**Error (400)**

```json
{
  "error": "Webhook signature verification failed"
}
```

**Error (500)**

```json
{
  "error": "Error message"
}
```

## Server Actions

### `startCheckoutSession(productId: string)`

Creates a Stripe checkout session for a product.

**Location:** `app/actions/stripe.ts`

**Parameters:**

- `productId` - Product ID from `PRODUCTS` array

**Returns:**

- `string` - Stripe client secret for embedded checkout

**Example:**

```typescript
const clientSecret = await startCheckoutSession("jpg-export");
```

## Firebase Collections

### `users/{userId}`

User profile document.

**Fields:**

- `email: string` - User email
- `name: string` - Display name
- `stripeCustomerId: string` - Stripe customer ID
- `createdAt: string` - ISO timestamp
- `lastLogin: string` - ISO timestamp

### `users/{userId}/purchases/{purchaseId}`

Purchase records subcollection.

**Fields:**

- `sessionId: string` - Stripe session ID
- `productId: string` - Product purchased
- `amount: number` - Amount in cents
- `currency: string` - Currency code (usd)
- `status: string` - Payment status
- `createdAt: string` - ISO timestamp

## Custom Claims

Set on Firebase user tokens, accessible via `getIdTokenResult()`.

**Structure:**

```typescript
{
  role: "digital_customer" | "print_customer",
  stripeCustomerId: string,
  purchasedAt: number // Unix timestamp
}
```

**Access Example:**

```typescript
const idTokenResult = await auth.currentUser?.getIdTokenResult();
const role = idTokenResult?.claims.role;
```

## Client Hooks

### `useAuth()`

Returns current auth state and user role.

**Returns:**

```typescript
{
  user: User | null,
  userRole: {
    role?: string,
    stripeCustomerId?: string,
    purchasedAt?: number
  } | null,
  loading: boolean
}
```

### `useRequireAuth(redirectUrl?: string)`

Redirects to login if not authenticated.

**Parameters:**

- `redirectUrl` - Where to redirect (default: "/")

### `useCustomerRole()`

Returns customer type helpers.

**Returns:**

```typescript
{
  isDigitalCustomer: boolean,
  isPrintCustomer: boolean,
  isAnyCustomer: boolean,
  role: string | undefined,
  loading: boolean
}
```

## Environment Variables Reference

| Variable                                   | Required | Description                          |
| ------------------------------------------ | -------- | ------------------------------------ |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`       | Yes      | Stripe public API key                |
| `STRIPE_SECRET_KEY`                        | Yes      | Stripe secret API key                |
| `STRIPE_WEBHOOK_SECRET`                    | Yes      | Stripe webhook signing secret        |
| `NEXT_PUBLIC_FIREBASE_API_KEY`             | Yes      | Firebase web API key                 |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`         | Yes      | Firebase auth domain                 |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`          | Yes      | Firebase project ID                  |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`      | Yes      | Firebase storage bucket              |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Yes      | Firebase messaging sender ID         |
| `NEXT_PUBLIC_FIREBASE_APP_ID`              | Yes      | Firebase app ID                      |
| `FIREBASE_ADMIN_PROJECT_ID`                | Yes      | Firebase admin project ID            |
| `FIREBASE_ADMIN_CLIENT_EMAIL`              | Yes      | Firebase service account email       |
| `FIREBASE_ADMIN_PRIVATE_KEY`               | Yes      | Firebase service account private key |
