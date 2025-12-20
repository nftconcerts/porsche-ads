"use server";

import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function initializeNewUser(userId: string, email: string) {
  try {
    const userRef = adminDb.collection("users").doc(userId);
    const userDoc = await userRef.get();

    // Only initialize if user doesn't exist or doesn't have credits set
    if (!userDoc.exists) {
      await userRef.set({
        email: email,
        credits: 1, // Give 1 free credit
        subscriptionActive: false,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      });

      // Set custom claims
      await adminAuth.setCustomUserClaims(userId, {
        role: "free_user",
        hasCredits: true,
      });

      console.log(`New user ${email} initialized with 1 free credit`);
      return { success: true, credits: 1 };
    }

    // User exists, just return their current credits
    const data = userDoc.data();
    return {
      success: true,
      credits: data?.credits || 0,
      subscriptionActive: data?.subscriptionActive || false,
    };
  } catch (error: any) {
    console.error("Error initializing user:", error);
    return { success: false, error: error.message };
  }
}
