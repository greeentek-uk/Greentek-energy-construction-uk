"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { saveBlockDraft, publishAllDirtyBlocks } from "@/lib/db/pageContent";
import { PAGE_CONTENT_KEYS, type PageContentKey, type PageContentMap } from "@/data/pageContent";

function str(formData: FormData, key: string): string {
  return String(formData.get(key) || "").trim();
}

function items<T>(formData: FormData, key: string): T[] {
  return formData.getAll(key).map((v) => JSON.parse(String(v)) as T);
}

function lines(formData: FormData, key: string): string[] {
  return str(formData, key)
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseBlockFields(key: PageContentKey, formData: FormData): PageContentMap[PageContentKey] {
  switch (key) {
    case "home-hero":
      return {
        trustBadgeSuffix: str(formData, "trustBadgeSuffix"),
        headingLine1: str(formData, "headingLine1"),
        headingLine2: str(formData, "headingLine2"),
        body: str(formData, "body"),
        ctaLabel: str(formData, "ctaLabel"),
      };
    case "why-us":
      return {
        eyebrow: str(formData, "eyebrow"),
        headingLine1: str(formData, "headingLine1"),
        headingLine2: str(formData, "headingLine2"),
        subheading: str(formData, "subheading"),
        items: items(formData, "items"),
      } as PageContentMap["why-us"];
    case "home-why-choose-us":
      return {
        eyebrow: str(formData, "eyebrow"),
        heading: str(formData, "heading"),
        subheading: str(formData, "subheading"),
        items: items(formData, "items"),
      } as PageContentMap["home-why-choose-us"];
    case "testimonials":
      return {
        eyebrow: str(formData, "eyebrow"),
        heading: str(formData, "heading"),
        subheading: str(formData, "subheading"),
        items: items(formData, "items"),
      } as PageContentMap["testimonials"];
    case "faq":
      return {
        eyebrow: str(formData, "eyebrow"),
        heading: str(formData, "heading"),
        items: items(formData, "items"),
      } as PageContentMap["faq"];
    case "areas":
      return {
        eyebrow: str(formData, "eyebrow"),
        heading: str(formData, "heading"),
        subheading: str(formData, "subheading"),
        largeArea: {
          name: str(formData, "largeArea_name"),
          stat: str(formData, "largeArea_stat"),
          note: str(formData, "largeArea_note"),
          image: str(formData, "largeArea_image"),
          path: str(formData, "largeArea_path"),
        },
        smallAreas: items(formData, "smallAreas"),
        tickerItems: lines(formData, "tickerItems"),
        tickerLabel: str(formData, "tickerLabel"),
        ctaLabel: str(formData, "ctaLabel"),
      } as PageContentMap["areas"];
    case "core-pillars":
      return {
        heading: str(formData, "heading"),
        intro: str(formData, "intro"),
        pillars: items(formData, "pillars"),
      } as PageContentMap["core-pillars"];
    case "verticals":
      return {
        eyebrow: str(formData, "eyebrow"),
        heading: str(formData, "heading"),
        subheading: str(formData, "subheading"),
        groups: [0, 1].map((gIdx) => ({
          name: str(formData, `group${gIdx}_name`),
          intro: str(formData, `group${gIdx}_intro`),
          href: str(formData, `group${gIdx}_href`),
          services: items(formData, `group${gIdx}_services`),
        })),
      } as PageContentMap["verticals"];
    case "accreditations":
      return {
        heading: str(formData, "heading"),
        logos: items(formData, "logos"),
      } as PageContentMap["accreditations"];
    case "process":
      return {
        eyebrow: str(formData, "eyebrow"),
        headingLine1: str(formData, "headingLine1"),
        headingLine2: str(formData, "headingLine2"),
        subheading: str(formData, "subheading"),
        steps: items(formData, "steps"),
      } as PageContentMap["process"];
    case "brands":
      return {
        eyebrow: str(formData, "eyebrow"),
        heading: str(formData, "heading"),
        subheading: str(formData, "subheading"),
        logos: items(formData, "logos"),
      } as PageContentMap["brands"];
    case "stats":
      return {
        items: items(formData, "items"),
      } as PageContentMap["stats"];
    case "about-us-slide":
      return {
        eyebrow: str(formData, "eyebrow"),
        heading: str(formData, "heading"),
        body: str(formData, "body"),
      };
    case "projects-preview":
      return {
        eyebrow: str(formData, "eyebrow"),
        heading: str(formData, "heading"),
        subheading: str(formData, "subheading"),
        beforeBadgeLabel: str(formData, "beforeBadgeLabel"),
        ctaLabel: str(formData, "ctaLabel"),
      };
    case "services-page-header":
    case "locations-page-header":
    case "projects-page-header":
      return {
        headingPrefix: str(formData, "headingPrefix"),
        headingHighlight: str(formData, "headingHighlight"),
        subheading: str(formData, "subheading"),
      };
    case "about-page":
      return {
        heroHeadingLine1: str(formData, "heroHeadingLine1"),
        heroHeadingHighlight: str(formData, "heroHeadingHighlight"),
        heroSubheading: str(formData, "heroSubheading"),
        journeyHeading: str(formData, "journeyHeading"),
        journeyParagraphs: lines(formData, "journeyParagraphs"),
      };
  }
}

export async function saveBlockDraftAction(formData: FormData): Promise<void> {
  const blockKey = str(formData, "blockKey") as PageContentKey;

  if (!PAGE_CONTENT_KEYS.includes(blockKey)) {
    redirect(`/admin/page-content?error=${encodeURIComponent("Unknown content block")}`);
  }

  const data = parseBlockFields(blockKey, formData);

  try {
    await saveBlockDraft(blockKey, data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    redirect(`/admin/page-content/${blockKey}?error=${encodeURIComponent(message)}`);
  }

  redirect(`/admin/page-content/${blockKey}?saved=1`);
}

export async function publishAllAction(): Promise<void> {
  const publishedKeys = await publishAllDirtyBlocks();

  if (publishedKeys.length > 0) {
    revalidatePath("/", "layout");
  }

  redirect(`/admin/page-content?published=${publishedKeys.length}`);
}
