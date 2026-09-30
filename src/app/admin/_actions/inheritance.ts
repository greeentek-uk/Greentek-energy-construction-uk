import type { ProblemSection, ServicePricing } from "@/data/site";
import type { ProcessContent, StatsContent } from "@/data/pageContent";

/**
 * Deciding whether a page has its own section or still follows the one it
 * inherits (the service's, or the shared block).
 *
 * These sections used to become a page's own only when an "its own" box was
 * ticked. The editors show the inherited copy pre-filled, so the natural move
 * — edit the text, press Save — silently threw the edit away when the box
 * wasn't ticked. Five Cardiff combos were edited that way and kept none of
 * their problem/pricing changes. Now the edit itself is the signal: copy that
 * differs from what's inherited is kept as the page's own; copy that matches
 * is dropped, so the page keeps following. A separate "go back" box resets.
 *
 * "Matches" has to survive a form round trip, which trims, turns textarea line
 * breaks into CRLF, fills default button labels and only shows so many slots —
 * so both sides are reduced to what the form can express before comparing.
 * Plain module: a "use server" file may only export async functions.
 */

const clean = (s: string | undefined | null) => (s ?? "").replace(/\r\n?/g, "\n").trim();

export function canonProblem(p: ProblemSection | null | undefined) {
  if (!p) return null;
  const cards = (p.cards ?? [])
    .slice(0, 4)
    .map((c) => ({ title: clean(c.title), body: clean(c.body) }))
    .filter((c) => c.title);
  if (!clean(p.heading) || !cards.length) return null;
  return {
    heading: clean(p.heading),
    intro: clean(p.intro),
    cards,
    ctaLabel: clean(p.ctaLabel) || "Get a free survey",
  };
}

export function canonPricing(p: ServicePricing | null | undefined) {
  if (!p || !clean(p.heading)) return null;
  return {
    heading: clean(p.heading),
    intro: clean(p.intro),
    factors: (p.factors ?? [])
      .slice(0, 4)
      .map((f) => ({ title: clean(f.title), body: clean(f.body) }))
      .filter((f) => f.title),
    included: (p.included ?? []).map(clean).filter(Boolean),
    note: clean(p.note),
    ctaLabel: clean(p.ctaLabel) || "Get a fixed-price quote",
  };
}

export function canonProcess(p: ProcessContent | null | undefined) {
  if (!p) return null;
  const steps = (p.steps ?? [])
    .slice(0, 6)
    .map((s, i) => ({
      number: clean(s.number) || String(i + 1).padStart(2, "0"),
      title: clean(s.title),
      body: clean(s.body),
    }))
    .filter((s) => s.title);
  if (!steps.length) return null;
  return {
    eyebrow: clean(p.eyebrow),
    headingLine1: clean(p.headingLine1),
    headingLine2: clean(p.headingLine2),
    subheading: clean(p.subheading),
    steps,
  };
}

export function canonStats(s: StatsContent | null | undefined) {
  if (!s) return null;
  const items = (s.items ?? [])
    .slice(0, 3)
    .map((i) => ({ value: clean(i.value), label: clean(i.label), description: clean(i.description) }))
    .filter((i) => i.value && i.label);
  return items.length ? { items } : null;
}

/**
 * The page's own section, or null to follow the inherited one.
 *
 * Null when the reset box was ticked, when nothing complete was submitted, or
 * when the submission is the inherited copy unchanged. Only a real difference
 * is stored — in the canonical form, so what's saved is what was compared.
 */
export function ownOrInherited<T, C>(
  submitted: T | null | undefined,
  inherited: T | null | undefined,
  canon: (value: T | null | undefined) => C | null,
  reset: boolean,
): C | null {
  if (reset) return null;
  const own = canon(submitted);
  if (!own) return null;
  return JSON.stringify(own) === JSON.stringify(canon(inherited)) ? null : own;
}
