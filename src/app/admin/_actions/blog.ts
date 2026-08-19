"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  getBlogPostBySlug,
  getBlogPosts,
} from "@/lib/db/blogPosts";
import type { BlogPost } from "@/data/blogs";
import { parseContentBlocks } from "./contentBlocks";

function revalidateBlogRoutes(slug: string, previousSlug?: string) {
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  if (previousSlug && previousSlug !== slug) {
    revalidatePath(`/blog/${previousSlug}`);
  }
  revalidatePath("/sitemap.xml");
}

export async function saveBlogPostAction(formData: FormData): Promise<void> {
  const originalSlug = String(formData.get("originalSlug") || "");
  const isNew = !originalSlug;
  const editingPath = isNew ? "/admin/blog/new" : `/admin/blog/${originalSlug}`;

  const slug = String(formData.get("slug") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const excerpt = String(formData.get("excerpt") || "").trim();
  const date = String(formData.get("date") || "").trim();
  const category = String(formData.get("category") || "").trim();
  const coverImage = String(formData.get("coverImage") || "").trim();
  const coverImageAlt = String(formData.get("coverImageAlt") || "").trim();
  const instagramUrl = String(formData.get("instagramUrl") || "").trim();
  const metaTitle = String(formData.get("metaTitle") || "").trim();
  const metaDescription = String(formData.get("metaDescription") || "").trim();
  const keywords = String(formData.get("keywords") || "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  if (!slug || !title) {
    redirect(
      `${editingPath}?error=${encodeURIComponent("Title and slug are required")}`,
    );
  }

  const original = isNew ? null : await getBlogPostBySlug(originalSlug);
  if (!isNew && !original) {
    redirect(`/admin/blog?error=${encodeURIComponent("Original post not found")}`);
  }

  if (isNew || slug !== originalSlug) {
    if (await getBlogPostBySlug(slug)) {
      redirect(
        `${editingPath}?error=${encodeURIComponent("A post with that slug already exists")}`,
      );
    }
  }

  const nextId = isNew
    ? Math.max(0, ...(await getBlogPosts()).map((p) => p.id)) + 1
    : original!.id;

  const post: BlogPost = {
    id: nextId,
    title,
    slug,
    excerpt,
    date,
    category,
    coverImage,
    coverImageAlt,
    ...(instagramUrl ? { instagramUrl } : {}),
    metaTitle,
    metaDescription,
    keywords,
    content: parseContentBlocks(formData),
  };

  try {
    if (isNew) {
      await createBlogPost(post);
    } else {
      await updateBlogPost(originalSlug, post);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    redirect(`${editingPath}?error=${encodeURIComponent(message)}`);
  }

  revalidateBlogRoutes(slug, isNew ? undefined : originalSlug);
  redirect(`/admin/blog/${slug}?saved=1`);
}

export async function deleteBlogPostAction(formData: FormData): Promise<void> {
  const slug = String(formData.get("slug") || "");

  try {
    await deleteBlogPost(slug);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    redirect(`/admin/blog?error=${encodeURIComponent(message)}`);
  }

  revalidateBlogRoutes(slug);
  redirect("/admin/blog?deleted=1");
}
