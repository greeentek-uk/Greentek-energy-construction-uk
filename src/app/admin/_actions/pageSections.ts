import {
  SECTION_LABEL_KEYS,
  type PageSectionOverrides,
  type SectionLabels,
} from "@/data/pageSections";
import type { ProcessContent, StatsContent } from "@/data/pageContent";

/**
 * Reads the per-page section overrides posted by PageSectionsEditor.
 *
 * Plain module, not a server action: it's called by the service, location and
 * location + service save actions.
 *
 * Everything is optional. A blank label, or an override whose tick box is off,
 * is dropped rather than stored empty, so the page falls back to the shared
 * wording and a half-filled form can't blank a section.
 */
export function readPageSections(formData: FormData): PageSectionOverrides | null {
  const text = (name: string) => String(formData.get(name) || "").trim();

  const labels: SectionLabels = {};
  for (const key of SECTION_LABEL_KEYS) {
    const value = text(`label_${key}`);
    if (value) labels[key] = value;
  }

  let process: ProcessContent | null = null;
  if (formData.get("overrideProcess") === "on") {
    const steps = [0, 1, 2, 3, 4, 5]
      .map((i) => ({
        number: text(`processStepNumber_${i}`) || String(i + 1).padStart(2, "0"),
        title: text(`processStepTitle_${i}`),
        body: text(`processStepBody_${i}`),
      }))
      .filter((step) => step.title);
    // A heading with no steps would render an empty section, so it needs both.
    if (steps.length) {
      process = {
        eyebrow: text("processEyebrow"),
        headingLine1: text("processHeadingLine1"),
        headingLine2: text("processHeadingLine2"),
        subheading: text("processSubheading"),
        steps,
      };
    }
  }

  let stats: StatsContent | null = null;
  if (formData.get("overrideStats") === "on") {
    const items = [0, 1, 2]
      .map((i) => ({
        value: text(`statValue_${i}`),
        label: text(`statLabel_${i}`),
        description: text(`statDescription_${i}`),
      }))
      .filter((item) => item.value && item.label);
    if (items.length) stats = { items };
  }

  if (!Object.keys(labels).length && !process && !stats) return null;
  return {
    ...(Object.keys(labels).length ? { labels } : {}),
    ...(process ? { process } : {}),
    ...(stats ? { stats } : {}),
  };
}
