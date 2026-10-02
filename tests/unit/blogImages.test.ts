import { describe, expect, it, vi } from "vitest";

vi.mock("sharp", () => ({ default: vi.fn() }));

import { shouldSwap } from "@/lib/blogImages";

describe("shouldSwap", () => {
  it("swaps a landscape card image with a portrait post image", () => {
    expect(shouldSwap(1670 / 941, 928 / 1152)).toBe(true);
  });

  it("keeps images that are already in the right slots", () => {
    expect(shouldSwap(1080 / 1350, 1920 / 1080)).toBe(false);
  });

  it("keeps two images of the same shape as entered", () => {
    expect(shouldSwap(16 / 9, 16 / 9)).toBe(false);
    expect(shouldSwap(4 / 5, 4 / 5)).toBe(false);
  });
});
