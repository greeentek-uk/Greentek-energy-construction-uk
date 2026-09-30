/** Shared rich-content block shape, used by blog posts, services, pages, and locations for long-form body copy. */
export interface ContentBlock {
  type: "heading" | "paragraph" | "list" | "cta" | "image" | "quote" | "table";
  /**
   * Sanitized inline HTML for heading/paragraph/quote — bold, italic and links
   * only. Always passed through `sanitizeRichText()` on save, never trusted raw.
   */
  text?: string;
  /** List entries, each carrying the same sanitized inline HTML as `text`. */
  items?: string[];
  /**
   * Heading level, 1–6. Defaults to 2. The page title is already the H1, so a
   * body H1 is allowed (the editor asked for it) but warned against.
   */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Shorter wording for this heading in the blog's table of contents. */
  tocLabel?: string;
  /** Leave this heading out of the table of contents. */
  tocHidden?: boolean;
  /** Ordered rather than bulleted list. */
  ordered?: boolean;
  ctaText?: string;
  ctaLink?: string;
  /** Inline image placed within the body copy. */
  src?: string;
  alt?: string;
  /** Under an image, or the table's caption (announced by screen readers). */
  caption?: string;
  /**
   * Table cells, row by row, each the same sanitized inline HTML as `text`
   * (bold, italic, links). Rows are padded to one width when saved.
   */
  rows?: string[][];
  /** First row is the column headings (`<th>`). Defaults to true. */
  headerRow?: boolean;
}
