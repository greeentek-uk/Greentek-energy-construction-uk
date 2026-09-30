import type { ContentBlock } from "./content";
import type { FaqItem } from "./pages";
import type { TocSettings } from "@/lib/toc";

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  date: string;
  category: string;
  /** The card image on /blog and category pages — portrait, 4:5. */
  coverImage: string;
  coverImageAlt: string;
  /** Landscape image at the top of the post itself. Falls back to `coverImage`. */
  heroImage?: string;
  heroImageAlt?: string;
  instagramUrl?: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  content: ContentBlock[];
  /** Post-specific FAQs, rendered and marked up as FAQPage schema. */
  faqs?: FaqItem[];
  /** Table-of-contents settings; absent = on, "In this article", H2–H3. */
  toc?: TocSettings;
}
