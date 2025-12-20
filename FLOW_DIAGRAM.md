# Payment Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     P-AD BUILDER FLOW                               │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│   1. USER    │  Uploads p-car photo, customizes ad
│   CREATES    │  Selects format, adjusts text
│     AD       │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   2. CLICKS  │  User clicks "Digital Download" ($9.99)
│   EXPORT     │  OR "Premium Print" ($39.99)
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────────────────┐
│   3. STRIPE CHECKOUT OPENS (Embedded Modal)          │
│   ─────────────────────────────────────────          │
│   • Collects email automatically                     │
│   • Collects payment info                            │
│   • Collects billing address                         │
│   • Shows product details                            │
│   • Metadata: { productId: "jpg-export" }           │
└──────┬────────────────────────────────────────────────┘
       │
       ▼
┌──────────────┐
│  4. PAYMENT  │  Stripe processes payment
│   SUCCEEDS   │  (Uses test cards in dev mode)
└──────┬───────┘
       │
       ▼
┌────────────────────────────────────────────────────────┐
│  5. WEBHOOK FIRES: /api/webhooks/stripe                │
│  ────────────────────────────────────────────          │
│  Event: checkout.session.completed                     │
│                                                         │
│  Webhook extracts:                                      │
│  • customer_email: "user@example.com"                  │
│  • customer_name: "John Doe"                           │
│  • customer_id: "cus_xxx" (Stripe)                     │
│  • product_id: "jpg-export" (from metadata)            │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  6. CHECK IF USER EXISTS                                 │
│  ────────────────────────────────────────               │
│  Query: adminAuth.getUserByEmail(email)                 │
│                                                          │
│  ┌─────────────┬──────────────────────────┐            │
│  │  NOT FOUND  │       FOUND              │            │
│  │      ↓      │          ↓               │            │
│  │  CREATE     │      UPDATE              │            │
│  │   USER      │    lastLogin             │            │
│  └─────────────┴──────────────────────────┘            │
└──────┬───────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  7. CREATE FIREBASE USER                                 │
│  ────────────────────────────────────────               │
│  adminAuth.createUser({                                 │
│    email: "user@example.com",                           │
│    displayName: "John Doe",                             │
│    emailVerified: true  ← Auto-verified (paid!)         │
│  })                                                      │
│                                                          │
│  Result: uid = "abc123xyz..."                           │
└──────┬───────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  8. SET CUSTOM CLAIMS                                    │
│  ────────────────────────────────────────               │
│  adminAuth.setCustomUserClaims(uid, {                   │
│    role: "digital_customer",  ← Based on product        │
│    stripeCustomerId: "cus_xxx",                         │
│    purchasedAt: 1234567890                              │
│  })                                                      │
└──────┬───────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  9. CREATE FIRESTORE DOCUMENTS                           │
│  ────────────────────────────────────────               │
│  users/{uid}:                                           │
│    • email, name, stripeCustomerId                      │
│    • createdAt, lastLogin                               │
│                                                          │
│  users/{uid}/purchases/{purchaseId}:                    │
│    • sessionId, productId, amount                       │
│    • currency, status, createdAt                        │
└──────┬───────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  10. GENERATE PASSWORD RESET LINK                        │
│  ────────────────────────────────────────               │
│  link = adminAuth.generatePasswordResetLink(email)      │
│                                                          │
│  Result: "https://your-app.com/__/auth/action?..."     │
└──────┬───────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  11. SEND EMAIL (TODO: Configure email service)          │
│  ────────────────────────────────────────               │
│  Currently: console.log(resetLink)                      │
│                                                          │
│  Options:                                                │
│  • Resend (recommended)                                  │
│  • SendGrid (like JimmyGPT)                             │
│  • Mailgun, AWS SES, etc.                               │
└──────┬───────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  12. USER RECEIVES EMAIL                                 │
│  ────────────────────────────────────────               │
│  Subject: "Welcome - Set Your Password"                 │
│  Content:                                                │
│    "Click here to set your password and                 │
│     access your p-ad: [LINK]"                     │
└──────┬───────────────────────────────────────────────────┘
       │
       ▼
┌──────────────┐
│  13. USER    │  Clicks link → Firebase password reset page
│   SETS       │  Creates password
│  PASSWORD    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  14. USER    │  Goes to /login
│   LOGS IN    │  Enters email + new password
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│  15. CLIENT PROVIDER LOADS                                │
│  ────────────────────────────────────────               │
│  onAuthStateChanged() fires                             │
│  • Sets user state                                       │
│  • Gets custom claims via getIdTokenResult()            │
│  • Updates lastLogin in Firestore                       │
└──────┬────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────┐
│  16. USER    │  Can now:
│  LOGGED IN   │  • View account page
│              │  • See purchase history
│              │  • Download ad (if implemented)
└──────────────┘


════════════════════════════════════════════════════════════
                    KEY COMPONENTS
════════════════════════════════════════════════════════════

Frontend (Client):
├── components/p-ad-builder.tsx  → Main UI
├── components/checkout-modal.tsx      → Stripe checkout
├── components/ClientProvider.tsx      → Auth state
├── components/auth-modal.tsx          → Login UI
└── hooks/use-auth.ts                  → Auth hooks

Backend (Server):
├── app/actions/stripe.ts              → Create checkout
├── app/api/webhooks/stripe/route.ts   → Handle payments
├── lib/firebase-admin.ts              → Firebase admin
└── lib/stripe.ts                      → Stripe config

Firebase:
├── Authentication                     → User accounts
├── Firestore                          → User data + purchases
└── Custom Claims                      → Role-based access

Stripe:
├── Checkout Sessions                  → Payment UI
├── Webhooks                           → Event notifications
└── Customers                          → Customer records

════════════════════════════════════════════════════════════
                  SECURITY FEATURES
════════════════════════════════════════════════════════════

✅ Webhook signature verification (prevents fake events)
✅ Email auto-verified for paying customers
✅ Custom claims = server-controlled roles
✅ Firestore security rules (users can only read own data)
✅ Firebase Admin SDK runs server-side only
✅ No sensitive keys exposed to client

════════════════════════════════════════════════════════════
                    DIFFERENCES FROM JIMMYGPT
════════════════════════════════════════════════════════════

JimmyGPT:
1. User signs up manually
2. User logs in
3. User subscribes
4. Stripe extension sets role in Firestore
5. Cloud function reads Firestore → sets custom claims

P-Ads (This Project):
1. User purchases (no account yet)
2. Webhook creates account automatically
3. Webhook sets custom claims directly
4. User sets password via email
5. User logs in

Simpler! ✅ Fewer moving parts!
```
