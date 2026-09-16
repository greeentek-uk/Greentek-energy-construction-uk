/**
 * Where a review came from.
 *
 * Shared between the public card and the admin form so the two can't drift —
 * the id is what's stored, and a value the renderer doesn't recognise simply
 * shows no badge rather than breaking the card.
 */
export type ReviewSourceId = "trustpilot" | "google" | "facebook" | "checkatrade" | "";

export interface ReviewSource {
  id: Exclude<ReviewSourceId, "">;
  label: string;
  /** Brand colour, used for the mark next to the name. */
  color: string;
}

export const REVIEW_SOURCES: ReviewSource[] = [
  { id: "trustpilot", label: "Trustpilot", color: "#00b67a" },
  { id: "google", label: "Google", color: "#4285f4" },
  { id: "facebook", label: "Facebook", color: "#1877f2" },
  { id: "checkatrade", label: "Checkatrade", color: "#0076bf" },
];

export function getReviewSource(id: string | undefined): ReviewSource | null {
  if (!id) return null;
  return REVIEW_SOURCES.find((source) => source.id === id) ?? null;
}

/** Dropdown options for the admin form, with a "not specified" entry. */
export const REVIEW_SOURCE_OPTIONS = [
  { value: "", label: "No source shown" },
  ...REVIEW_SOURCES.map((source) => ({ value: source.id, label: source.label })),
];

/**
 * Up to two initials from a name — "Amjid H." becomes "AH".
 *
 * Used when a reviewer has no photo, which is the normal case for reviews
 * imported from Google or Trustpilot.
 */
export function initialsFrom(name: string): string {
  const words = name
    .replace(/[^\p{L}\s'-]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

/**
 * A stable colour per name, so two reviewers without photos don't end up as
 * identical grey circles. Hue only — saturation and lightness are fixed so
 * every avatar keeps white text readable.
 */
export function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) % 360;
  }
  return `hsl(${hash}, 42%, 38%)`;
}
