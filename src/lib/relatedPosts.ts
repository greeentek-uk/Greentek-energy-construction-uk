import type { BlogPost } from "@/data/blogs";
import { categorySlug } from "@/lib/blogCategories";

/** How many "Related articles" cards a post ends with. */
export const RELATED_POST_COUNT = 3;

/**
 * The posts shown under "Related articles" at the end of a post.
 *
 * Slots picked in the panel (`post.relatedPosts`) come first, in the order
 * picked. Any slot left on "Automatic" is filled with the newest posts in the
 * same category, then — because most categories only hold one or two posts —
 * with the newest posts from anywhere else, so the row is never short.
 * A picked slug that no longer exists (deleted post) is skipped, not shown
 * as a broken card.
 */
export function pickRelatedPosts(
  post: BlogPost,
  all: BlogPost[],
  count = RELATED_POST_COUNT,
): BlogPost[] {
  const bySlug = new Map(all.map((p) => [p.slug, p]));
  const chosen: BlogPost[] = [];
  const add = (p: BlogPost | undefined) => {
    if (p && p.slug !== post.slug && !chosen.includes(p) && chosen.length < count) chosen.push(p);
  };

  for (const slug of post.relatedPosts ?? []) add(bySlug.get(slug));

  const newestFirst = [...all].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  const category = post.category ? categorySlug(post.category) : "";
  if (category) {
    for (const p of newestFirst) if (p.category && categorySlug(p.category) === category) add(p);
  }
  for (const p of newestFirst) add(p);

  return chosen;
}
