import { describe, expect, it } from "vitest";
import { defaultOtherServices, otherServicesFor } from "@/lib/otherServices";
import { readReviewSelection } from "@/app/admin/_actions/pageSections";
import { reviewKey, selectReviews } from "@/data/pageSections";

const slugs = ["solar", "heat-pumps", "heating", "loft", "ewi", "kitchens"];

describe("other services cards", () => {
  it("defaults to the first four other services", () => {
    expect(defaultOtherServices(slugs, "heating")).toEqual(["solar", "heat-pumps", "loft", "ewi"]);
  });
  it("uses the page's pick, minus deleted services and itself", () => {
    expect(otherServicesFor(slugs, "loft", ["kitchens", "gone", "loft", "solar"])).toEqual(["kitchens", "solar"]);
  });
  it("falls back to the default when nothing valid is left", () => {
    expect(otherServicesFor(slugs, "loft", ["gone"])).toEqual(defaultOtherServices(slugs, "loft"));
  });
});

describe("review choice", () => {
  const reviews = [
    { name: "Amjid H.", quote: "I got my insulation done by greentek" },
    { name: "Luki", quote: "We required an urgent new boiler" },
    { name: "Omer M.", quote: "Quick and efficient service." },
  ];
  const keys = reviews.map(reviewKey);
  const form = (fields: [string, string][]) => {
    const fd = new FormData();
    for (const [k, v] of fields) fd.append(k, v);
    return fd;
  };

  it("shows the chosen reviews in order, or all when none are chosen or none still exist", () => {
    expect(selectReviews(reviews, [keys[2], keys[0]]).map((r) => r.name)).toEqual(["Omer M.", "Amjid H."]);
    expect(selectReviews(reviews, undefined)).toHaveLength(3);
    expect(selectReviews(reviews, ["Deleted::gone"])).toHaveLength(3);
  });

  it("stores a choice only when it differs from what the page inherits", () => {
    const inherited = JSON.stringify(keys);
    const base: [string, string][] = [["reviews_present", "1"], ["reviews_inherited", inherited]];
    expect(readReviewSelection(form([...base, ...keys.map((k) => ["review", k] as [string, string])]))).toBeUndefined();
    expect(readReviewSelection(form([...base, ["review", keys[1]]]))).toEqual([keys[1]]);
    expect(readReviewSelection(form(base))).toBeUndefined(); // none ticked = follow
    expect(readReviewSelection(form([...base, ["review", keys[1]], ["resetReviews", "on"]]))).toBeUndefined();
    expect(readReviewSelection(form([["review", keys[1]]]))).toBeUndefined(); // form without the picker
  });
});
