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
  content: {
    type: "heading" | "paragraph" | "list" | "cta";
    text?: string;
    items?: string[];
    ctaText?: string;
    ctaLink?: string;
  }[];
}
