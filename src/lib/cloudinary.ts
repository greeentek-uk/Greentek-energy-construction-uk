import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/** Signs an upload request server-side so the API secret never reaches the browser; the client uploads directly to Cloudinary using the returned signature. */
export function signUploadParams(
  paramsToSign: Record<string, string | number>,
): string {
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!apiSecret) {
    throw new Error("CLOUDINARY_API_SECRET is not set.");
  }
  return cloudinary.utils.api_sign_request(paramsToSign, apiSecret);
}
