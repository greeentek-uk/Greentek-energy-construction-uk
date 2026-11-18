/**
 * The one line of a review worth showing in a short strip (the landing page's
 * reviews under the hero).
 *
 * Why not just the start of the review: real reviews don't lead with their
 * best line. Cut at 120 characters, the heat pump page's strip — the first
 * thing under the hero — read "…On the way we had one two problems from the…"
 * and "Part of the Ecobility company." (2026-11-04 full-page review). So the
 * review is split into sentences and the most positive one wins: praise words
 * count for it, words that report a problem count against it, and a sentence
 * that's too short to say anything is skipped. Ties go to the earlier one.
 *
 * Only ever a sentence the reviewer wrote, unchanged apart from a capital
 * first letter — never stitched together or reworded. The full review is on
 * the review wall further down the page.
 */

const PRAISE = [
  "fantastic",
  "brilliant",
  "excellent",
  "amazing",
  "great",
  "recommend",
  "professional",
  "know their stuff",
  "efficient",
  "quick",
  "grateful",
  "cheaper",
  "helpful",
  "friendly",
  "tidy",
  "clean",
  "happy",
  "pleased",
  "reliable",
  "short notice",
];

const PROBLEM = ["problem", "issue", "delay", "late", "unrepairable", "breaking down", "complain", "however", " but "];

const MIN_LENGTH = 20;

function score(sentence: string): number {
  const s = ` ${sentence.toLowerCase()} `;
  const count = (words: string[]) => words.filter((w) => s.includes(w)).length;
  return count(PRAISE) * 2 - count(PROBLEM) * 3;
}

export function reviewHighlight(quote: string, max = 140): string {
  const sentences = (quote.replace(/\s+/g, " ").trim().match(/[^.!?]+[.!?]*/g) ?? [])
    .map((s) => s.trim())
    .filter((s) => s.length >= MIN_LENGTH);
  if (!sentences.length) return clip(quote.trim(), max);

  let best = sentences[0];
  for (const sentence of sentences) if (score(sentence) > score(best)) best = sentence;
  return clip(best.charAt(0).toUpperCase() + best.slice(1), max);
}

function clip(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max).replace(/\s+\S*$/, "")}…`;
}
