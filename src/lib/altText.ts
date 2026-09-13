/**
 * Derives a readable alt text from an image URL.
 *
 * Cloudinary's auto-generated public IDs are random strings, so a filename is
 * only usable when someone named it deliberately. Anything that looks like a
 * generated ID is rejected and the caller falls back to the entity's title —
 * "ffwmajca9goirma3cidy" is worse than no suggestion at all.
 */
export function altFromFilename(url: string): string | null {
  if (!url) return null;

  const withoutQuery = url.split("?")[0];
  const filename = withoutQuery.split("/").pop() ?? "";
  const base = filename.replace(/\.[a-z0-9]+$/i, "");
  if (!base) return null;

  const words = base
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();

  if (words.length < 4) return null;
  if (looksLikeGeneratedId(words)) return null;

  return words.charAt(0).toUpperCase() + words.slice(1);
}

/**
 * Rejects Cloudinary's auto-generated public IDs and camera filenames.
 *
 * A deliberately named file almost always survives the separator split as
 * several words ("solar-panel-roof"). A single long token, digits mixed into
 * letters, or a run of consonants no English word has are all signs of an id,
 * and "Ffwmajca9goirma3cidy" as alt text is worse than none at all.
 */
function looksLikeGeneratedId(words: string): boolean {
  const singleToken = !words.includes(" ");

  if (/^v?\d+$/.test(words)) return true;
  if (singleToken && words.length > 14) return true;
  if (singleToken && /\d/.test(words)) return true;
  // DSC_0042, IMG 1234 and friends.
  if (/^(dsc|img|image|photo|screenshot|untitled)\b/i.test(words)) return true;
  if (/[bcdfghjklmnpqrstvwxz]{5,}/i.test(words)) return true;
  if (!/[aeiou]/i.test(words)) return true;

  return false;
}

/** Best-effort suggestion: a real filename if there is one, else the entity's title. */
export function suggestAlt(url: string, fallbackTitle?: string): string {
  return altFromFilename(url) ?? fallbackTitle ?? "";
}
