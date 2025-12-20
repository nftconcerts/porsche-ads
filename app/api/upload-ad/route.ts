import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";
import {
  uploadToCloudflareImages,
  getPublicUrlFromResponse,
} from "@/lib/cloudflare";

/**
 * Upload a generated p-ad image to Cloudflare and save to Firestore
 */
export async function POST(req: NextRequest) {
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
    const userEmail = decodedToken.email || "unknown";

    const body = await req.json();
    const { imageData, format, tagline } = body;

    if (!imageData) {
      return NextResponse.json(
        { error: "No image data provided" },
        { status: 400 }
      );
    }

    // Convert base64 to buffer
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // Check file size (Vercel has 5MB limit for serverless functions)
    const sizeInMB = buffer.length / (1024 * 1024);
    if (sizeInMB > 4.5) {
      // Use 4.5MB to be safe
      console.error(`Image too large: ${sizeInMB.toFixed(2)}MB`);
      return NextResponse.json(
        {
          error: `Image too large (${sizeInMB.toFixed(
            1
          )}MB). Please use a smaller image or lower quality settings.`,
        },
        { status: 413 }
      );
    }

    // Generate filename
    const filename = `p-ad-${tagline}-${Date.now()}.jpg`;

    // Upload to Cloudflare
    const cloudflareResponse = await uploadToCloudflareImages(
      buffer.buffer,
      filename
    );

    if (!cloudflareResponse.success) {
      console.error("Cloudflare upload failed:", cloudflareResponse.errors);
      return NextResponse.json(
        { error: "Failed to upload image" },
        { status: 500 }
      );
    }

    const publicUrl = getPublicUrlFromResponse(cloudflareResponse);

    if (!publicUrl) {
      console.error("No public URL found in response");
      return NextResponse.json(
        { error: "Failed to get image URL" },
        { status: 500 }
      );
    }

    // Save to Firestore
    const docRef = await adminDb.collection("p-ads").add({
      url: publicUrl,
      userId,
      userEmail,
      format,
      tagline: tagline || "",
      timestamp: Date.now(),
      archived: false,
    });

    console.log(
      "[upload-ad] Saved to Firestore with ID:",
      docRef.id,
      "for userId:",
      userId
    );

    return NextResponse.json({
      success: true,
      url: publicUrl,
    });
  } catch (error) {
    console.error("Error in image upload:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
