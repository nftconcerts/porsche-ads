import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";

/**
 * Get user's created ads from Firestore
 */
export async function GET(req: NextRequest) {
  try {
    // Get auth token from header
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let decodedToken;

    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (error) {
      console.error("Token verification failed:", error);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = decodedToken.uid;

    console.log("[user-ads] Fetching ads for userId:", userId);

    // Fetch user's ads from Firestore (simplified query without orderBy first)
    let adsSnapshot;
    try {
      adsSnapshot = await adminDb
        .collection("porsche-ads")
        .where("userId", "==", userId)
        .orderBy("timestamp", "desc")
        .get();
    } catch (indexError) {
      console.warn(
        "[user-ads] Composite index error, trying without orderBy:",
        indexError
      );
      // If composite index doesn't exist, fetch without ordering
      adsSnapshot = await adminDb
        .collection("porsche-ads")
        .where("userId", "==", userId)
        .get();
    }

    console.log("[user-ads] Found", adsSnapshot.size, "ads");

    const ads = adsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log("[user-ads] Returning ads:", ads.length);
    return NextResponse.json({ ads });
  } catch (error) {
    console.error("Error fetching user ads:", error);
    return NextResponse.json({ error: "Failed to fetch ads" }, { status: 500 });
  }
}
