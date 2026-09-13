import type { ContentBlock } from "@/data/content";

export interface LinkTarget {
  /** The phrase to look for in the copy. */
  phrase: string;
  href: string;
  label: string;
  kind: "Service" | "Location" | "Blog post";
}

export interface LinkSuggestion {
  phrase: string;
  href: string;
  label: string;
  kind: LinkTarget["kind"];
  /** The sentence it appears in, so the editor can see the context. */
  context: string;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Finds phrases in the content that match another page on the site.
 *
 * Suggestion-only by design: it reports where a link *could* go and leaves the
 * decision to a person. Auto-inserting links is how you end up with the same
 * anchor repeated eight times in one article, which reads as spam to both
 * readers and search engines. Anything already linked is filtered out, so the
 * list shrinks as the copy is worked through.
 */
export function suggestInternalLinks(
  blocks: ContentBlock[] | undefined,
  targets: LinkTarget[],
  currentPath?: string,
): LinkSuggestion[] {
  if (!blocks?.length) return [];

  const html = blocks
    .flatMap((block) => [block.text ?? "", ...(block.items ?? [])])
    .filter(Boolean)
    .join("\n");

  if (!html.trim()) return [];

  // Hrefs already present in the copy, so a page that's linked once isn't
  // suggested again — repeating the same anchor is what makes copy read as spam.
  const linked = new Set(
    [...html.matchAll(/href=["']([^"']+)["']/gi)].map((m) => m[1]),
  );

  // Drop the anchor text of existing links too, so their wording can't be
  // re-suggested pointing somewhere else.
  const text = html
    .replace(/<a\b[^>]*>[\s\S]*?<\/a>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ");

  const seen = new Set<string>();
  const suggestions: LinkSuggestion[] = [];

  // Longest phrases first, so "solar PV installation" wins over "solar".
  const ordered = [...targets].sort((a, b) => b.phrase.length - a.phrase.length);

  for (const target of ordered) {
    if (!target.phrase.trim() || target.href === currentPath) continue;
    if (seen.has(target.href) || linked.has(target.href)) continue;

    const pattern = new RegExp(`\\b${escapeRegExp(target.phrase)}\\b`, "i");
    const match = pattern.exec(text);
    if (!match) continue;

    const sentenceStart = Math.max(0, text.lastIndexOf(".", match.index) + 1);
    const sentenceEnd = text.indexOf(".", match.index + match[0].length);
    const context = text
      .slice(sentenceStart, sentenceEnd === -1 ? match.index + 120 : sentenceEnd + 1)
      .trim();

    seen.add(target.href);
    suggestions.push({
      phrase: match[0],
      href: target.href,
      label: target.label,
      kind: target.kind,
      context,
    });
  }

  return suggestions;
}
