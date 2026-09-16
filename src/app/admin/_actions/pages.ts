"use server";

import { redirect } from "next/navigation";
import { revalidate } from "@/lib/revalidate";
import {
  createPage,
  updatePage,
  deletePage,
  getPageBySlug,
} from "@/lib/db/pages";
import { RESERVED_SLUGS, type SitePage } from "@/data/pages";
import { parseContentBlocks } from "./contentBlocks";
import { parseFaqs } from "./faqs";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function savePageAction(formData: FormData): Promise<void> {
  const originalSlug = String(formData.get("originalSlug") || "");
  const isNew = !originalSlug;
  const editingPath = isNew ? "/admin/pages/new" : `/admin/pages/${originalSlug}`;

  const str = (key: string) => String(formData.get(key) || "").trim();

  const title = str("title");
  const slug = slugify(str("slug") || title);

  if (!title) redirect(`${editingPath}?error=${encodeURIComponent("A title is required")}`);
  if (!slug) redirect(`${editingPath}?error=${encodeURIComponent("A URL slug is required")}`);

  // A reserved slug would be shadowed by an existing route — the page would
  // save and then appear to do nothing, which is the worst kind of bug to hand
  // a non-technical user.
  if (RESERVED_SLUGS.includes(slug)) {
    redirect(
      `${editingPath}?error=${encodeURIComponent(
        `"/${slug}" is already used by a built-in page. Pick a different URL.`,
      )}`,
    );
  }

  if ((isNew || slug !== originalSlug) && (await getPageBySlug(slug))) {
    redirect(
      `${editingPath}?error=${encodeURIComponent("A page with that URL already exists")}`,
    );
  }

  const existing = isNew ? null : await getPageBySlug(originalSlug);
  if (!isNew && !existing) {
    redirect(`/admin/pages?error=${encodeURIComponent("That page no longer exists")}`);
  }

  const now = new Date().toISOString();
  const page: SitePage = {
    slug,
    title,
    heading: str("heading"),
    subheading: str("subheading"),
    heroImage: str("heroImage"),
    heroImageAlt: str("heroImageAlt"),
    content: parseContentBlocks(formData),
    faqs: parseFaqs(formData),
    metaTitle: str("metaTitle"),
    metaDescription: str("metaDescription"),
    published: formData.get("published") === "on",
    order: Number(formData.get("order") || 0),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  try {
    if (isNew) await createPage(page);
    else await updatePage(originalSlug, page);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    redirect(`${editingPath}?error=${encodeURIComponent(message)}`);
  }

  await revalidate(`/${slug}`);
  if (!isNew && originalSlug !== slug) await revalidate(`/${originalSlug}`);
  await revalidate("/sitemap.xml");
  redirect(`/admin/pages/${slug}?saved=1`);
}

export async function deletePageAction(formData: FormData): Promise<void> {
  const slug = String(formData.get("slug") || "");

  try {
    await deletePage(slug);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    redirect(`/admin/pages?error=${encodeURIComponent(message)}`);
  }

  await revalidate(`/${slug}`);
  await revalidate("/sitemap.xml");
  redirect("/admin/pages?deleted=1");
}
