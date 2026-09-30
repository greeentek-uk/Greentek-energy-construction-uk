import type { BlogPost } from "@/data/blogs";

/**
 * Blog categories as pages: /blog/category/[slug].
 *
 * A category is just the free-text `category` on each post, so its URL is
 * derived from the name — there's no separate list to keep in step. Renaming a
 * category in the panel moves its page; the sitemap follows automatically.
 */
export interface BlogCategory {
  name: string;
  slug: string;
  count: number;
}

export function categorySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function categoryPath(name: string): string {
  return `/blog/category/${categorySlug(name)}`;
}

/** Every category with a post in it, most posts first, then A–Z. */
export function getBlogCategories(posts: BlogPost[]): BlogCategory[] {
  const bySlug = new Map<string, BlogCategory>();
  for (const post of posts) {
    const name = post.category?.trim();
    if (!name) continue;
    const slug = categorySlug(name);
    if (!slug) continue;
    const existing = bySlug.get(slug);
    if (existing) existing.count++;
    else bySlug.set(slug, { name, slug, count: 1 });
  }
  return [...bySlug.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function postsInCategory(posts: BlogPost[], slug: string): BlogPost[] {
  return posts.filter((p) => p.category && categorySlug(p.category) === slug);
}
