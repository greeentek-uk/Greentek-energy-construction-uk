"use client";

import type { LocationServiceContent, ProblemSection, ServicePricing } from "@/data/site";
import { LABEL_GROUPS, type PageSectionOverrides } from "@/data/pageSections";
import { saveLocationServiceContentAction } from "../_actions/locationServiceContent";
import ContentBlocksEditor from "./ContentBlocksEditor";
import FaqEditor from "./FaqEditor";
import ImageUploadField from "./ImageUploadField";
import { LabelFields, ProcessFields, StatsFields } from "./PageSectionsEditor";
import { PricingSectionFields, ProblemSectionFields } from "./ServiceSectionFields";
import { EditorSections, SaveBar } from "./editor/EditorLayout";
import ReviewPicker, { type PoolReview } from "./ReviewPicker";
import { otherServicesFor } from "@/lib/otherServices";

const input =
  "w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all";
const label = "block text-xs font-semibold text-white/70 mb-1";

const groups = LABEL_GROUPS.locationService;

/**
 * Everything on one /locations/[loc]/[svc] page that can differ from the other
 * 65, in the order the page renders it. Every field is optional; a blank one
 * shows its fallback (the service's, or the templated default) as the
 * placeholder, so it's clear what the page says today.
 */
export default function LocationServiceContentForm({
  location,
  service,
  projects,
  initial,
  inherited,
  reviewPool = [],
  allServices = [],
}: {
  /** Every service, in site order, for choosing the "Other services" cards. */
  allServices?: { slug: string; shortName: string }[];
  /** The shared reviews, for choosing which this page shows. */
  reviewPool?: PoolReview[];
  location: { slug: string; name: string };
  service: {
    slug: string;
    title: string;
    shortName: string;
    description: string;
    highlights: string[];
  };
  /** The service's sections, which this page shows until it has its own. */
  inherited: {
    problem?: ProblemSection | null;
    pricing?: ServicePricing | null;
    sections: PageSectionOverrides;
  };
  /** Every project, for the case study picker. */
  projects: { slug: string; title: string; service: string }[];
  initial?: LocationServiceContent;
}) {
  const shortLower = service.shortName.toLowerCase();
  // Which cards the page shows today, for the pre-ticks.
  const shownOthers = otherServicesFor(
    allServices.map((s) => s.slug),
    service.slug,
    initial?.otherServices,
  );
  // Where an un-customised section's copy comes from, in the inheritance notes.
  const fromService = `the ${service.shortName} service page`;
  const own = initial?.sections;
  const labels = (keys: (typeof groups)[keyof typeof groups], placeholders?: Record<string, string>) => (
    <LabelFields keys={keys} initial={own} inherited={inherited.sections} placeholders={placeholders} />
  );

  return (
    <form action={saveLocationServiceContentAction}>
      <input type="hidden" name="locationSlug" value={location.slug} />
      <input type="hidden" name="serviceSlug" value={service.slug} />

      <EditorSections
        sections={[
          {
            id: "hero",
            title: "Hero",
            description: "The H1, the text under it and the background photo.",
            content: (
              <>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={label}>Heading (the page&apos;s whole H1)</label>
                    <input
                      name="heroHeading"
                      defaultValue={initial?.heroHeading}
                      placeholder={`${service.shortName} in ${location.name}`}
                      className={input}
                    />
                  </div>
                  <div>
                    <label className={label}>
                      Words to show in green (copy them from the heading; blank = all white)
                    </label>
                    <input
                      name="heroHighlight"
                      defaultValue={initial?.heroHighlight}
                      placeholder={location.name}
                      className={input}
                    />
                  </div>
                </div>
                <div>
                  <label className={label}>Intro paragraph (replaces the service description)</label>
                  <textarea
                    name="intro"
                    defaultValue={initial?.intro}
                    placeholder={service.description}
                    rows={3}
                    className={input}
                  />
                </div>
                <div>
                  <label className={label}>
                    Local note (replaces the generic &quot;covers this area&quot; sentence)
                  </label>
                  <textarea name="localNote" defaultValue={initial?.localNote} rows={2} className={input} />
                </div>
                <ImageUploadField
                  name="heroImage"
                  label="Hero background (optional — falls back to the service's)"
                  defaultValue={initial?.heroImage}
                  altName="heroImageAlt"
                  altDefaultValue={initial?.heroImageAlt}
                  altFallback={`${service.title} in ${location.name}`}
                />
                {labels(groups.hero)}
              </>
            ),
          },
          {
            id: "finance",
            title: "Finance strip",
            description: "The strip under the hero. Provider logo and link come from Shared sections → Finance Banner.",
            content: labels(groups.finance),
          },
          {
            id: "problem",
            title: "Problem section",
            content: (
              <>
                {labels(groups.problem)}
                <ProblemSectionFields
                  initial={initial?.problem}
                  inherited={inherited.problem}
                  inheritedFrom={fromService}
                />
              </>
            ),
          },
          {
            id: "included",
            title: "What's included",
            content: (
              <>
                {labels(groups.included)}
                <div>
                  <label className={label}>
                    Highlights (one per line — blank uses the service&apos;s, shown greyed out)
                  </label>
                  <textarea
                    name="highlights"
                    defaultValue={initial?.highlights?.join("\n")}
                    placeholder={service.highlights.join("\n")}
                    rows={4}
                    className={input}
                  />
                </div>
                <div>
                  <label className={label}>Text above the nearby-towns list</label>
                  <input
                    name="nearbyAreasText"
                    defaultValue={initial?.nearbyAreasText}
                    placeholder={`We also deliver ${shortLower} work near ${location.name} in:`}
                    className={input}
                  />
                </div>
              </>
            ),
          },
          {
            id: "body",
            title: "Body copy",
            description:
              "This page's own long-form copy. The service page's body is never repeated here — that would be the same text on seven URLs.",
            content: <ContentBlocksEditor initial={initial?.content} />,
          },
          {
            id: "case-study",
            title: "Case study",
            content: (
              <>
                <div>
                  <label className={label}>Project</label>
                  <select
                    name="caseStudyProject"
                    defaultValue={initial?.caseStudyProject ?? ""}
                    className={input}
                  >
                    <option value="" className="text-black">
                      Same as the {service.shortName} service page
                    </option>
                    {projects.map((project) => (
                      <option key={project.slug} value={project.slug} className="text-black">
                        {project.title}
                        {project.service === service.slug ? " (this service)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
                {labels(groups.caseStudy)}
              </>
            ),
          },
          {
            id: "proof",
            title: "Stats & testimonials",
            content: (
              <>
                <StatsFields initial={own} inherited={inherited.sections} inheritedFrom={fromService} />
                {labels(groups.testimonials)}
                <ReviewPicker
                  pool={reviewPool}
                  own={own?.reviews}
                  inherited={inherited.sections.reviews}
                  inheritedFrom={
                    inherited.sections.reviews?.length ? `${fromService}'s choice` : "every review"
                  }
                />
              </>
            ),
          },
          {
            id: "process",
            title: "Process",
            content: (
              <ProcessFields initial={own} inherited={inherited.sections} inheritedFrom={fromService} />
            ),
          },
          {
            id: "accreditations",
            title: "Accreditations",
            content: labels(groups.accreditations),
          },
          {
            id: "pricing",
            title: "What it costs",
            content: (
              <>
                {labels(groups.pricing)}
                <PricingSectionFields
                  initial={initial?.pricing}
                  inherited={inherited.pricing}
                  inheritedFrom={fromService}
                  help="No figures — everything is quoted after a survey."
                />
              </>
            ),
          },
          {
            id: "faqs",
            title: "FAQs",
            description: "Also published as FAQ schema for search engines.",
            content: (
              <>
                {labels(groups.faq)}
                <FaqEditor initial={initial?.faqs} />
              </>
            ),
          },
          {
            id: "links",
            title: "Other services & links",
            content: (
              <>
                <div>
                  <label className={label}>&quot;Other services&quot; heading</label>
                  <input
                    name="otherServicesHeading"
                    defaultValue={initial?.otherServicesHeading}
                    placeholder={`Other Services in ${location.name}`}
                    className={input}
                  />
                </div>
                <div>
                  <p className={label}>
                    Services shown as cards (untick all to go back to the first four)
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {allServices
                      .filter((s) => s.slug !== service.slug)
                      .map((s) => (
                        <label key={s.slug} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80">
                          <input
                            type="checkbox"
                            name="otherService"
                            value={s.slug}
                            defaultChecked={shownOthers.includes(s.slug)}
                            className="accent-[#c5eb02]"
                          />
                          {s.shortName}
                        </label>
                      ))}
                  </div>
                </div>
                <div>
                  <label className={label}>Card link text</label>
                  <input
                    name="otherServicesLinkLabel"
                    defaultValue={initial?.otherServicesLinkLabel}
                    placeholder="Learn More →"
                    className={input}
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={label}>Link back to the location page</label>
                    <input
                      name="locationLinkLabel"
                      defaultValue={initial?.locationLinkLabel}
                      placeholder={`← All services in ${location.name}`}
                      className={input}
                    />
                  </div>
                  <div>
                    <label className={label}>Link to the service page</label>
                    <input
                      name="serviceLinkLabel"
                      defaultValue={initial?.serviceLinkLabel}
                      placeholder={`More about ${service.title} →`}
                      className={input}
                    />
                  </div>
                </div>
              </>
            ),
          },
          {
            id: "cta",
            title: "Final call to action",
            content: labels(groups.cta, {
              ctaHeading: `Get a Free ${service.shortName} Quote in ${location.name}`,
            }),
          },
          {
            id: "card",
            title: `Card on the ${location.name} page`,
            description: `How this page is listed under "Services in ${location.name}". The title is the text of the link to this page.`,
            content: (
              <>
                <div>
                  <label className={label}>Card title</label>
                  <input
                    name="cardTitle"
                    defaultValue={initial?.cardTitle}
                    placeholder={`${service.shortName} in ${location.name}`}
                    className={input}
                  />
                </div>
                <div>
                  <label className={label}>Card text</label>
                  <textarea
                    name="cardText"
                    defaultValue={initial?.cardText}
                    placeholder={service.description}
                    rows={2}
                    className={input}
                  />
                </div>
              </>
            ),
          },
          {
            id: "seo",
            title: "SEO",
            description: "Search result title and description. Page SEO can override these.",
            content: (
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={label}>Meta title</label>
                  <input
                    name="metaTitle"
                    defaultValue={initial?.metaTitle}
                    placeholder={`${service.shortName} in ${location.name}`}
                    className={input}
                  />
                </div>
                <div>
                  <label className={label}>Meta description</label>
                  <input
                    name="metaDescription"
                    defaultValue={initial?.metaDescription}
                    placeholder={`Professional ${shortLower} in ${location.name}…`}
                    className={input}
                  />
                </div>
              </div>
            ),
          },
        ]}
      />

      <SaveBar liveHref={`/locations/${location.slug}/${service.slug}`} />
    </form>
  );
}
