import path from "node:path";
import sharp from "sharp";
import type { BlogPost } from "@/data/blogs";

/**
 * Puts each post's two images where their *shape* fits, whatever slot they
 * were entered in: the cards are 4:5 and the post's own image is 16:9, so the
 * card gets whichever image is nearer 4:5 and the post whichever is nearer
 * 16:9. A post with one image uses it for both (FittedImage shows it whole).
 *
 * Why not trust the slots: a post was saved with its landscape image as the
 * card image and its portrait one as the post image, and both pages cropped
 * each to the wrong shape. Done on read for public pages only — the admin
 * still sees, and saves, exactly what was entered.
 */

const CARD_RATIO = 4 / 5;
const POST_RATIO = 16 / 9;

/** Distance between two aspect ratios, symmetric for wider vs taller. */
function misfit(ratio: number, target: number): number {
  return Math.abs(Math.log(ratio / target));
}

/**
 * Width ÷ height, or null when it can't be read (missing file, network error,
 * a host we don't probe) — in which case the slots are left as entered.
 * Module-level memo: Cloudinary URLs are versioned and local files ship with
 * the build, so a URL's shape never changes within a server's lifetime.
 */
const ratios = new Map<string, Promise<number | null>>();

function imageRatio(src: string): Promise<number | null> {
  let hit = ratios.get(src);
  if (!hit) {
    hit = readRatio(src).catch(() => null);
    ratios.set(src, hit);
  }
  return hit;
}

const CLOUDINARY_UPLOAD_MARKER = "/image/upload/";

async function readRatio(src: string): Promise<number | null> {
  if (src.includes("res.cloudinary.com") && src.includes(CLOUDINARY_UPLOAD_MARKER)) {
    // fl_getinfo returns the dimensions as JSON instead of the image. It goes
    // *after* any hand-pasted transform (same detection as imageLoader.ts), so
    // a deliberate crop is measured as cropped.
    const [base, rest] = src.split(CLOUDINARY_UPLOAD_MARKER);
    const segments = rest.split("/");
    const hasExistingTransform =
      segments.length > 1 && segments[0].includes("_") && !/^v\d+$/.test(segments[0]);
    const existing = hasExistingTransform ? `${segments.shift()}/` : "";
    const res = await fetch(`${base}${CLOUDINARY_UPLOAD_MARKER}${existing}fl_getinfo/${segments.join("/")}`, {
      cache: "force-cache",
    });
    if (!res.ok) return null;
    const info = (await res.json()) as { output?: { width?: number; height?: number } };
    const { width, height } = info.output ?? {};
    return width && height ? width / height : null;
  }
  if (src.startsWith("/") && !src.startsWith("//")) {
    // public/ isn't always on a serverless function's disk; a failed read is
    // just "unknown", and these local covers are all 4:5 portraits anyway.
    const file = path.join(process.cwd(), "public", decodeURI(src.split("?")[0]));
    const { width, height } = await sharp(file).metadata();
    return width && height ? width / height : null;
  }
  return null;
}

/** True when the two images fit better the other way round. */
export function shouldSwap(coverRatio: number, heroRatio: number): boolean {
  const asEntered = misfit(coverRatio, CARD_RATIO) + misfit(heroRatio, POST_RATIO);
  const swapped = misfit(heroRatio, CARD_RATIO) + misfit(coverRatio, POST_RATIO);
  return swapped < asEntered;
}

async function arrange(post: BlogPost): Promise<BlogPost> {
  if (!post.heroImage || post.heroImage === post.coverImage) return post;
  const [coverRatio, heroRatio] = await Promise.all([imageRatio(post.coverImage), imageRatio(post.heroImage)]);
  if (coverRatio === null || heroRatio === null || !shouldSwap(coverRatio, heroRatio)) return post;
  return {
    ...post,
    coverImage: post.heroImage,
    coverImageAlt: post.heroImageAlt || post.coverImageAlt,
    heroImage: post.coverImage,
    heroImageAlt: post.coverImageAlt,
  };
}

/** The posts with each image in the slot its shape suits. */
export function arrangeBlogImages(posts: BlogPost[]): Promise<BlogPost[]> {
  return Promise.all(posts.map(arrange));
}
