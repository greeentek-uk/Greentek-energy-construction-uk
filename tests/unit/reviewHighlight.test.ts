import { describe, expect, it } from "vitest";
import { reviewHighlight } from "@/lib/reviewHighlight";

// The site's real reviews (2026-11-04), whose first 120 characters were what
// the heat pump page's strip showed under the hero.
const AMJID =
  "I got my insulation done by greentek they were fantastic from the start. On the way we had one two problems from the contractors but greentek took care of it! Kept me informed and solved the issues. They communicated consistently and kept me in the loop.";
const IAN =
  "Part of the Ecobility company. the people at Greentek know their stuff. Got a quote in just under 20 minutes where others insisted on coming around the house. They were cheaper too!";

describe("reviewHighlight", () => {
  it("picks the praise, not the problem", () => {
    expect(reviewHighlight(AMJID)).toBe("I got my insulation done by greentek they were fantastic from the start.");
  });

  it("skips a sentence that says nothing about us", () => {
    expect(reviewHighlight(IAN)).toBe("The people at Greentek know their stuff.");
  });

  it("only ever returns a sentence the reviewer wrote", () => {
    for (const review of [AMJID, IAN]) {
      const line = reviewHighlight(review);
      expect(review.toLowerCase()).toContain(line.toLowerCase());
    }
  });

  it("keeps a short review as it is", () => {
    expect(reviewHighlight("Quick and efficient service.")).toBe("Quick and efficient service.");
    expect(reviewHighlight("Great")).toBe("Great");
  });
});
