"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { upsertSeoOverride, deleteSeoOverride } from "@/lib/db/seoOverrides";

export async function saveSeoOverrideAction(formData: FormData): Promise<void> {
  const path = String(formData.get("path") || "");
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();

  if (!path) {
    redirect("/admin/seo");
  }

  try {
    if (!title && !description) {
      await deleteSeoOverride(path);
    } else {
      await upsertSeoOverride(path, {
        ...(title ? { title } : {}),
        ...(description ? { description } : {}),
      });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    redirect(
      `/admin/seo/edit?path=${encodeURIComponent(path)}&error=${encodeURIComponent(message)}`,
    );
  }

  revalidatePath(path);
  redirect(`/admin/seo/edit?path=${encodeURIComponent(path)}&saved=1`);
}
