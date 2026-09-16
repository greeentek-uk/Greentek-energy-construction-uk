"use server";

import { redirect } from "next/navigation";
import { revalidate } from "@/lib/revalidate";
import { upsertLocationServiceContent } from "@/lib/db/locationServiceContent";
import type { LocationServiceContent } from "@/data/site";
import { parseFaqs } from "./faqs";

function splitLines(value: string): string[] {
  return value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function saveLocationServiceContentAction(formData: FormData): Promise<void> {
  const locationSlug = String(formData.get("locationSlug") || "").trim();
  const serviceSlug = String(formData.get("serviceSlug") || "").trim();
  const intro = String(formData.get("intro") || "").trim();

  if (!locationSlug || !serviceSlug || !intro) {
    redirect(
      `/admin/locations/${locationSlug}/service-content?error=${encodeURIComponent(
        "Intro is required",
      )}`,
    );
  }

  const metaTitle = String(formData.get("metaTitle") || "").trim();
  const metaDescription = String(formData.get("metaDescription") || "").trim();
  const localNote = String(formData.get("localNote") || "").trim();
  const highlights = splitLines(String(formData.get("highlights") || ""));

  const entry: LocationServiceContent = {
    locationSlug,
    serviceSlug,
    intro,
    ...(metaTitle ? { metaTitle } : {}),
    ...(metaDescription ? { metaDescription } : {}),
    ...(localNote ? { localNote } : {}),
    ...(highlights.length ? { highlights } : {}),
    ...(parseFaqs(formData).length ? { faqs: parseFaqs(formData) } : {}),
  };

  try {
    await upsertLocationServiceContent(entry);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    redirect(
      `/admin/locations/${locationSlug}/service-content?error=${encodeURIComponent(message)}`,
    );
  }

  await revalidate(`/locations/${locationSlug}/${serviceSlug}`);
  await revalidate("/sitemap.xml");
  redirect(`/admin/locations/${locationSlug}/service-content?saved=1`);
}
