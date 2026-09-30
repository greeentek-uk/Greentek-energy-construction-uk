"use server";

import { redirect } from "next/navigation";
import { revalidate } from "@/lib/revalidate";
import { deleteAuthor, getAuthorBySlug, saveAuthor } from "@/lib/db/authors";
import { getBlogPosts, updateBlogPost } from "@/lib/db/blogPosts";
import { sanitizeRichText } from "@/lib/richText";
import { categorySlug } from "@/lib/blogCategories";
import type { Author } from "@/data/authors";

/** Only http(s) profile links — this goes into an href and into schema. */
function safeUrl(value: string): string {
  return /^https?:\/\/\S+$/i.test(value) ? value : "";
}

/** Every post shows its author's box, so an author change reaches them all. */
async function revalidatePosts() {
  await revalidate("/blog/[slug]", "page");
}

export async function saveAuthorAction(formData: FormData): Promise<void> {
  const text = (name: string) => String(formData.get(name) || "").trim();
  const originalSlug = text("originalSlug");
  const isNew = !originalSlug;
  const back = isNew ? "/admin/authors/new" : `/admin/authors/${originalSlug}`;

  const name = text("name");
  if (!name) redirect(`${back}?error=${encodeURIComponent("The author needs a name")}`);

  // A new author's id comes from their name, made unique; an existing one keeps
  // theirs, so renaming someone doesn't detach them from their posts.
  let slug = originalSlug;
  if (isNew) {
    const base = categorySlug(name) || "author";
    slug = base;
    for (let n = 2; await getAuthorBySlug(slug); n++) slug = `${base}-${n}`;
  }

  const photo = text("photo");
  const profileUrl = safeUrl(text("profileUrl"));
  const author: Author = {
    slug,
    name,
    role: text("role"),
    bio: sanitizeRichText(String(formData.get("bio") || "")),
    ...(photo ? { photo } : {}),
    ...(photo && text("photoAlt") ? { photoAlt: text("photoAlt") } : {}),
    ...(profileUrl ? { profileUrl } : {}),
  };

  try {
    await saveAuthor(author);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    redirect(`${back}?error=${encodeURIComponent(message)}`);
  }

  await revalidatePosts();
  redirect(`/admin/authors/${slug}?saved=1`);
}

export async function deleteAuthorAction(formData: FormData): Promise<void> {
  const slug = String(formData.get("slug") || "");
  try {
    // Unlink their posts first, so none is left pointing at a missing author.
    for (const post of await getBlogPosts()) {
      if (post.authorSlug === slug) {
        const { authorSlug: _removed, ...rest } = post;
        await updateBlogPost(post.slug, rest);
      }
    }
    await deleteAuthor(slug);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    redirect(`/admin/authors/${slug}?error=${encodeURIComponent(message)}`);
  }
  await revalidatePosts();
  redirect("/admin/authors?deleted=1");
}
