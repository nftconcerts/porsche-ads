# 🚀 Firebase + Stripe Integration Complete!

## ✅ What's Been Done

### 1. Dependencies Installed

- ✅ `firebase` - Client-side Firebase SDK
- ✅ `firebase-admin` - Server-side Firebase Admin SDK

### 2. Core Files Created

- ✅ `lib/firebase.ts` - Client Firebase config
- ✅ `lib/firebase-admin.ts` - Server Firebase Admin config
- ✅ `app/api/webhooks/stripe/route.ts` - Webhook handler for payment → user creation
- ✅ `components/ClientProvider.tsx` - Auth state management
- ✅ `components/auth-modal.tsx` - Login/account UI
- ✅ `hooks/use-auth.ts` - Auth hooks (`useAuth`, `useRequireAuth`, `useCustomerRole`)
- ✅ `app/login/page.tsx` - Login page

### 3. Modified Files

- ✅ `app/actions/stripe.ts` - Added metadata & email collection for checkout
- ✅ `app/layout.tsx` - Wrapped with ClientProvider for global auth state
- ✅ `components/footer.tsx` - Added sign-in/account link

### 4. Documentation Created

- ✅ `SETUP.md` - Complete Firebase & Stripe setup guide
- ✅ `INTEGRATION_SUMMARY.md` - Integration overview & next steps
- ✅ `API.md` - API reference for webhooks, hooks, and endpoints
- ✅ `README.md` - Updated with new features
- ✅ `.env.local.example` - Environment variable template

## 🎯 Payment-First Flow (As Requested!)

```
1. User customizes Porsche ad
         ↓
2. Clicks "Digital Download" or "Print & Ship"
         ↓
3. Stripe checkout opens (collects email + payment)
         ↓
4. Payment succeeds → Webhook fires
         ↓
5. Webhook creates Firebase user automatically
         ↓
6. Custom claims set (role: "digital_customer" or "print_customer")
         ↓
7. Password reset email sent
         ↓
8. User sets password & logs in
```

## 📋 Next Steps To Go Live

### Required Setup (Do First!)

1. **Create Firebase Project**

   - Go to https://console.firebase.google.com/
   - Create new project
   - Enable Authentication (Email/Password)
   - Enable Firestore Database
   - Get config from Project Settings
   - Generate service account key
   - Copy all values to `.env.local`

2. **Configure Stripe Webhook**

   - Go to https://dashboard.stripe.com/webhooks
   - Add endpoint: `https://your-domain.com/api/webhooks/stripe`
   - Select event: `checkout.session.completed`
   - Copy webhook secret to `.env.local`

3. **Test Locally**

   ```bash
   # Terminal 1: Start dev server
   npm run dev

   # Terminal 2: Forward Stripe webhooks
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

4. **Add Email Service** (Choose One)

   **Option A: Resend (Recommended)**

   ```bash
   npm install resend
   ```

   Update `app/api/webhooks/stripe/route.ts` line 90

   **Option B: SendGrid (Like JimmyGPT)**

   ```bash
   npm install @sendgrid/mail
   ```

   **Option C: Mailgun**

   ```bash
   npm install mailgun.js
   ```

5. **Set Firestore Security Rules**
   Copy rules from `SETUP.md` to Firebase Console

### Optional Enhancements

- [ ] Add user dashboard showing purchase history
- [ ] Allow re-downloading purchased ads
- [ ] Add social login (Google/Apple)
- [ ] Professional email templates
- [ ] Admin panel to manage users/orders
- [ ] Analytics tracking for conversions

## 🧪 Testing Guide

### Test the Complete Flow

1. **Create an ad**

   - Upload a Porsche image
   - Customize text and format

2. **Test Checkout (Dev Mode)**

   - Hold **Shift** + Click "Digital Download"
   - This bypasses payment for testing

3. **Test Real Payment (Stripe Test Mode)**

   - Click "Digital Download" normally
   - Use test card: `4242 4242 4242 4242`
   - Use any future expiry, any CVC
   - Check Firebase Console to see user created
   - Check Firestore for purchase record

4. **Test Login**
   - Go to `/login`
   - Check inbox for password reset email
   - Set password and log in
   - Verify user role appears in account page

### Verify Custom Claims

```typescript
// In browser console after login
const user = auth.currentUser;
const token = await user.getIdTokenResult();
console.log(token.claims);
// Should show: { role: "digital_customer", ... }
```

## 🔑 Key Differences from JimmyGPT

| Feature          | JimmyGPT                              | Porsche Ads                         |
| ---------------- | ------------------------------------- | ----------------------------------- |
| Account Creation | Manual sign-up                        | **Automatic after payment**         |
| Payment Flow     | After login                           | **Before account exists**           |
| Role Assignment  | Stripe extension + Firestore          | **Direct custom claims in webhook** |
| Checkout         | Separate checkout sessions collection | **Embedded checkout (simpler)**     |
| Email            | SendGrid                              | **TODO: Your choice**               |

## 📊 Firestore Structure

```
users/
  {userId}/
    - email: string
    - name: string
    - stripeCustomerId: string
    - createdAt: timestamp
    - lastLogin: timestamp

    purchases/
      {purchaseId}/
        - sessionId: string
        - productId: string
        - amount: number
        - currency: string
        - status: string
        - createdAt: timestamp
```

## 🎨 Usage Examples

### Check if user has purchased

```typescript
import { useCustomerRole } from "@/hooks/use-auth";

function MyComponent() {
  const { isDigitalCustomer, isPrintCustomer, loading } = useCustomerRole();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {isDigitalCustomer && <p>You can download your ad!</p>}
      {isPrintCustomer && <p>Your print is being shipped!</p>}
    </div>
  );
}
```

### Protect a page (require auth)

```typescript
import { useRequireAuth } from "@/hooks/use-auth";

function ProtectedPage() {
  const { user, loading } = useRequireAuth("/login");

  if (loading) return <div>Loading...</div>;

  return <div>Welcome {user?.email}!</div>;
}
```

### Get user info

```typescript
import { useAuth } from "@/hooks/use-auth";

function Header() {
  const { user, userRole } = useAuth();

  return (
    <header>
      {user ? (
        <div>
          <p>{user.email}</p>
          <p>Role: {userRole?.role}</p>
        </div>
      ) : (
        <a href="/login">Sign In</a>
      )}
    </header>
  );
}
```

## 🐛 Troubleshooting

### Webhook not firing

- Check Stripe webhook endpoint is correct
- Verify webhook secret in `.env.local`
- Use Stripe CLI for local testing
- Check webhook logs in Stripe Dashboard

### User not created

- Check Firebase Admin credentials
- Verify service account has proper permissions
- Check server logs for errors
- Ensure Firestore is enabled

### Email not sending

- Email service not configured yet (line 90 in webhook)
- Add Resend, SendGrid, or another service
- Check API keys and sender verification

### Custom claims not showing

- User needs to refresh their token: `await user.getIdToken(true)`
- Or sign out and back in
- Check Firebase Console → Authentication → Users → Custom Claims

## 📞 Need Help?

All the code patterns are based on your JimmyGPT implementation, so you're already familiar with the concepts! The main difference is the payment-first flow you requested.

Ready to launch! 🚀
