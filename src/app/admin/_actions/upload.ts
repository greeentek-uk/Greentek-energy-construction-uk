"use server";

import { signUploadParams } from "@/lib/cloudinary";

export interface UploadSignature {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
}

/**
 * Returns a signed payload the browser uses to upload directly to
 * Cloudinary, bypassing our own server (and Vercel's function body-size
 * limit) for the actual file bytes. Only reachable from /admin routes,
 * which src/proxy.ts already gates behind the admin session cookie.
 */
export async function getCloudinaryUploadSignatureAction(): Promise<UploadSignature> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const folder = process.env.CLOUDINARY_UPLOAD_FOLDER || "greentek";

  if (!cloudName || !apiKey) {
    throw new Error("Cloudinary is not configured (CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY).");
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = signUploadParams({ timestamp, folder });

  return { signature, timestamp, apiKey, cloudName, folder };
}
