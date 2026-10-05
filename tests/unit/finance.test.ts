import { describe, expect, it } from "vitest";
import { FINANCE_PROVIDERS, financeProvider, paragraphs } from "@/lib/financeProviders";
import { FINANCE_PROVIDER_DEFAULTS } from "@/data/financeDefaults";
import { PAGE_CONTENT_KEYS } from "@/data/pageContent";

describe("finance providers", () => {
  it("each provider has its own content block, edited in the panel", () => {
    for (const p of FINANCE_PROVIDERS) expect(PAGE_CONTENT_KEYS).toContain(p.block);
    expect(financeProvider("phoenix")?.block).toBe("finance-phoenix");
    expect(financeProvider("nope")).toBeUndefined();
  });

  it("starts Phoenix with the mandatory statement exactly as Greentek supplied it", () => {
    expect(FINANCE_PROVIDER_DEFAULTS["finance-phoenix"].disclosure).toBe(
      "Greentek Energy Ltd is an Introducer Appointed Representative (Financial Services Register No. 1057432) of Phoenix Financial Consultants Limited (Phoenix). Phoenix is a credit broker, not a lender. Phoenix is authorised and regulated by the Financial Conduct Authority (FRN: 539195), and offers finance from its panel of lenders. All finance subject to status and credit checks.",
    );
  });

  it("gives both providers every field, so neither page is thinner than the other", () => {
    const [a, b] = Object.values(FINANCE_PROVIDER_DEFAULTS);
    expect(Object.keys(a).sort()).toEqual(Object.keys(b).sort());
    for (const p of [a, b]) {
      expect(p.disclosure.length).toBeGreaterThan(50);
      expect(p.riskWarning.length).toBeGreaterThan(50);
    }
  });

  it("splits plain-text wording into paragraphs on blank lines only", () => {
    expect(paragraphs("One line.\nSame paragraph.\n\nSecond.")).toEqual(["One line.\nSame paragraph.", "Second."]);
    expect(paragraphs("")).toEqual([]);
  });
});
