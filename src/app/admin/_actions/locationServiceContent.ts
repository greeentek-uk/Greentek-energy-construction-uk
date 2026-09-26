"use server";

import { redirect } from "next/navigation";
import { revalidate } from "@/lib/revalidate";
import {
  deleteLocationServiceContent,
  replaceLocationServiceContent,
} from "@/lib/db/locationServiceContent";
import type { LocationServiceContent } from "@/data/site";
import { parseContentBlocks } from "./contentBlocks";
import { parseFaqs } from "./faqs";
import { readPageSections } from "./pageSections";
import { readPricingSection, readProblemSection } from "./serviceSections";

function splitLines(value: string): string[] {
  return value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Every field is an optional override of what the location + service page
 * would otherwise render from its service and location. Blanks are dropped, not
 * stored empty, so the page falls back field by field.
 *
 * The form always posts every field, so the document is replaced rather than
 * merged — otherwise clearing a field here would leave the old copy live.
 */
export async function saveLocationServiceContentAction(formData: FormData): Promise<void> {
  const text = (name: string) => String(formData.get(name) || "").trim();
  const locationSlug = text("locationSlug");
  const serviceSlug = text("serviceSlug");
  const back = `/admin/locations/${locationSlug}/service-content`;

  if (!locationSlug || !serviceSlug) {
    redirect(`${back}?error=${encodeURIComponent("Missing location or service")}`);
  }

  const highlights = splitLines(String(formData.get("highlights") || ""));
  const faqs = parseFaqs(formData);
  const content = parseContentBlocks(formData);
  // Only when ticked: an unticked section means "use the service's".
  const problem = formData.get("overrideProblem") === "on" ? readProblemSection(formData) : null;
  const pricing = formData.get("overridePricing") === "on" ? readPricingSection(formData) : null;
  const sections = readPageSections(formData);

  const optional = {
    metaTitle: text("metaTitle"),
    metaDescription: text("metaDescription"),
    intro: text("intro"),
    localNote: text("localNote"),
    heroHeading: text("heroHeading"),
    heroHighlight: text("heroHighlight"),
    heroImage: text("heroImage"),
    // Alt without its image would describe the service's photo, not this one.
    heroImageAlt: text("heroImage") ? text("heroImageAlt") : "",
    caseStudyProject: text("caseStudyProject"),
    nearbyAreasText: text("nearbyAreasText"),
    otherServicesHeading: text("otherServicesHeading"),
    locationLinkLabel: text("locationLinkLabel"),
    serviceLinkLabel: text("serviceLinkLabel"),
    cardTitle: text("cardTitle"),
    cardText: text("cardText"),
  };

  const entry: LocationServiceContent = {
    locationSlug,
    serviceSlug,
    ...Object.fromEntries(Object.entries(optional).filter(([, v]) => v)),
    ...(highlights.length ? { highlights } : {}),
    ...(faqs.length ? { faqs } : {}),
    ...(content.length ? { content } : {}),
    ...(problem ? { problem } : {}),
    ...(pricing ? { pricing } : {}),
    ...(sections ? { sections } : {}),
  };

  try {
    // Nothing left to override: remove the row so the page is back on its
    // defaults and the list stops calling it "Customised".
    if (Object.keys(entry).length === 2) {
      await deleteLocationServiceContent(locationSlug, serviceSlug);
    } else {
      await replaceLocationServiceContent(entry);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    redirect(`${back}?error=${encodeURIComponent(message)}`);
  }

  await revalidate(`/locations/${locationSlug}/${serviceSlug}`);
  // The location page lists this page as a card, whose title/text live here.
  await revalidate(`/locations/${locationSlug}`);
  await revalidate("/sitemap.xml");
  redirect(`${back}?saved=1`);
}
