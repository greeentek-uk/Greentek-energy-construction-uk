import type { ContentBlock } from "./content";
import type { FaqItem } from "./pages";

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  date: string;
  category: string;
  coverImage: string;
  coverImageAlt: string;
  instagramUrl?: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  content: ContentBlock[];
  /** Post-specific FAQs, rendered and marked up as FAQPage schema. */
  faqs?: FaqItem[];
}
