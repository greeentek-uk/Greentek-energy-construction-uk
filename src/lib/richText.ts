import sanitizeHtml from "sanitize-html";

/**
 * Sanitizes admin-authored rich text.
 *
 * The panel is behind a login, but this still runs on every save: the output is
 * injected with `dangerouslySetInnerHTML`, so a pasted snippet carrying a
 * `<script>` or an `onclick` would execute for every visitor. The allowlist is
 * deliberately narrow — these are body paragraphs, not arbitrary markup.
 */
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ["b", "strong", "i", "em", "u", "a", "br", "span", "sub", "sup", "code"],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  // Relative hrefs are how internal links are written, so they must survive.
  allowProtocolRelative: false,
  transformTags: {
    // Normalise what contenteditable produces into semantic tags.
    div: "span",
    p: "span",
    a: (tagName, attribs) => {
      const href = attribs.href ?? "";
      const external = /^https?:\/\//i.test(href);
      return {
        tagName: "a",
        attribs: {
          ...attribs,
          // An external link opening in a new tab needs noopener, or the
          // destination gets a handle on this window via window.opener.
          ...(external ? { target: "_blank", rel: "noopener noreferrer" } : {}),
        },
      };
    },
  },
  // Strip styling entirely — the site's own CSS owns how body copy looks.
  allowedStyles: {},
};

export function sanitizeRichText(html: string): string {
  if (!html) return "";
  return sanitizeHtml(html, OPTIONS).trim();
}

/** Plain text for previews, counters and link-suggestion scanning. */
export function richTextToPlain(html: string): string {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** True when the value carries no visible text, so empty blocks can be dropped. */
export function isRichTextEmpty(html: string): boolean {
  return richTextToPlain(html).length === 0;
}
