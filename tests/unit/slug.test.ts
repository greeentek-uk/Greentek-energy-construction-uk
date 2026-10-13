import { describe, expect, it } from "vitest";
import { isValidSlug } from "@/lib/slug";

describe("isValidSlug", () => {
  it("accepts lowercase words joined by hyphens", () => {
    expect(isValidSlug("loft-conversion-permitted-development")).toBe(true);
    expect(isValidSlug("cost-2026")).toBe(true);
  });

  it("flags what made a post 404 on the site and in the panel", () => {
    for (const bad of [
      "/loft-conversion-permitted-development",
      "my-post/",
      "https://www.greentekenergy.co.uk/blog/my-post",
      "My-Post",
      "my post",
      "my--post",
      "-my-post",
      "",
    ]) {
      expect(isValidSlug(bad), bad).toBe(false);
    }
  });
});
