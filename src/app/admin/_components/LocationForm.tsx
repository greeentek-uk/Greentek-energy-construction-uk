"use client";

import type { ReactNode } from "react";
import type { Location } from "@/data/site";
import { LABEL_GROUPS, type PageSectionOverrides } from "@/data/pageSections";
import { saveLocationAction, createLocationAction } from "../_actions/content";
import ImageUploadField from "./ImageUploadField";
import ContentBlocksEditor from "./ContentBlocksEditor";
import FaqEditor from "./FaqEditor";
import { LabelFields, ProcessFields, StatsFields } from "./PageSectionsEditor";
import { EditorSections, SaveBar } from "./editor/EditorLayout";

const input =
  "w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all";
const label = "block text-xs font-semibold text-white/70 mb-1";

const groups = LABEL_GROUPS.location;

/**
 * One /locations/[slug] page, in the order the page renders it. Every field
 * name matches readLocationFields, so this is a layout change only.
 */
export default function LocationForm({
  initial,
  projects = [],
  inherited,
  bodyExtras,
  servicePages,
}: {
  initial?: Location;
  /** Every project, for the case study picker. */
  projects?: { slug: string; title: string }[];
  /** The shared process/stats this page shows until it has its own. */
  inherited?: PageSectionOverrides;
  /** Rendered above the body editor — internal link suggestions. */
  bodyExtras?: ReactNode;
  /** Links to this area's location + service pages, where each card is edited. */
  servicePages?: ReactNode;
}) {
  const isNew = !initial;
  const own = initial?.sections;
  const name = initial?.name ?? "this area";
  const labels = (
    keys: (typeof groups)[keyof typeof groups],
    placeholders?: Record<string, string>,
  ) => <LabelFields keys={keys} initial={own} placeholders={placeholders} />;

  return (
    <form action={isNew ? createLocationAction : saveLocationAction}>
      {!isNew && <input type="hidden" name="slug" value={initial.slug} />}

      <EditorSections
        sections={[
          {
            id: "basics",
            title: "Basics",
            description: "How this area is named and listed on the Locations page and in menus.",
            content: (
              <>
                <div className="grid sm:grid-cols-2 gap-4">
                  {isNew && (
                    <div>
                      <label className={label}>Slug (the URL — can&apos;t be changed later)</label>
                      <input name="slug" required placeholder="wolverhampton" className={input} />
                    </div>
                  )}
                  <div>
                    <label className={label}>Name</label>
                    <input name="name" defaultValue={initial?.name} required className={input} />
                  </div>
                  <div>
                    <label className={label}>Region</label>
                    <input name="region" defaultValue={initial?.region} required className={input} />
                  </div>
                  <div>
                    <label className={label}>Tagline</label>
                    <input name="tagline" defaultValue={initial?.tagline} required className={input} />
                  </div>
                </div>
                <div>
                  <label className={label}>
                    Blurb (on the Locations page card, and the hero text unless the hero has its own)
                  </label>
                  <textarea name="blurb" defaultValue={initial?.blurb} rows={3} required className={input} />
                </div>
                <ImageUploadField
                  name="image"
                  label="Card image"
                  defaultValue={initial?.image}
                  required
                  altName="imageAlt"
                  altDefaultValue={initial?.imageAlt}
                  altFallback={initial?.name}
                />
                <label className="flex items-center gap-2 text-sm text-white/70">
                  <input
                    type="checkbox"
                    name="isHomeBase"
                    defaultChecked={initial?.isHomeBase}
                    className="rounded border-white/15 accent-[#c5eb02]"
                  />
                  This is the home base location
                </label>
              </>
            ),
          },
          {
            id: "hero",
            title: "Hero",
            content: (
              <>
                {labels(
                  groups.hero,
                  initial && {
                    heroHeading: `Renewable Energy & Construction in ${initial.name}`,
                    heroHighlight: initial.name,
                    heroBody: initial.blurb,
                  },
                )}
                <ImageUploadField
                  name="heroImage"
                  label="Hero background (optional — falls back to the card image)"
                  defaultValue={initial?.heroImage}
                  altName="heroImageAlt"
                  altDefaultValue={initial?.heroImageAlt}
                  altFallback={initial?.imageAlt || initial?.name}
                />
              </>
            ),
          },
          {
            id: "services",
            title: `Services in ${name}`,
            description:
              "One card per service, each linking to that service's page for this area. A card's title and text are edited on that page.",
            content: (
              <>
                {labels(groups.services, initial && { servicesHeading: `Services in ${initial.name}` })}
                {servicePages}
              </>
            ),
          },
          {
            id: "areas",
            title: "Areas covered",
            content: (
              <>
                {labels(groups.areas, initial && { areasHeading: `Areas we cover around ${initial.name}` })}
                <div>
                  <label className={label}>Nearby towns (comma-separated)</label>
                  <input name="nearbyAreas" defaultValue={initial?.nearbyAreas.join(", ")} className={input} />
                </div>
              </>
            ),
          },
          {
            id: "body",
            title: "Body copy",
            content: (
              <>
                {bodyExtras}
                <ContentBlocksEditor initial={initial?.content} />
              </>
            ),
          },
          {
            id: "stats",
            title: "Stats",
            content: <StatsFields initial={own} inherited={inherited} />,
          },
          {
            id: "case-study",
            title: "Case study",
            description:
              "Projects aren't tied to a place, so nothing is picked automatically — choose a job from this area, or leave it off.",
            content: (
              <>
                <div>
                  <label className={label}>Project</label>
                  <select name="caseStudyProject" defaultValue={initial?.caseStudyProject ?? ""} className={input}>
                    <option value="" className="text-black">
                      No case study
                    </option>
                    {projects.map((project) => (
                      <option key={project.slug} value={project.slug} className="text-black">
                        {project.title}
                      </option>
                    ))}
                  </select>
                </div>
                {labels(groups.caseStudy)}
              </>
            ),
          },
          {
            id: "testimonials",
            title: "Testimonials",
            description: "The reviews themselves come from Shared sections → Testimonials.",
            content: labels(groups.testimonials),
          },
          {
            id: "process",
            title: "Process",
            content: <ProcessFields initial={own} inherited={inherited} />,
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
            id: "cta",
            title: "Final call to action",
            content: labels(groups.cta, initial && { ctaHeading: `Get a Free Quote in ${initial.name}` }),
          },
          {
            id: "accreditations",
            title: "Accreditations",
            content: labels(groups.accreditations),
          },
          {
            id: "seo",
            title: "SEO",
            description: "Search result title and description. Page SEO can override these.",
            content: (
              <>
                <div>
                  <label className={label}>Meta title (falls back to the default title)</label>
                  <input name="metaTitle" defaultValue={initial?.metaTitle} className={input} />
                </div>
                <div>
                  <label className={label}>Meta description</label>
                  <textarea name="metaDescription" defaultValue={initial?.metaDescription} rows={2} className={input} />
                </div>
              </>
            ),
          },
        ]}
      />

      <SaveBar
        label={isNew ? "Create location" : "Save"}
        liveHref={initial ? `/locations/${initial.slug}` : undefined}
      />
    </form>
  );
}
