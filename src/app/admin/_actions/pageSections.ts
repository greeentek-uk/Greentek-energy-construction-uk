import {
  SECTION_LABEL_KEYS,
  type PageSectionOverrides,
  type SectionLabels,
} from "@/data/pageSections";
import type { ProcessContent, StatsContent } from "@/data/pageContent";
import { canonProcess, canonStats, ownOrInherited } from "./inheritance";

/**
 * Reads the per-page section overrides posted by the page editors.
 *
 * Plain module, not a server action: it's called by the service, location,
 * location + service and project save actions.
 *
 * Everything is optional. A blank label is dropped rather than stored empty, so
 * the page falls back to the shared wording. Process steps and stats are kept
 * as the page's own only when they differ from `inherited` — what the editor
 * showed pre-filled — so editing them is enough, and leaving them alone keeps
 * the page following the shared block (see inheritance.ts for why there's no
 * tick box any more). `resetProcess` / `resetStats` go back to following.
 */
export function readPageSections(
  formData: FormData,
  inherited?: { process?: ProcessContent | null; stats?: StatsContent | null },
): PageSectionOverrides | null {
  const text = (name: string) => String(formData.get(name) || "").trim();

  const labels: SectionLabels = {};
  for (const key of SECTION_LABEL_KEYS) {
    const value = text(`label_${key}`);
    if (value) labels[key] = value;
  }

  const submittedProcess: ProcessContent = {
    eyebrow: text("processEyebrow"),
    headingLine1: text("processHeadingLine1"),
    headingLine2: text("processHeadingLine2"),
    subheading: text("processSubheading"),
    steps: [0, 1, 2, 3, 4, 5].map((i) => ({
      number: text(`processStepNumber_${i}`),
      title: text(`processStepTitle_${i}`),
      body: text(`processStepBody_${i}`),
    })),
  };
  // A heading with no steps would render an empty section; canonProcess
  // returns null for that, so it's never stored.
  const process = ownOrInherited(
    submittedProcess,
    inherited?.process,
    canonProcess,
    formData.get("resetProcess") === "on",
  );

  const submittedStats: StatsContent = {
    items: [0, 1, 2].map((i) => ({
      value: text(`statValue_${i}`),
      label: text(`statLabel_${i}`),
      description: text(`statDescription_${i}`),
    })),
  };
  const stats = ownOrInherited(
    submittedStats,
    inherited?.stats,
    canonStats,
    formData.get("resetStats") === "on",
  );

  const reviews = readReviewSelection(formData);

  if (!Object.keys(labels).length && !process && !stats && !reviews) return null;
  return {
    ...(Object.keys(labels).length ? { labels } : {}),
    ...(process ? { process } : {}),
    ...(stats ? { stats } : {}),
    ...(reviews ? { reviews } : {}),
  };
}

/**
 * The page's own review selection (ReviewPicker), or undefined to follow —
 * when reset, when nothing is ticked, or when the ticks match what the page
 * already inherits (posted by the picker as `reviews_inherited`).
 */
export function readReviewSelection(formData: FormData): string[] | undefined {
  if (!formData.has("reviews_present") || formData.get("resetReviews") === "on") return undefined;
  const picked = formData.getAll("review").map(String).filter(Boolean);
  if (!picked.length) return undefined;
  let inherited: unknown = [];
  try {
    inherited = JSON.parse(String(formData.get("reviews_inherited") || "[]"));
  } catch {
    inherited = [];
  }
  const same =
    Array.isArray(inherited) &&
    inherited.length === picked.length &&
    inherited.every((key, i) => key === picked[i]);
  return same ? undefined : picked;
}
