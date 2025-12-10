"use server";

import { adminDb } from "@/lib/firebase-admin";

export async function checkAndDecrementCredits(userId: string): Promise<{
  allowed: boolean;
  credits?: number;
  reason?: string;
}> {
  const userRef = adminDb.collection("users").doc(userId);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    return { allowed: false, reason: "User not found" };
  }

  const userData = userDoc.data();
  const subscriptionActive = userData?.subscriptionActive || false;
  const credits = userData?.credits || 0;

  // If subscription is active, allow unlimited exports
  if (subscriptionActive) {
    return { allowed: true, credits: -1 }; // -1 indicates unlimited
  }

  // If user has credits, decrement one
  if (credits > 0) {
    await userRef.update({
      credits: credits - 1,
    });
    return { allowed: true, credits: credits - 1 };
  }

  // No credits and no subscription
  return { allowed: false, credits: 0, reason: "No credits remaining" };
}

export async function getUserCredits(userId: string): Promise<{
  credits: number;
  subscriptionActive: boolean;
}> {
  const userRef = adminDb.collection("users").doc(userId);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    return { credits: 0, subscriptionActive: false };
  }

  const userData = userDoc.data();
  return {
    credits: userData?.credits || 0,
    subscriptionActive: userData?.subscriptionActive || false,
  };
}
