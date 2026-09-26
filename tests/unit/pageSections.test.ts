import { describe, expect, it } from "vitest";
import { caseStudyLabels, label, LABELS_BY_KIND, SECTION_LABEL_KEYS } from "@/data/pageSections";
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

  it("stores process steps only when the tick box is on", () => {
    const fields = {
      processHeadingLine1: "How a solar install runs",
      processStepTitle_0: "Survey",
      processStepBody_0: "We measure the roof.",
      processStepTitle_1: "Design",
      processStepBody_1: "We size the system.",
    };
    // Off: the fields are ignored entirely.
    expect(readPageSections(form(fields))).toBeNull();

    const out = readPageSections(form({ ...fields, overrideProcess: "on" }));
    expect(out?.process?.headingLine1).toBe("How a solar install runs");
    expect(out?.process?.steps).toEqual([
      { number: "01", title: "Survey", body: "We measure the roof." },
      { number: "02", title: "Design", body: "We size the system." },
    ]);
  });

  it("ignores an override with a heading but no steps, which would render empty", () => {
    expect(readPageSections(form({ overrideProcess: "on", processHeadingLine1: "How it runs" })))
      .toBeNull();
  });

  it("keeps a typed step number over the generated one", () => {
    const out = readPageSections(form({
      overrideProcess: "on",
      processStepNumber_0: "Step A",
      processStepTitle_0: "Survey",
    }));
    expect(out?.process?.steps[0].number).toBe("Step A");
  });

  it("stores stats only when ticked, and only complete ones", () => {
    const out = readPageSections(form({
      overrideStats: "on",
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
