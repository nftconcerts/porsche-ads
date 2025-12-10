"use server";

import { adminAuth } from "@/lib/firebase-admin";
import { checkAndDecrementCredits } from "@/lib/user-credits";

export async function verifyExportAccess(userId: string): Promise<{
  allowed: boolean;
  credits?: number;
  reason?: string;
}> {
  try {
    // Verify user exists
    const userRecord = await adminAuth.getUser(userId);
    if (!userRecord) {
      return { allowed: false, reason: "User not found" };
    }

    // Check and decrement credits
    const result = await checkAndDecrementCredits(userId);
    return result;
  } catch (error: any) {
    console.error("Error verifying export access:", error);
    return { allowed: false, reason: error.message };
  }
}
