"use client";

import type { ReactNode } from "react";
import type { Service } from "@/data/site";
import { LABEL_GROUPS, type PageSectionOverrides } from "@/data/pageSections";
import { saveServiceAction, createServiceAction } from "../_actions/content";
import ImageUploadField from "./ImageUploadField";
import ContentBlocksEditor from "./ContentBlocksEditor";
import FaqEditor from "./FaqEditor";
import { LabelFields, ProcessFields, StatsFields } from "./PageSectionsEditor";
import { ProblemSectionFields, PricingSectionFields } from "./ServiceSectionFields";
import { EditorSections, SaveBar } from "./editor/EditorLayout";

const FORM_CATEGORIES = [
  "solar_storage",
  "heating_boiler",
  "insulation",
  "refurb_extension",
  "commercial",
];

const input =
  "w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all";
const label = "block text-xs font-semibold text-white/70 mb-1";

const groups = LABEL_GROUPS.service;

/**
 * One /services/[slug] page, in the order the page renders it. Every field
 * name matches readServiceFields, so this is a layout change only.
 */
export default function ServiceForm({
  initial,
  projects = [],
  inherited,
  bodyExtras,
}: {
  initial?: Service;
  /** Every project, for the case study picker. */
  projects?: { slug: string; title: string; service: string }[];
  /** The shared process/stats this page shows until it has its own. */
  inherited?: PageSectionOverrides;
  /** Rendered above the body editor — internal link suggestions. */
  bodyExtras?: ReactNode;
}) {
  const isNew = !initial;
  const own = initial?.sections;
  const labels = (keys: (typeof groups)[keyof typeof groups], placeholders?: Record<string, string>) => (
    <LabelFields keys={keys} initial={own} placeholders={placeholders} />
  );

  return (
    <form action={isNew ? createServiceAction : saveServiceAction}>
      {!isNew && <input type="hidden" name="slug" value={initial.slug} />}

      <EditorSections
        sections={[
          {
            id: "basics",
            title: "Basics",
            description:
              "The service's name everywhere it's listed: menus, service cards, location pages and the quote form.",
            content: (
              <>
                <div className="grid sm:grid-cols-2 gap-4">
                  {isNew && (
                    <div>
                      <label className={label}>Slug (the URL — can&apos;t be changed later)</label>
                      <input name="slug" required placeholder="solar-pv-installations" className={input} />
                    </div>
                  )}
                  <div>
                    <label className={label}>Title</label>
                    <input name="title" defaultValue={initial?.title} required className={input} />
                  </div>
                  <div>
                    <label className={label}>Short name (used in headlines &amp; buttons)</label>
                    <input name="shortName" defaultValue={initial?.shortName} required className={input} />
                  </div>
                  <div>
                    <label className={label}>Quote form category</label>
                    <select name="formCategory" defaultValue={initial?.formCategory} className={input}>
                      {FORM_CATEGORIES.map((c) => (
                        <option key={c} value={c} className="text-black">
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={label}>
                    Description (on service cards, and the hero text unless the hero has its own)
                  </label>
                  <textarea name="description" defaultValue={initial?.description} rows={2} required className={input} />
                </div>
                <ImageUploadField
                  name="image"
                  label="Card image"
                  defaultValue={initial?.image}
                  required
                  altName="imageAlt"
                  altDefaultValue={initial?.imageAlt}
                  altFallback={initial?.title}
                />
              </>
            ),
          },
          {
            id: "hero",
            title: "Hero",
            description: "The top of the page: the H1, the text under it and the background photo.",
            content: (
              <>
                {labels(groups.hero, initial && { heroHeading: initial.title, heroBody: initial.description })}
                <ImageUploadField
                  name="heroImage"
                  label="Hero background (optional — falls back to the card image)"
                  defaultValue={initial?.heroImage}
                  altName="heroImageAlt"
                  altDefaultValue={initial?.heroImageAlt}
                  altFallback={initial?.imageAlt || initial?.title}
                />
              </>
            ),
          },
          {
            id: "problem",
            title: "Problem section",
            description:
              "Names the reader's problem before the page describes the fix. Also shown on this service's six location pages unless one has its own. Leave the heading blank to hide it.",
            content: (
              <>
                {labels(groups.problem)}
                <ProblemSectionFields initial={initial?.problem} help={null} />
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
                  <label className={label}>Highlights (one per line)</label>
                  <textarea
                    name="highlights"
                    defaultValue={initial?.highlights.join("\n")}
                    rows={4}
                    className={input}
                  />
                </div>
              </>
            ),
          },
          {
            id: "body",
            title: "Body copy",
            description: "Long-form copy under What's Included. Not repeated on the location pages.",
            content: (
              <>
                {bodyExtras}
                <ContentBlocksEditor initial={initial?.content} />
              </>
            ),
          },
          {
            id: "case-study",
            title: "Case study",
            content: (
              <>
                <div>
                  <label className={label}>Project</label>
                  <select name="caseStudyProject" defaultValue={initial?.caseStudyProject ?? ""} className={input}>
                    <option value="" className="text-black">
                      Automatic — this service&apos;s own project, if it has one
                    </option>
                    {projects.map((project) => (
                      <option key={project.slug} value={project.slug} className="text-black">
                        {project.title}
                        {initial && project.service === initial.slug ? " (this service)" : ""}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-white/50 mt-1">
                    With Automatic and no project linked to this service, no case study is shown.
                  </p>
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
                <StatsFields initial={own} inherited={inherited} />
                {labels(groups.testimonials)}
              </>
            ),
          },
          {
            id: "process",
            title: "Process",
            content: <ProcessFields initial={own} inherited={inherited} />,
          },
          {
            id: "accreditations",
            title: "Accreditations",
            description: "The logos come from Shared sections → Accreditations.",
            content: labels(groups.accreditations),
          },
          {
            id: "pricing",
            title: "What it costs",
            description:
              "What moves the price and what every quote includes — no figures, everything is quoted after a survey. Leave the heading blank to hide it.",
            content: (
              <>
                {labels(groups.pricing)}
                <PricingSectionFields initial={initial?.pricing} help={null} />
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
            id: "cta",
            title: "Final call to action",
            content: labels(
              groups.cta,
              initial && { ctaHeading: `Get a Free ${initial.shortName} Quote` },
            ),
          },
          {
            id: "seo",
            title: "SEO",
            description: "Search result title and description. Page SEO can override these.",
            content: (
              <>
                <div>
                  <label className={label}>Meta title (falls back to the title)</label>
                  <input name="metaTitle" defaultValue={initial?.metaTitle} className={input} />
                </div>
                <div>
                  <label className={label}>Meta description (falls back to the description)</label>
                  <textarea name="metaDescription" defaultValue={initial?.metaDescription} rows={2} className={input} />
                </div>
              </>
            ),
          },
        ]}
      />

      <SaveBar
        label={isNew ? "Create service" : "Save"}
        liveHref={initial ? `/services/${initial.slug}` : undefined}
      />
    </form>
  );
}
