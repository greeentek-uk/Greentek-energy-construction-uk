import { describe, expect, it } from "vitest";
import { resolveAreaHref } from "@/lib/areaLinks";
import type { Location } from "@/data/site";

/** The live locations' names and nearby areas, as of 2026-09-19. */
function loc(slug: string, name: string, nearbyAreas: string[], isHomeBase = false): Location {
  return {
    slug,
    name,
    nearbyAreas,
    isHomeBase,
    region: "",
    image: "",
    tagline: "",
    blurb: "",
  };
}

const LOCATIONS: Location[] = [
  loc("cardiff", "Cardiff", ["Newport", "Bridgend", "Neath", "Merthyr Tydfil"]),
  loc("coventry", "Coventry", ["Sutton Coldfield", "Redditch", "Bromsgrove", "Kidderminster"]),
  loc("dudley", "Dudley", ["Stourbridge", "Halesowen", "Smethwick", "Wolverhampton"]),
  loc(
    "solihull-birmingham",
    "Solihull & Birmingham",
    ["Sutton Coldfield", "West Bromwich", "Sandwell", "Redditch"],
    true,
  ),
  loc("swansea", "Swansea", ["Neath", "Port Talbot", "Bridgend", "Wrexham"]),
  loc("wolverhampton", "Wolverhampton", ["Dudley", "Telford", "Stourbridge", "Halesowen"]),
];

describe("resolveAreaHref", () => {
  it("links a location's own name to its page, ignoring case and spaces", () => {
    expect(resolveAreaHref("Coventry", LOCATIONS)).toBe("/locations/coventry");
    expect(resolveAreaHref("  swansea ", LOCATIONS)).toBe("/locations/swansea");
  });

  it("matches one part of a joint name", () => {
    expect(resolveAreaHref("Birmingham", LOCATIONS)).toBe("/locations/solihull-birmingham");
    expect(resolveAreaHref("Solihull", LOCATIONS)).toBe("/locations/solihull-birmingham");
  });

  it("prefers a location's own page over being someone else's nearby area", () => {
    // Wolverhampton is in Dudley's nearby list, but has a page of its own.
    expect(resolveAreaHref("Wolverhampton", LOCATIONS)).toBe("/locations/wolverhampton");
  });

  it("sends a nearby town to the location listing it earliest", () => {
    expect(resolveAreaHref("Neath", LOCATIONS)).toBe("/locations/swansea"); // 1st vs 3rd
    expect(resolveAreaHref("Bridgend", LOCATIONS)).toBe("/locations/cardiff"); // 2nd vs 3rd
    expect(resolveAreaHref("Redditch", LOCATIONS)).toBe("/locations/coventry"); // 2nd vs 4th
  });

  it("breaks a tie in favour of the home base", () => {
    // First in both Coventry's and Solihull & Birmingham's lists.
    expect(resolveAreaHref("Sutton Coldfield", LOCATIONS)).toBe("/locations/solihull-birmingham");
  });

  it("gives every live ticker name a real location page", () => {
    const ticker = [
      "West Bromwich", "Sandwell", "Sutton Coldfield", "Telford", "Kidderminster", "Bromsgrove",
      "Redditch", "Stourbridge", "Halesowen", "Smethwick", "Newport", "Bridgend", "Neath",
      "Wrexham", "Merthyr Tydfil", "Port Talbot",
    ];
    for (const name of ticker) {
      expect(resolveAreaHref(name, LOCATIONS), name).toMatch(/^\/locations\/[a-z-]+$/);
    }
  });

  it("falls back to the index for an unknown or blank name", () => {
    expect(resolveAreaHref("Atlantis", LOCATIONS)).toBe("/locations");
    expect(resolveAreaHref("  ", LOCATIONS)).toBe("/locations");
  });
});
