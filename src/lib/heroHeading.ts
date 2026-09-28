/**
 * Splits a page's H1 around the words the editor asked to show in brand green.
 *
 * The H1 used to be two fields, a heading and a "highlight" that was always
 * *appended* after it — so typing a whole heading into the first field still
 * got the location name tacked onto the end. Now the heading is the entire H1,
 * and the highlight is a phrase *inside* it. Blank, or not found in the
 * heading, means no highlight: the whole heading renders plain white rather
 * than guessing which words were meant.
 *
 * The first match wins, and case is ignored so "cardiff" still finds "Cardiff";
 * the heading's own casing is what's shown.
 */
export interface HeadingParts {
  before: string;
  highlight: string;
  after: string;
}

export function splitHeading(heading: string, highlight?: string): HeadingParts | null {
  const phrase = highlight?.trim();
  if (!phrase) return null;
  const at = heading.toLowerCase().indexOf(phrase.toLowerCase());
  if (at === -1) return null;
  return {
    before: heading.slice(0, at),
    highlight: heading.slice(at, at + phrase.length),
    after: heading.slice(at + phrase.length),
  };
}
