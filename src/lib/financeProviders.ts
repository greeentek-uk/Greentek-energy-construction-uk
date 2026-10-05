import type { PageContentKey } from "@/data/pageContent";

/**
 * The finance providers, in the order they're listed — the one place the
 * provider pages, the /finance overview and the header's Finance menu read
 * from, so a provider can't appear in one and be missing from another.
 * Their wording lives in the panel (Pages → Finance), one block each.
 */
export const FINANCE_PROVIDERS = [
  { slug: "ideal4finance", block: "finance-ideal4finance", name: "Ideal4Finance" },
  { slug: "phoenix", block: "finance-phoenix", name: "Phoenix Financial Consultants" },
] as const satisfies readonly { slug: string; block: PageContentKey; name: string }[];

export type FinanceProviderSlug = (typeof FINANCE_PROVIDERS)[number]["slug"];

export function financeProvider(slug: string) {
  return FINANCE_PROVIDERS.find((p) => p.slug === slug);
}

/** Plain text → paragraphs, split on blank lines. */
export function paragraphs(text: string | undefined): string[] {
  return (text ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}
