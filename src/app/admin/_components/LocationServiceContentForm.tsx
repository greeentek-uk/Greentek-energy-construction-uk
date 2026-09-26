"use client";

import type { LocationServiceContent } from "@/data/site";
import { saveLocationServiceContentAction } from "../_actions/locationServiceContent";
import ContentBlocksEditor from "./ContentBlocksEditor";
import FaqEditor from "./FaqEditor";
import ImageUploadField from "./ImageUploadField";
import PageSectionsEditor from "./PageSectionsEditor";
import { PricingSectionFields, ProblemSectionFields } from "./ServiceSectionFields";

const input =
  "w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all";
const label = "block text-xs font-semibold text-white/70 mb-1";

/**
 * Everything on one /locations/[loc]/[svc] page that can differ from the other
 * 65. Every field is optional and shows its fallback as the placeholder, so
 * it's clear what the page says today without anything filled in.
 */
export default function LocationServiceContentForm({
  location,
  service,
  projects,
  initial,
}: {
  location: { slug: string; name: string };
  service: { slug: string; title: string; shortName: string; description: string };
  /** Every project, for the case study picker. */
  projects: { slug: string; title: string; service: string }[];
  initial?: LocationServiceContent;
}) {
  const shortLower = service.shortName.toLowerCase();

  return (
    <form action={saveLocationServiceContentAction} className="space-y-4">
      <input type="hidden" name="locationSlug" value={location.slug} />
      <input type="hidden" name="serviceSlug" value={service.slug} />

      <p className="text-xs text-white/50">
        Every field is optional. Blank fields fall back to the {service.shortName} service or
        the {location.name} location (shown greyed out as the placeholder); fill one in and only
        this page changes.
      </p>

      <div className="space-y-4">
        <h3 className="font-bold text-white text-sm">SEO</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={label}>Meta Title</label>
            <input
              name="metaTitle"
              defaultValue={initial?.metaTitle}
              placeholder={`${service.shortName} in ${location.name}`}
              className={input}
            />
          </div>
          <div>
            <label className={label}>Meta Description</label>
            <input
              name="metaDescription"
              defaultValue={initial?.metaDescription}
              placeholder={`Professional ${shortLower} in ${location.name}…`}
              className={input}
            />
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 pt-4 space-y-4">
        <h3 className="font-bold text-white text-sm">Hero</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={label}>Heading (the page&apos;s H1)</label>
            <input
              name="heroHeading"
              defaultValue={initial?.heroHeading}
              placeholder={`${service.shortName} in`}
              className={input}
            />
          </div>
          <div>
            <label className={label}>Highlighted end of the heading</label>
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
          <label className={label}>Local note (replaces the generic &quot;covers this area&quot; sentence)</label>
          <textarea
            name="localNote"
            defaultValue={initial?.localNote}
            rows={2}
            className={input}
          />
        </div>
        <ImageUploadField
          name="heroImage"
          label="Hero background (optional — falls back to the service's)"
          defaultValue={initial?.heroImage}
          altName="heroImageAlt"
          altDefaultValue={initial?.heroImageAlt}
          altFallback={`${service.title} in ${location.name}`}
        />
      </div>

      <ProblemSectionFields
        initial={initial?.problem}
        overrideName="overrideProblem"
        help={
          <>
            Leave unticked to show the {service.shortName} service&apos;s problem section. Tick it
            and fill in the heading and at least one card to use this page&apos;s own.
          </>
        }
      />

      <div className="border-t border-white/10 pt-4 space-y-4">
        <h3 className="font-bold text-white text-sm">What&apos;s Included</h3>
        <div>
          <label className={label}>
            Highlights (one per line — falls back to the service&apos;s highlights)
          </label>
          <textarea
            name="highlights"
            defaultValue={initial?.highlights?.join("\n")}
            rows={4}
            className={input}
          />
        </div>
        <div>
          <label className={label}>Text above the nearby-area list</label>
          <input
            name="nearbyAreasText"
            defaultValue={initial?.nearbyAreasText}
            placeholder={`We also deliver ${shortLower} work near ${location.name} in:`}
            className={input}
          />
        </div>
      </div>

      <div className="border-t border-white/10 pt-4">
        <p className="text-xs text-white/50 mb-3">
          Body copy for this page only, shown under What&apos;s Included. The service page&apos;s
          own body is never repeated here — that would be the same text on seven URLs.
        </p>
        <ContentBlocksEditor initial={initial?.content} />
      </div>

      <div className="border-t border-white/10 pt-4">
        <label className={label}>Case Study Project</label>
        <select name="caseStudyProject" defaultValue={initial?.caseStudyProject ?? ""} className={input}>
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

      <PricingSectionFields
        initial={initial?.pricing}
        overrideName="overridePricing"
        help={
          <>
            Leave unticked to show the {service.shortName} service&apos;s section. No figures —
            everything is quoted after a survey.
          </>
        }
      />

      <div className="border-t border-white/10 pt-4 space-y-4">
        <h3 className="font-bold text-white text-sm">Links at the foot of the page</h3>
        <div>
          <label className={label}>&quot;Other services&quot; heading</label>
          <input
            name="otherServicesHeading"
            defaultValue={initial?.otherServicesHeading}
            placeholder={`Other Services in ${location.name}`}
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
      </div>

      <div className="border-t border-white/10 pt-4 space-y-4">
        <div>
          <h3 className="font-bold text-white text-sm">Card on the {location.name} page</h3>
          <p className="text-xs text-white/50 mt-1">
            How this page is listed under &quot;Services in {location.name}&quot;. The title is
            the text of the link to this page.
          </p>
        </div>
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
      </div>

      <FaqEditor initial={initial?.faqs} />

      <PageSectionsEditor
        initial={initial?.sections}
        kind="locationService"
        placeholders={{
          ctaHeading: `Get a Free ${service.shortName} Quote in ${location.name}`,
        }}
      />

      <button
        type="submit"
        className="rounded-lg bg-[#c5eb02] text-black text-sm font-semibold px-5 py-2.5 hover:bg-[#c5eb02]/80"
      >
        Save
      </button>
    </form>
  );
}
