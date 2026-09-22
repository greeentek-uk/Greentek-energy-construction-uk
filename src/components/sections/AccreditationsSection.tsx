import { getPageContent } from "@/lib/cms";
import AccreditationStrip from "./AccreditationStrip";

/**
 * The standalone accreditations block on the service, location and
 * location + service pages.
 *
 * This was a static four-column grid. It now renders the same scrolling strip
 * the homepage uses, so the logos are presented identically wherever they
 * appear. The heading still comes from this block's own `heading` field, which
 * is the one the panel already exposes for this section.
 */
export default async function AccreditationsSection({ heading }: { heading?: string } = {}) {
  const content = await getPageContent("accreditations");

  return (
    <section className="py-10 lg:py-16" aria-labelledby="accreditations-heading">
      <div className="site-container">
        {/* A real h2 here: unlike the homepage, this strip is the whole
            section, so it needs to appear when navigating by heading. */}
        <AccreditationStrip
          heading={heading?.trim() || content.heading}
          logos={content.logos}
          headingAs="h2"
          headingId="accreditations-heading"
        />
      </div>
    </section>
  );
}
