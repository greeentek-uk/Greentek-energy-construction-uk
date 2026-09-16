"use server";

import { redirect } from "next/navigation";
import { revalidate } from "@/lib/revalidate";
import { deleteMedia } from "@/lib/cloudinary";

export async function deleteMediaAction(formData: FormData): Promise<void> {
  const publicId = String(formData.get("publicId") || "");
  const inUse = String(formData.get("inUse") || "") === "1";

  if (!publicId) redirect("/admin/media");

  // Deleting a file that a page still points at leaves a broken image on the
  // live site, so it's blocked rather than merely warned about.
  if (inUse) {
    redirect(
      `/admin/media?error=${encodeURIComponent(
        "That image is still used on a page. Remove it there first.",
      )}`,
    );
  }

  try {
    await deleteMedia(publicId);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    redirect(`/admin/media?error=${encodeURIComponent(message)}`);
  }

  await revalidate("/admin/media");
  redirect("/admin/media?deleted=1");
}
