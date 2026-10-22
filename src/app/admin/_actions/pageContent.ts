"use server";

import { redirect } from "next/navigation";
import { revalidate } from "@/lib/revalidate";
import { parseFaqs } from "./faqs";
import { saveBlockDraft, publishBlock, publishAllDirtyBlocks } from "@/lib/db/pageContent";
import {
  PAGE_CONTENT_KEYS,
  PROJECT_COUNT_OPTIONS,
  DEFAULT_PROJECT_COUNT,
  type PROJECT_COUNT,
  type PageContentKey,
  type PageContentMap,
} from "@/data/pageContent";

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

function cleanItems<const K extends string, const L extends string = never>(
  formData: FormData,
  name: string,
  keys: readonly K[],
  listKeys: readonly L[] = [],
): (Record<K, string> & Record<L, string[]>)[] {
  return items<Record<string, unknown>>(formData, name)
    .map((raw) => {
      const item: Record<string, string | string[]> = {};
      for (const k of keys) item[k] = typeof raw[k] === "string" ? (raw[k] as string).trim() : "";
      for (const k of listKeys) {
        const v = raw[k];
        item[k] = Array.isArray(v) ? v.map((x) => String(x).trim()).filter(Boolean) : [];
      }
      return item as Record<K, string> & Record<L, string[]>;
    })
    .filter((item) => Object.values<string | string[]>(item).some((v) => v.length > 0));
}

