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

export interface MediaAsset {
  publicId: string;
  url: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  createdAt: string;
}

/**
 * Lists what's actually in the Cloudinary folder.
 *
 * The panel had no way to see existing uploads, so the same image was being
 * re-uploaded per field and nothing could ever be cleaned up.
 */
export async function listMedia(max = 200): Promise<MediaAsset[]> {
  const folder = process.env.CLOUDINARY_UPLOAD_FOLDER || "greentek";
  const result = await cloudinary.api.resources({
    type: "upload",
    prefix: folder,
    max_results: Math.min(max, 500),
  });

  return (result.resources as Record<string, unknown>[]).map((r) => ({
    publicId: String(r.public_id),
    url: String(r.secure_url),
    format: String(r.format ?? ""),
    width: Number(r.width ?? 0),
    height: Number(r.height ?? 0),
    bytes: Number(r.bytes ?? 0),
    createdAt: String(r.created_at ?? ""),
  }));
}

export async function deleteMedia(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

/**
 * Deletes every image in a folder, then the folder itself. Used to remove the
 * photos of enquiry forms that were never sent.
 */
export async function deleteFolder(folder: string): Promise<void> {
  await cloudinary.api.delete_resources_by_prefix(`${folder}/`, { invalidate: true });
  try {
    await cloudinary.api.delete_folder(folder);
  } catch {
    // Cloudinary can briefly report a just-emptied folder as non-empty; the
    // empty folder left behind takes no storage.
  }
}
