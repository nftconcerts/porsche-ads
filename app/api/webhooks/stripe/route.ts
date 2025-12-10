import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import Stripe from "stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle the checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      // Get customer details from Stripe
      const customerEmail = session.customer_details?.email;
      const customerName = session.customer_details?.name;
      const customerId = session.customer as string;
      const productId = session.metadata?.productId;

      if (!customerEmail) {
        throw new Error("No customer email found in session");
      }

      console.log("Processing payment for:", customerEmail);

      // Check if user already exists in Firebase
      let userRecord;
      try {
        userRecord = await adminAuth.getUserByEmail(customerEmail);
        console.log("Existing user found:", userRecord.uid);
      } catch (error: any) {
        if (error.code === "auth/user-not-found") {
          // Create new Firebase user
          userRecord = await adminAuth.createUser({
            email: customerEmail,
            displayName: customerName || undefined,
            emailVerified: true, // Auto-verify since they paid
          });
          console.log("New user created:", userRecord.uid);

          // Create user document in Firestore
          await adminDb
            .collection("users")
            .doc(userRecord.uid)
            .set({
              email: customerEmail,
              name: customerName || "",
              stripeCustomerId: customerId,
              createdAt: new Date().toISOString(),
              lastLogin: new Date().toISOString(),
              credits: 0, // Will be set based on product
              subscriptionActive: false,
            });
        } else {
          throw error;
        }
      }

      // Set custom claims and credits based on product purchased
      let role = "customer"; // Default role
      let creditsToAdd = 0;
      let isSubscription = false;

      if (productId === "image-3pack") {
        role = "pack_customer";
        creditsToAdd = 3;
      } else if (productId === "monthly-subscription") {
        role = "subscription_customer";
        isSubscription = true;
      }

      // Update user credits and subscription status in Firestore
      const userRef = adminDb.collection("users").doc(userRecord.uid);
      const userDoc = await userRef.get();
      const currentCredits = userDoc.data()?.credits || 0;

      await userRef.update({
        credits: currentCredits + creditsToAdd,
        subscriptionActive: isSubscription,
        ...(isSubscription && {
          subscriptionId: session.subscription as string,
          subscriptionStatus: "active",
        }),
      });

      // Set custom claims on the user
      await adminAuth.setCustomUserClaims(userRecord.uid, {
        role: role,
        stripeCustomerId: customerId,
        purchasedAt: Date.now(),
        subscriptionActive: isSubscription,
        hasCredits: creditsToAdd > 0 || isSubscription,
      });

      console.log(`Custom claims set for ${customerEmail}:`, {
        role,
        credits: currentCredits + creditsToAdd,
        isSubscription,
      });

      // Store purchase record in Firestore
      await adminDb
        .collection("users")
        .doc(userRecord.uid)
        .collection("purchases")
        .add({
          sessionId: session.id,
          productId: productId,
          amount: session.amount_total,
          currency: session.currency,
          status: session.payment_status,
          createdAt: new Date().toISOString(),
        });

      // Send password reset email so user can set their password
      const resetLink = await adminAuth.generatePasswordResetLink(
        customerEmail
      );

      // TODO: Send email with reset link (integrate with your email service)
      console.log("Password reset link:", resetLink);
      // You can use SendGrid, Resend, or another email service here

      return NextResponse.json({
        success: true,
        message: "User created and role assigned",
      });
    } catch (error: any) {
      console.error("Error processing webhook:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // Handle subscription updated event
  if (event.type === "customer.subscription.updated") {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;

    try {
      // Find user by Stripe customer ID
      const usersSnapshot = await adminDb
        .collection("users")
        .where("stripeCustomerId", "==", customerId)
        .limit(1)
        .get();

      if (!usersSnapshot.empty) {
        const userDoc = usersSnapshot.docs[0];
        await userDoc.ref.update({
          subscriptionStatus: subscription.status,
          subscriptionActive: subscription.status === "active",
        });
        console.log(
          `Subscription updated for customer ${customerId}: ${subscription.status}`
        );
      }
    } catch (error: any) {
      console.error("Error updating subscription:", error);
    }
  }

  // Handle subscription deleted/cancelled event
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;

    try {
      // Find user by Stripe customer ID
      const usersSnapshot = await adminDb
        .collection("users")
        .where("stripeCustomerId", "==", customerId)
        .limit(1)
        .get();

      if (!usersSnapshot.empty) {
        const userDoc = usersSnapshot.docs[0];
        const userRecord = await adminAuth.getUser(userDoc.id);

        // Update Firestore
        await userDoc.ref.update({
          subscriptionActive: false,
          subscriptionStatus: "cancelled",
          subscriptionCancelledAt: new Date().toISOString(),
        });

        // Update custom claims
        await adminAuth.setCustomUserClaims(userRecord.uid, {
          ...userRecord.customClaims,
          subscriptionActive: false,
        });

        console.log(`Subscription cancelled for customer ${customerId}`);
      }
    } catch (error: any) {
      console.error("Error cancelling subscription:", error);
    }
  }

  // Handle other event types if needed
  return NextResponse.json({ received: true });
}
