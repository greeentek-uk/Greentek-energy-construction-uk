import { getCurrentSiteConfig, getPageContent } from "@/lib/cms";
import PageQuoteHeroClient from "./PageQuoteHeroClient";
import type { FixedService } from "./HeroQuoteForm";

interface PageQuoteHeroProps {
  image: string;
  imageAlt: string;
  heading: string;
  headingHighlight?: string;
  body: string;
  secondaryBody?: string;
  /** Names this page in the enquiry email's "Came from" line. */
  source: string;
  /** Set on a page about one service, so the form doesn't ask which service. */
  fixedService?: FixedService;
}

/**
 * Server half of the shared hero: everything that isn't page-specific comes
 * from one place.
 *
 * The rating and the form's heading are read from the `home-hero` block rather
 * than duplicated per page type, so the Trustpilot figures stay editable in a
 * single panel screen and can't drift between the homepage and the 76 pages
 * that now show the same badge.
 */
export default async function PageQuoteHero({
  image,
  imageAlt,
  heading,
  headingHighlight,
  body,
  secondaryBody,
  source,
  fixedService,
}: PageQuoteHeroProps) {
  const [siteConfig, home] = await Promise.all([
    getCurrentSiteConfig(),
    getPageContent("home-hero"),
  ]);

  return (
    <PageQuoteHeroClient
      image={image}
      imageAlt={imageAlt}
      heading={heading}
      headingHighlight={headingHighlight}
      body={body}
      secondaryBody={secondaryBody}
      phone={siteConfig.phone}
      callLabel={home.ctaLabel}
      rating={{
        label: home.ratingLabel,
        score: home.ratingScore,
        url: home.ratingUrl,
      }}
      form={{
        heading: home.formHeading,
        subheading: home.formSubheading,
        source,
        fixedService,
      }}
    />
  );
}
