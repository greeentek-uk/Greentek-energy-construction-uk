"use server";

import { redirect } from "next/navigation";
import { revalidate } from "@/lib/revalidate";
import { saveSitemapConfig } from "@/lib/db/sitemapSettings";
import {
  normalizeSitemapConfig,
  type SitemapConfig,
  type SitemapSectionConfig,
} from "@/lib/sitemapConfig";

type SectionKey = keyof SitemapConfig["sections"];

const SECTION_KEYS: SectionKey[] = [
  "services",
  "projects",
  "locations",
  "locationServices",
  "blog",
];

export async function saveSitemapConfigAction(formData: FormData): Promise<void> {
  const section = (key: SectionKey): SitemapSectionConfig => ({
    enabled: formData.get(`${key}_enabled`) === "on",
    priority: Number(formData.get(`${key}_priority`) || 0.7),
    changeFrequency: String(formData.get(`${key}_changeFrequency`) || "monthly"),
  });

  const config = normalizeSitemapConfig({
    includeStaticPages: formData.get("includeStaticPages") === "on",
    staticPriority: Number(formData.get("staticPriority") || 0.8),
    sections: Object.fromEntries(
      SECTION_KEYS.map((key) => [key, section(key)]),
    ) as SitemapConfig["sections"],
    excludedPaths: String(formData.get("excludedPaths") || "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
  });

  try {
    await saveSitemapConfig(config);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    redirect(`/admin/sitemap?error=${encodeURIComponent(message)}`);
  }

  await revalidate("/sitemap.xml");
  redirect("/admin/sitemap?saved=1");
}
