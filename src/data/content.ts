/** Shared rich-content block shape, used by blog posts, services, and locations for long-form body copy. */
export interface ContentBlock {
  type: "heading" | "paragraph" | "list" | "cta";
  text?: string;
  items?: string[];
  ctaText?: string;
  ctaLink?: string;
}
