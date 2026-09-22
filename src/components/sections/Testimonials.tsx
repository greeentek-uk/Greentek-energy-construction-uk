import { getPageContent } from "@/lib/cms";
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
}: {
  eyebrow?: string;
  heading?: string;
  subheading?: string;
} = {}) {
  const content = await getPageContent("testimonials");
  return (
    <TestimonialsClient
      {...content}
      eyebrow={eyebrow?.trim() || content.eyebrow}
      heading={heading?.trim() || content.heading}
      subheading={subheading?.trim() || content.subheading}
    />
  );
}