function parseBlockFields(key: PageContentKey, formData: FormData): PageContentMap[PageContentKey] {
  switch (key) {
    case "home-hero":
      return {
        ratingLabel: str(formData, "ratingLabel"),
        ratingScore: str(formData, "ratingScore"),
        ratingUrl: str(formData, "ratingUrl"),
        image: str(formData, "image"),
        imageAlt: str(formData, "imageAlt"),
        headingLine1: str(formData, "headingLine1"),
        headingLine2: str(formData, "headingLine2"),
        body: str(formData, "body"),
        ctaLabel: str(formData, "ctaLabel"),
        formHeading: str(formData, "formHeading"),
        formSubheading: str(formData, "formSubheading"),
      } as PageContentMap["home-hero"];
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
          imageAlt: str(formData, "largeArea_imageAlt"),
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
        cards: [0, 1].map((i) => ({
          title: str(formData, `card${i}_title`),
          body: str(formData, `card${i}_body`),
          image: str(formData, `card${i}_image`),
          imageAlt: str(formData, `card${i}_imageAlt`),
          linkLabel: str(formData, `card${i}_linkLabel`),
          href: str(formData, `card${i}_href`),
        })),
      };
    case "featured-services":
      return {
        eyebrow: str(formData, "eyebrow"),
        heading: str(formData, "heading"),
        subheading: str(formData, "subheading"),
        items: items(formData, "items"),
        accreditationHeading: str(formData, "accreditationHeading"),
        accreditationBody: str(formData, "accreditationBody"),
      } as PageContentMap["featured-services"];
    case "projects-preview":
      return {
        eyebrow: str(formData, "eyebrow"),
        heading: str(formData, "heading"),
        subheading: str(formData, "subheading"),
        beforeBadgeLabel: str(formData, "beforeBadgeLabel"),
        afterBadgeLabel: str(formData, "afterBadgeLabel") || "After",
        ctaLabel: str(formData, "ctaLabel"),
        // Anything not on the list falls back to the default rather than
        // being stored and quietly breaking the grid later.
        projectCount: (PROJECT_COUNT_OPTIONS as readonly number[]).includes(
          Number(formData.get("projectCount")),
        )
          ? (Number(formData.get("projectCount")) as PROJECT_COUNT)
          : DEFAULT_PROJECT_COUNT,
      };
    case "finance-banner":
      return {
        heading: str(formData, "heading"),
        logo: str(formData, "logo"),
        logoAlt: str(formData, "logoAlt"),
        providerName: str(formData, "providerName"),
        provider2Name: str(formData, "provider2Name"),
        logo2: str(formData, "logo2"),
        logo2Alt: str(formData, "logo2Alt"),
        logoHref: str(formData, "logoHref"),
        logo2Href: str(formData, "logo2Href"),
      };
    case "services-page-header":
    case "locations-page-header":
    case "projects-page-header":
      return {
        headingPrefix: str(formData, "headingPrefix"),
        headingHighlight: str(formData, "headingHighlight"),
        subheading: str(formData, "subheading"),
      };
    case "finance-ideal4finance":
    case "finance-phoenix":
      return {
        name: str(formData, "name"),
        logo: str(formData, "logo"),
        logoAlt: str(formData, "logoAlt"),
        heading: str(formData, "heading"),
        intro: str(formData, "intro"),
        features: lines(formData, "features"),
        howItWorks: str(formData, "howItWorks"),
        applyLabel: str(formData, "applyLabel"),
        applyUrl: str(formData, "applyUrl"),
        secondaryLabel: str(formData, "secondaryLabel"),
        secondaryUrl: str(formData, "secondaryUrl"),
        supportText: str(formData, "supportText"),
        phone: str(formData, "phone"),
        // Kept verbatim (only line endings normalised): regulatory wording.
        riskWarning: str(formData, "riskWarning").replace(/\r\n?/g, "\n"),
        disclosure: str(formData, "disclosure").replace(/\r\n?/g, "\n"),
      };
    case "lp-kitchen-renovation":
    case "lp-bathroom-renovation":
      return {
        metaTitle: str(formData, "metaTitle"),
        metaDescription: str(formData, "metaDescription"),
        offerBar: str(formData, "offerBar"),
        ratingText: str(formData, "ratingText"),
        heroHeading: str(formData, "heroHeading"),
        heroHighlight: str(formData, "heroHighlight"),
        heroBody: str(formData, "heroBody"),
        heroTicks: lines(formData, "heroTicks"),
        heroImage: str(formData, "heroImage"),
        heroImageAlt: str(formData, "heroImageAlt"),
        quoteButtonLabel: str(formData, "quoteButtonLabel"),
        socialProofLine: str(formData, "socialProofLine"),
        resultsHeading: str(formData, "resultsHeading"),
        resultsIntro: str(formData, "resultsIntro"),
        results: cleanItems(formData, "results", ["before", "beforeAlt", "after", "afterAlt", "title", "body"]).filter(
          (r) => r.before && r.after,
        ),
        problemHeading: str(formData, "problemHeading"),
        problemQuestions: lines(formData, "problemQuestions"),
        problemBody: str(formData, "problemBody").replace(/\r\n?/g, "\n"),
        problemImage: str(formData, "problemImage"),
        problemImageAlt: str(formData, "problemImageAlt"),
        reviewsHeading: str(formData, "reviewsHeading"),
        tickerItems: lines(formData, "tickerItems"),
        features: cleanItems(formData, "features", ["heading", "body", "image", "imageAlt"], ["bullets"]),
        pricingHeading: str(formData, "pricingHeading"),
        pricingIntro: str(formData, "pricingIntro"),
        pricingTiers: cleanItems(
          formData,
          "pricingTiers",
          ["name", "price", "description"],
          ["features"],
        ),
        pricingNote: str(formData, "pricingNote"),
        guaranteeHeading: str(formData, "guaranteeHeading"),
        guaranteeBody: str(formData, "guaranteeBody"),
        stepsHeading: str(formData, "stepsHeading"),
        steps: cleanItems(formData, "steps", ["title", "body"]),
        stats: cleanItems(formData, "stats", ["value", "label"]),
        areasHeading: str(formData, "areasHeading"),
        areasBody: str(formData, "areasBody"),
        areaNames: lines(formData, "areaNames"),
        faqHeading: str(formData, "faqHeading"),
        faqs: parseFaqs(formData),
        finalHeading: str(formData, "finalHeading"),
        finalBody: str(formData, "finalBody"),
        finalTicks: lines(formData, "finalTicks"),
        finalImage: str(formData, "finalImage"),
        finalImageAlt: str(formData, "finalImageAlt"),
        formHeading: str(formData, "formHeading"),
        formSubheading: str(formData, "formSubheading"),
        stickyCallLabel: str(formData, "stickyCallLabel"),
        stickyQuoteLabel: str(formData, "stickyQuoteLabel"),
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

export async function publishBlockAction(formData: FormData): Promise<void> {
  const blockKey = str(formData, "blockKey") as PageContentKey;

  if (!PAGE_CONTENT_KEYS.includes(blockKey)) {
    redirect(`/admin/page-content?error=${encodeURIComponent("Unknown content block")}`);
  }

  const published = await publishBlock(blockKey);
  if (published) {
    await revalidate("/", "layout");
  }

  redirect(`/admin/page-content/${blockKey}?published=${published ? "1" : "0"}`);
}

export async function publishAllAction(): Promise<void> {
  const publishedKeys = await publishAllDirtyBlocks();

  if (publishedKeys.length > 0) {
    await revalidate("/", "layout");
  }

  redirect(`/admin/page-content?published=${publishedKeys.length}`);
}
