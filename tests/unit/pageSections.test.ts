import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  caseStudyLabels,
  label,
  LABEL_GROUPS,
  LABELS_BY_KIND,
  SECTION_LABEL_KEYS,
} from "@/data/pageSections";
import { CONTENT_PAGES, UNUSED_BLOCKS } from "@/data/adminPages";
import { PAGE_CONTENT_KEYS } from "@/data/pageContent";
import { canonPricing, canonProblem, ownOrInherited } from "@/app/admin/_actions/inheritance";
import { readPageSections } from "@/app/admin/_actions/pageSections";

function form(values: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(values)) fd.set(k, v);
  return fd;
}

describe("label fallback", () => {
  it("uses the page's wording when set, the default otherwise", () => {
    expect(label({ labels: { includedHeading: "What solar includes" } }, "includedHeading", "What's Included"))
      .toBe("What solar includes");
    expect(label({}, "includedHeading", "What's Included")).toBe("What's Included");
    expect(label(null, "includedHeading", "What's Included")).toBe("What's Included");
    // Whitespace isn't an override.
    expect(label({ labels: { includedHeading: "   " } }, "includedHeading", "What's Included"))
      .toBe("What's Included");
  });
});

describe("readPageSections", () => {
  it("returns null for an untouched form, so the page keeps the shared copy", () => {
    expect(readPageSections(form({}))).toBeNull();
    expect(readPageSections(form({ label_includedHeading: "  ", processEyebrow: "" }))).toBeNull();
  });

  it("keeps only the labels that were filled in", () => {
    const out = readPageSections(form({
      label_includedHeading: "What a Cardiff install includes",
      label_ctaHeading: "",
    }));
    expect(out).toEqual({ labels: { includedHeading: "What a Cardiff install includes" } });
  });

  const shared = {
    process: {
      eyebrow: "Our Process",
      headingLine1: "Four Steps.",
      headingLine2: "Zero Surprises.",
      subheading: "From the first call to handover.",
      steps: [
        { number: "01", title: "Free Survey", body: "We visit.\nWe measure." },
        { number: "02", title: "Custom Quote", body: "A fixed price." },
      ],
    },
    stats: { items: [{ value: "500+", label: "Projects Completed", description: "Delivered." }] },
  };
  // What the editor posts when the pre-filled shared steps are left alone —
  // as a browser sends it, with CRLF line breaks and the blank slots.
  const untouchedProcess = {
    processEyebrow: "Our Process",
    processHeadingLine1: "Four Steps.",
    processHeadingLine2: "Zero Surprises.",
    processSubheading: "From the first call to handover.",
    processStepNumber_0: "01",
    processStepTitle_0: "Free Survey",
    processStepBody_0: "We visit.\r\nWe measure.",
    processStepNumber_1: "02",
    processStepTitle_1: "Custom Quote",
    processStepBody_1: "A fixed price. ",
  };

  it("keeps edited process steps as the page's own — no tick box needed", () => {
    const out = readPageSections(
      form({ ...untouchedProcess, processStepTitle_1: "A quote for Cardiff" }),
      shared,
    );
    expect(out?.process?.steps[1]).toEqual({ number: "02", title: "A quote for Cardiff", body: "A fixed price." });
  });

  it("leaves untouched pre-filled steps alone, so the page keeps following", () => {
    expect(readPageSections(form(untouchedProcess), shared)).toBeNull();
  });

  it("goes back to the shared steps when reset, even if they were edited", () => {
    const out = readPageSections(
      form({ ...untouchedProcess, processStepTitle_1: "Changed", resetProcess: "on" }),
      shared,
    );
    expect(out).toBeNull();
  });

  it("stores steps filled into an empty form, numbering blank slots", () => {
    const out = readPageSections(form({
      processHeadingLine1: "How a solar install runs",
      processStepTitle_0: "Survey",
      processStepBody_0: "We measure the roof.",
      processStepTitle_1: "Design",
      processStepBody_1: "We size the system.",
    }));
    expect(out?.process?.headingLine1).toBe("How a solar install runs");
    expect(out?.process?.steps).toEqual([
      { number: "01", title: "Survey", body: "We measure the roof." },
      { number: "02", title: "Design", body: "We size the system." },
    ]);
  });

  it("ignores a heading with no steps, which would render empty", () => {
    expect(readPageSections(form({ processHeadingLine1: "How it runs" }))).toBeNull();
  });

  it("keeps a typed step number over the generated one", () => {
    const out = readPageSections(form({
      processStepNumber_0: "Step A",
      processStepTitle_0: "Survey",
    }));
    expect(out?.process?.steps[0].number).toBe("Step A");
  });

  it("treats stats the same way: untouched follows, edited is kept", () => {
    const untouched = { statValue_0: "500+", statLabel_0: "Projects Completed", statDescription_0: "Delivered." };
    expect(readPageSections(form(untouched), shared)).toBeNull();
    expect(readPageSections(form({ ...untouched, statValue_0: "120+" }), shared)?.stats?.items[0].value).toBe("120+");
  });

  it("stores only complete stats", () => {
    const out = readPageSections(form({
      statValue_0: "120+",
      statLabel_0: "Solar installs",
      statDescription_0: "Across the West Midlands.",
      statValue_1: "98%",          // no label — dropped
    }));
    expect(out?.stats?.items).toEqual([
      { value: "120+", label: "Solar installs", description: "Across the West Midlands." },
    ]);
  });
});

