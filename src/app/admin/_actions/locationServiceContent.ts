"use server";

import { redirect } from "next/navigation";
import { getLastSyncError, revalidate } from "@/lib/revalidate";
import {
  deleteLocationServiceContent,
  replaceLocationServiceContent,
} from "@/lib/db/locationServiceContent";
import type { LocationServiceContent } from "@/data/site";
import { parseContentBlocks } from "./contentBlocks";
import { parseFaqs } from "./faqs";
import { readPageSections } from "./pageSections";
import { readPricingSection, readProblemSection } from "./serviceSections";
import { canonPricing, canonProblem, ownOrInherited } from "./inheritance";
import { getServiceBySlug, getServices } from "@/lib/db/services";
import { defaultOtherServices } from "@/lib/otherServices";
import { getPageContent } from "@/lib/cms";

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
  const back = `/admin/locations/${locationSlug}/services/${serviceSlug}`;

  if (!locationSlug || !serviceSlug) {
    redirect(`${back}?error=${encodeURIComponent("Missing location or service")}`);
  }

  const highlights = splitLines(String(formData.get("highlights") || ""));
  const faqs = parseFaqs(formData);
  const content = parseContentBlocks(formData);
  // What the page shows when it has no section of its own: the editor
  // pre-fills these, so a section still equal to them wasn't edited and the
  // page keeps following the service (inheritance.ts).
  const [service, sharedProcess, sharedStats] = await Promise.all([
    getServiceBySlug(serviceSlug),
    getPageContent("process"),
    getPageContent("stats"),
  ]);
  const problem = ownOrInherited(
    readProblemSection(formData),
    service?.problem,
    canonProblem,
    formData.get("resetProblem") === "on",
  );
  const pricing = ownOrInherited(
    readPricingSection(formData),
    service?.pricing,
    canonPricing,
    formData.get("resetPricing") === "on",
  );
  // The cards' services: stored only when the ticks differ from the default
  // four, so an untouched page keeps following the default if services change.
  const pickedOthers = formData.getAll("otherService").map(String).filter(Boolean);
  const defaultOthers = defaultOtherServices(
    (await getServices()).map((s) => s.slug),
    serviceSlug,
  );
  const otherServices =
    pickedOthers.length && pickedOthers.join() !== defaultOthers.join() ? pickedOthers : null;
  const sections = readPageSections(formData, {
    process: service?.sections?.process ?? sharedProcess,
    stats: service?.sections?.stats ?? sharedStats,
  });

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
    otherServicesLinkLabel: text("otherServicesLinkLabel"),
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
    ...(otherServices ? { otherServices } : {}),
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

  // The save itself worked, but if the live site wasn't told, the editor
  // would see "Saved" and a page that never changes — say so instead.
  const syncError = getLastSyncError();
  if (syncError) {
    redirect(
      `${back}?error=${encodeURIComponent(
        `Saved, but the live site wasn't refreshed (${syncError}). Use "Refresh live site" on the dashboard.`,
      )}`,
    );
  }
  redirect(`${back}?saved=1`);
}
