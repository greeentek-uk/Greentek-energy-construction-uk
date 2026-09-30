import { getPageContent } from "@/lib/cms";
import { selectReviews } from "@/data/pageSections";
import TestimonialsClient from "./TestimonialsClient";

/**
 * The reviews themselves stay shared — they're real customer quotes, and a
 * page shouldn't invent its own. Only the wording around them is per-page, so
 * 77 pages don't repeat one heading word for word.
 */
export default async function Testimonials({
  eyebrow,
  heading,
  subheading,
  reviews,
}: {
  eyebrow?: string;
  heading?: string;
  subheading?: string;
  /** The reviews this page shows, by reviewKey, in order; unset = all. */
  reviews?: string[];
} = {}) {
  const content = await getPageContent("testimonials");
  return (
    <TestimonialsClient
      {...content}
      items={selectReviews(content.items, reviews)}
      eyebrow={eyebrow?.trim() || content.eyebrow}
      heading={heading?.trim() || content.heading}
      subheading={subheading?.trim() || content.subheading}
    />
  );
}
