import { getCurrentSiteConfig, getCurrentBlogPosts } from "@/lib/cms";
import { getPages } from "@/lib/db/pages";
import { getBlockDraft } from "@/lib/db/pageContent";
import { PAGE_CONTENT_KEYS, PAGE_CONTENT_META } from "@/data/pageContent";

export interface ImageUsage {
  url: string;
  /** Where this image appears, e.g. "Service: Solar PV". */
  usedIn: string[];
  /** Alt text found for it, if any. */
  alt: string | null;
}

/**
 * Walks every content source and reports each image with where it is used and
 * whether it has alt text.
 *
 * Alt text is spread across a dozen forms, so there was no way to answer "which
 * images are still missing alt?" without opening each one. This is that answer.
 */
export async function collectImageUsage(): Promise<ImageUsage[]> {
  const [site, posts, pages] = await Promise.all([
    getCurrentSiteConfig(),
    getCurrentBlogPosts(),
    getPages(),
  ]);

  const map = new Map<string, ImageUsage>();

  function record(url: string | undefined, where: string, alt?: string) {
    if (!url?.trim()) return;
    const entry = map.get(url) ?? { url, usedIn: [], alt: null };
    if (!entry.usedIn.includes(where)) entry.usedIn.push(where);
    if (!entry.alt && alt?.trim()) entry.alt = alt.trim();
    map.set(url, entry);
  }

  for (const service of site.services) {
    record(service.image, `Service: ${service.title}`, service.imageAlt);
    for (const block of service.content ?? []) record(block.src, `Service: ${service.title}`, block.alt);
  }
  for (const location of site.locations) {
    record(location.image, `Location: ${location.name}`, location.imageAlt);
    for (const block of location.content ?? []) record(block.src, `Location: ${location.name}`, block.alt);
  }
  for (const project of site.projects) {
    record(project.before, `Project: ${project.title} (before)`, project.beforeAlt);
    record(project.after, `Project: ${project.title} (after)`, project.afterAlt);
    (project.gallery ?? []).forEach((url, i) =>
      record(url, `Project: ${project.title} (gallery ${i + 1})`, project.galleryAlt?.[i]),
    );
  }
  for (const post of posts) {
    record(post.coverImage, `Blog: ${post.title}`, post.coverImageAlt);
    for (const block of post.content ?? []) record(block.src, `Blog: ${post.title}`, block.alt);
  }
  for (const page of pages) {
    record(page.heroImage, `Page: ${page.title}`, page.heroImageAlt);
    for (const block of page.content ?? []) record(block.src, `Page: ${page.title}`, block.alt);
  }

  // Page content blocks store images in their own shapes, so each is read directly.
  for (const key of PAGE_CONTENT_KEYS) {
    const block = (await getBlockDraft(key)) as Record<string, unknown> | null;
    if (!block) continue;
    const where = `Section: ${PAGE_CONTENT_META[key].label}`;

    const scan = (value: unknown) => {
      if (!value || typeof value !== "object") return;
      if (Array.isArray(value)) return value.forEach(scan);
      const record_ = value as Record<string, unknown>;
      if (typeof record_.image === "string") {
        record(record_.image, where, typeof record_.imageAlt === "string" ? record_.imageAlt : undefined);
      }
      Object.values(record_).forEach(scan);
    };
    scan(block);
  }

  return [...map.values()].sort((a, b) => {
    // Missing alt first — that's the list someone is here to work through.
    if (!a.alt && b.alt) return -1;
    if (a.alt && !b.alt) return 1;
    return a.url.localeCompare(b.url);
  });
}
