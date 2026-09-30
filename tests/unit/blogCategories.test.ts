import { describe, expect, it } from "vitest";
import { categoryPath, categorySlug, getBlogCategories, postsInCategory } from "@/lib/blogCategories";
import type { BlogPost } from "@/data/blogs";

const post = (id: number, category: string) => ({ id, category }) as BlogPost;
const posts = [post(1, "Energy Saving"), post(2, "Experience"), post(3, "Energy Saving"), post(4, "energy saving "), post(5, "")];

describe("blog categories", () => {
  it("makes clean URLs from category names", () => {
    expect(categorySlug("Energy Saving")).toBe("energy-saving");
    expect(categorySlug("Heat Pumps & Solar!")).toBe("heat-pumps-and-solar");
    expect(categoryPath("Customer Reviews")).toBe("/blog/category/customer-reviews");
  });

  it("groups names that differ only in case or spacing, most posts first", () => {
    expect(getBlogCategories(posts)).toEqual([
      { name: "Energy Saving", slug: "energy-saving", count: 3 },
      { name: "Experience", slug: "experience", count: 1 },
    ]);
  });

  it("lists a category's posts by its slug", () => {
    expect(postsInCategory(posts, "energy-saving").map((p) => p.id)).toEqual([1, 3, 4]);
  });
});
