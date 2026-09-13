/** Shared rich-content block shape, used by blog posts, services, pages, and locations for long-form body copy. */
export interface ContentBlock {
  type: "heading" | "paragraph" | "list" | "cta" | "image" | "quote";
  /**
   * Sanitized inline HTML for heading/paragraph/quote — bold, italic and links
   * only. Always passed through `sanitizeRichText()` on save, never trusted raw.
   */
  text?: string;
  /** List entries, each carrying the same sanitized inline HTML as `text`. */
  items?: string[];
  /** Heading level. Defaults to 2; 3 for a sub-heading inside a section. */
  level?: 2 | 3;
  /** Ordered rather than bulleted list. */
  ordered?: boolean;
  ctaText?: string;
  ctaLink?: string;
  /** Inline image placed within the body copy. */
  src?: string;
  alt?: string;
  caption?: string;
}