describe("label coverage", () => {
  it("offers every label on at least one kind of page, so none is stored but never shown", () => {
    const offered = new Set(Object.values(LABELS_BY_KIND).flat());
    expect(SECTION_LABEL_KEYS.filter((key) => !offered.has(key))).toEqual([]);
  });

  it("reads the hero, case study and FAQ labels back from the form", () => {
    const out = readPageSections(
      form({
        label_heroHeading: "Solar panels fitted in",
        label_caseStudyButton: "Get a result like this",
        label_faqHeading: "Solar questions",
      }),
    );
    expect(out?.labels).toEqual({
      heroHeading: "Solar panels fitted in",
      caseStudyButton: "Get a result like this",
      faqHeading: "Solar questions",
    });
  });

  it("maps case study labels into the component's shape, blanks as undefined", () => {
    expect(caseStudyLabels({ labels: { caseStudyHeading: " A Solihull loft ", caseStudyText: "  " } }))
      .toEqual({
        eyebrow: undefined,
        heading: "A Solihull loft",
        text: "",
        button: undefined,
        link: undefined,
      });
  });
});

describe("LABEL_GROUPS", () => {
  // A label offered but not rendered in any section would post blank and be
  // wiped on save, so the groups must cover each kind's labels exactly once.
  it.each(Object.entries(LABEL_GROUPS))("covers every %s label exactly once", (kind, groups) => {
    const grouped = Object.values(groups).flat();
    expect(new Set(grouped).size).toBe(grouped.length);
    expect([...grouped].sort()).toEqual(
      [...LABELS_BY_KIND[kind as keyof typeof LABEL_GROUPS]].sort(),
    );
  });
});

describe("CONTENT_PAGES", () => {
  // A block on no page would be unreachable from the page-based panel.
  it("places every page content block on a page, or lists it as unused", () => {
    const placed = new Set([
      ...CONTENT_PAGES.flatMap((p) => p.sections.map((s) => s.key)),
      ...UNUSED_BLOCKS,
    ]);
    expect(PAGE_CONTENT_KEYS.filter((key) => !placed.has(key))).toEqual([]);
  });

  it("has unique page ids", () => {
    const ids = CONTENT_PAGES.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("problem / pricing: own or inherited", () => {
  const service = {
    heading: "Heating the house, and losing the heat through the roof?",
    intro: "Heat rises.\n\nIt's cheap to fix.",
    cards: [
      { title: "Cold upstairs rooms", body: "Bedrooms cool quickly." },
      { title: "Thin old insulation", body: "A few centimetres." },
    ],
    ctaLabel: "Check my loft",
  };
  // The same copy as the form posts it back: CRLF, stray spaces, blank slots.
  const posted = {
    ...service,
    intro: "Heat rises.\r\n\r\nIt's cheap to fix. ",
    cards: [...service.cards, { title: "", body: "" }, { title: "", body: "" }],
  };

  it("follows the service when the pre-filled copy wasn't changed", () => {
    expect(ownOrInherited(posted, service, canonProblem, false)).toBeNull();
  });

  it("keeps an edit as the page's own — the lost-edit bug", () => {
    const own = ownOrInherited({ ...posted, heading: "Cardiff lofts losing heat?" }, service, canonProblem, false);
    expect(own?.heading).toBe("Cardiff lofts losing heat?");
    expect(own?.cards).toHaveLength(2);
    expect(own?.intro).toBe("Heat rises.\n\nIt's cheap to fix.");
  });

  it("goes back to the service's when reset", () => {
    expect(ownOrInherited({ ...posted, heading: "Changed" }, service, canonProblem, true)).toBeNull();
  });

  it("treats a default button label as unchanged", () => {
    const noCta = { ...service, ctaLabel: "" };
    expect(ownOrInherited({ ...noCta, ctaLabel: "Get a free survey" }, noCta, canonProblem, false)).toBeNull();
  });

  it("does the same for pricing", () => {
    const pricing = {
      heading: "What loft insulation costs",
      intro: "Four things change the price.",
      factors: [{ title: "Loft size", body: "Measured at survey." }],
      included: ["A free site survey", "A fixed price"],
      note: "No quotes by postcode.",
      ctaLabel: "Get a fixed-price quote",
    };
    expect(ownOrInherited({ ...pricing, included: [" A free site survey", "A fixed price", ""] }, pricing, canonPricing, false)).toBeNull();
    expect(ownOrInherited({ ...pricing, note: "Cardiff surveys this week." }, pricing, canonPricing, false)?.note).toBe(
      "Cardiff surveys this week.",
    );
  });
});

describe("every label group is rendered by its editor", () => {
  // A group missing from the form posts its labels blank, and a save wipes
  // them. Cheap source check, since the forms are client components.
  const forms = { service: "ServiceForm", location: "LocationForm", locationService: "LocationServiceContentForm" } as const;
  it.each(Object.entries(forms))("%s → %s", (kind, file) => {
    const src = readFileSync(`src/app/admin/_components/${file}.tsx`, "utf8");
    const groups = Object.keys(LABEL_GROUPS[kind as keyof typeof forms]);
    expect(groups.filter((g) => !src.includes(`groups.${g}`))).toEqual([]);
  });
});
