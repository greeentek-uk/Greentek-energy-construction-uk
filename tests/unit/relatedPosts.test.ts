import { describe, expect, it } from "vitest";
import { pickRelatedPosts } from "@/lib/relatedPosts";
import type { BlogPost } from "@/data/blogs";

const post = (slug: string, category: string, date: string, relatedPosts?: string[]) =>
  ({ slug, category, date, ...(relatedPosts ? { relatedPosts } : {}) }) as BlogPost;

const all = [
  post("a", "Energy Saving", "2026-01-01"),
  post("b", "Energy Saving", "2026-03-01"),
  post("c", "energy saving ", "2026-02-01"),
  post("d", "Experience", "2026-05-01"),
  post("e", "Process", "2026-04-01"),
];
const slugs = (ps: BlogPost[]) => ps.map((p) => p.slug);

describe("related posts", () => {
  it("fills from the same category, newest first, never the post itself", () => {
    expect(slugs(pickRelatedPosts(all[0], all))).toEqual(["b", "c", "d"]);
  });

  it("tops up from other categories when the category runs out", () => {
    expect(slugs(pickRelatedPosts(all[3], all))).toEqual(["e", "b", "c"]);
  });

  it("puts hand-picked posts first and skips missing, duplicate or self picks", () => {
    const picked = post("a", "Energy Saving", "2026-01-01", ["e", "gone", "e", "a"]);
    expect(slugs(pickRelatedPosts(picked, all))).toEqual(["e", "b", "c"]);
  });
});
