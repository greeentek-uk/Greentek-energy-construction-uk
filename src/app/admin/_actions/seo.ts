"use server";

import { redirect } from "next/navigation";
import { revalidate } from "@/lib/revalidate";
import { upsertSeoOverride, deleteSeoOverride } from "@/lib/db/seoOverrides";
import { saveSeoTemplates } from "@/lib/db/seoSettings";
import { saveBreadcrumbSettings } from "@/lib/db/breadcrumbs";
import type { SeoOverride } from "@/lib/seoTypes";
import type { SeoTemplates } from "@/lib/seoTemplates";

function str(formData: FormData, key: string): string {
  return String(formData.get(key) || "").trim();
}

function bool(formData: FormData, key: string): boolean {
  return formData.get(key) === "on";
}

/** Keeps only the fields the admin actually set, so blanks fall through to templates. */
function compact(override: SeoOverride): SeoOverride {
  const out: SeoOverride = {};
  for (const [key, value] of Object.entries(override)) {
    if (value === "" || value === false || value === undefined || value === null) continue;
    (out as Record<string, unknown>)[key] = value;
  }
  return out;
}

export async function saveSeoOverrideAction(formData: FormData): Promise<void> {
  const path = str(formData, "path");
  if (!path) redirect("/admin/seo");

  const priorityRaw = str(formData, "sitemapPriority");

  const override = compact({
    title: str(formData, "title"),
    description: str(formData, "description"),
    canonical: str(formData, "canonical"),

    noindex: bool(formData, "noindex"),
    nofollow: bool(formData, "nofollow"),
    noarchive: bool(formData, "noarchive"),
    nosnippet: bool(formData, "nosnippet"),
    noimageindex: bool(formData, "noimageindex"),
    maxSnippet: str(formData, "maxSnippet"),
    maxImagePreview: (str(formData, "maxImagePreview") ||
      undefined) as SeoOverride["maxImagePreview"],

    ogTitle: str(formData, "ogTitle"),
    ogDescription: str(formData, "ogDescription"),
    ogImage: str(formData, "ogImage"),
    ogType: str(formData, "ogType"),

    twitterCard: str(formData, "twitterCard"),
    twitterTitle: str(formData, "twitterTitle"),
    twitterDescription: str(formData, "twitterDescription"),
    twitterImage: str(formData, "twitterImage"),

    excludeFromSitemap: bool(formData, "excludeFromSitemap"),
    ...(priorityRaw ? { sitemapPriority: Number(priorityRaw) } : {}),
    sitemapChangeFreq: str(formData, "sitemapChangeFreq"),
  });

  try {
    if (Object.keys(override).length === 0) {
      await deleteSeoOverride(path);
    } else {
      await upsertSeoOverride(path, override);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    redirect(
      `/admin/seo/edit?path=${encodeURIComponent(path)}&error=${encodeURIComponent(message)}`,
    );
  }

  await revalidate(path);
  await revalidate("/sitemap.xml");
  redirect(`/admin/seo/edit?path=${encodeURIComponent(path)}&saved=1`);
}

export async function saveSeoTemplatesAction(formData: FormData): Promise<void> {
  const pair = (prefix: string) => ({
    title: str(formData, `${prefix}_title`),
    description: str(formData, `${prefix}_description`),
  });

  const templates: SeoTemplates = {
    separator: str(formData, "separator") || "|",
    defaultTitle: str(formData, "defaultTitle"),
    home: pair("home"),
    service: pair("service"),
    location: pair("location"),
    locationService: pair("locationService"),
    project: pair("project"),
    blog: pair("blog"),
    defaultOgImage: str(formData, "defaultOgImage"),
    twitterSite: str(formData, "twitterSite"),
    defaultTwitterCard: str(formData, "defaultTwitterCard") || "summary_large_image",
    verification: {
      google: str(formData, "verifyGoogle"),
      bing: str(formData, "verifyBing"),
      yandex: str(formData, "verifyYandex"),
      pinterest: str(formData, "verifyPinterest"),
      baidu: str(formData, "verifyBaidu"),
    },
  };

  try {
    await saveSeoTemplates(templates);
    await saveBreadcrumbSettings({
      enabled: bool(formData, "breadcrumbsEnabled"),
      showHome: bool(formData, "breadcrumbsShowHome"),
      homeLabel: str(formData, "breadcrumbsHomeLabel") || "Home",
      separator: str(formData, "breadcrumbsSeparator") || "chevron",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    redirect(`/admin/seo-settings?error=${encodeURIComponent(message)}`);
  }

  // Titles and descriptions are baked into every rendered page.
  await revalidate("/", "layout");
  redirect("/admin/seo-settings?saved=1");
}
