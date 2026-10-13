/**
 * What a hand-typed URL slug may be: lowercase words joined by single hyphens.
 * Shared by the blog form (browser check, as an `<input pattern>`) and its save
 * action (server check), so the two can't disagree.
 *
 * Flagged rather than silently cleaned, by the owner's decision: a slug typed
 * as "/my-post" was once stored as-is, so the post 404'd both on the site and
 * in the panel. Auto-fixing it would hide surprises (a pasted full URL becomes
 * a long junk slug), so the editor is told and corrects it themselves.
 */
export const SLUG_PATTERN = "[a-z0-9]+(?:-[a-z0-9]+)*";

export const SLUG_HINT =
  'Lowercase letters, numbers and hyphens only — no slashes, spaces or full URLs. e.g. "loft-conversion-cost"';

export function isValidSlug(slug: string): boolean {
  return new RegExp(`^${SLUG_PATTERN}$`).test(slug);
}
