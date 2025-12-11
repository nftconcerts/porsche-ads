/**
 * Cloudflare Images API client
 */

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

export interface CloudflareUploadResponse {
  success: boolean;
  result?: {
    id: string;
    filename: string;
    uploaded: string;
    requireSignedURLs: boolean;
    variants: string[];
  };
  errors?: Array<{ code: number; message: string }>;
}

export async function uploadToCloudflareImages(
  buffer: ArrayBuffer,
  filename: string
): Promise<CloudflareUploadResponse> {
  if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
    throw new Error("Cloudflare credentials not configured");
  }

  const formData = new FormData();
  formData.append("file", new Blob([buffer]), filename);

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/images/v1`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
      },
      body: formData,
    }
  );

  return await response.json();
}

export function getPublicUrlFromResponse(
  response: CloudflareUploadResponse
): string | null {
  if (!response.success || !response.result?.variants) {
    return null;
  }

  // Find the "public" variant URL
  const publicUrl = response.result.variants.find((url) =>
    url.includes("/public")
  );

  return publicUrl || response.result.variants[0] || null;
}
