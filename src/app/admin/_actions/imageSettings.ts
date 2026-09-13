"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { saveImageDelivery } from "@/lib/db/imageDelivery";
import { normalizeImageDeliveryConfig } from "@/lib/imageDelivery";

export async function saveImageDeliveryAction(formData: FormData): Promise<void> {
  const config = normalizeImageDeliveryConfig({
    quality: String(formData.get("quality") || ""),
    autoFormat: formData.get("autoFormat") === "on",
    maxWidth: Number(formData.get("maxWidth")),
    dprAuto: formData.get("dprAuto") === "on",
  });

  try {
    await saveImageDelivery(config);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    redirect(`/admin/images?error=${encodeURIComponent(message)}`);
  }

  // Every rendered srcSet embeds these values, so the whole tree needs rebuilding.
  revalidatePath("/", "layout");
  redirect("/admin/images?saved=1");
}
