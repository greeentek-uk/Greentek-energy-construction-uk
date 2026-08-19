import type { ContentBlock } from "./content";

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
}
