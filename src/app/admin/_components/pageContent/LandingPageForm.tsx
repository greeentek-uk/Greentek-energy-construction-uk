"use client";
import Field from "../Field";
import ImageUploadField from "../ImageUploadField";
import RepeatingFieldList from "../RepeatingFieldList";
import FaqEditor from "../FaqEditor";
import { saveBlockDraftAction } from "../../_actions/pageContent";
import type { LandingPageContent, PageContentKey } from "@/data/pageContent";

/** One numbered box per section, in the order the page shows them. */
function Section({ n, title, hint, children }: { n: number; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-4 rounded-lg border border-white/10 p-5">
      <legend className="px-2 text-sm font-bold text-white">
        <span className="text-[#c5eb02]">{n}.</span> {title}
      </legend>
      {hint && <p className="text-xs text-white/50">{hint}</p>}
      {children}
    </fieldset>
  );
}

/**
 * An ad landing page's own wording, top to bottom. Leaving a section's heading
 * blank (or its list empty) hides that section, so a weak one can be switched
 * off for a test without touching code.
 */
export default function LandingPageForm({
  blockKey,
  content,
}: {
  blockKey: PageContentKey;
  content: LandingPageContent;
}) {
  return (
    <form action={saveBlockDraftAction} className="space-y-6">
      <input type="hidden" name="blockKey" value={blockKey} />

      <p className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/60">
        This page is for paid ads only: it has no menu, is hidden from Google (noindex) and isn&apos;t in
        the sitemap. Every button takes the visitor to the quote form, and enquiries from it arrive
        marked &quot;Ad landing page&quot; with the ad campaign they came from.
      </p>

      <Section n={1} title="Browser tab & shares">
        <Field label="Title" name="metaTitle" defaultValue={content.metaTitle} />
        <Field label="Description" name="metaDescription" defaultValue={content.metaDescription} textarea rows={2} />
      </Section>

      <Section n={2} title="Hero" hint="What the ad promised, repeated in the headline: visitors who see the same words they clicked are far more likely to stay.">
        <Field label="Small line above the heading" name="heroEyebrow" defaultValue={content.heroEyebrow} />
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Heading (H1, the whole line)" name="heroHeading" defaultValue={content.heroHeading} />
          <Field label="Words in the heading to show in green (optional)" name="heroHighlight" defaultValue={content.heroHighlight} />
        </div>
        <Field label="Text under the heading" name="heroBody" defaultValue={content.heroBody} textarea rows={3} />
        <Field label="Ticks under the text (one per line, three or four)" name="heroBullets" defaultValue={content.heroBullets.join("\n")} textarea rows={4} />
        <ImageUploadField
          name="heroImage"
          label="Background photo"
          defaultValue={content.heroImage}
          altName="heroImageAlt"
          altDefaultValue={content.heroImageAlt}
        />
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Quote form heading" name="formHeading" defaultValue={content.formHeading} />
          <Field label="Quote form subheading" name="formSubheading" defaultValue={content.formSubheading} />
        </div>
      </Section>

      <Section n={3} title="Trust strip under the hero" hint="A few words each. One per line.">
        <Field label="Points" name="trustPoints" defaultValue={content.trustPoints.join("\n")} textarea rows={4} />
      </Section>

      <Section n={4} title="The problem" hint="The reader's frustrations, in their words, before the page offers the fix.">
        <Field label="Heading" name="problemHeading" defaultValue={content.problemHeading} />
        <Field label="Text (blank line between paragraphs)" name="problemIntro" defaultValue={content.problemIntro} textarea rows={4} />
        <RepeatingFieldList
          name="problemCards"
          defaultValue={content.problemCards}
          emptyItem={{ title: "", body: "" }}
          itemLabel={(i) => i.title}
          fields={[
            { key: "title", label: "Title" },
            { key: "body", label: "Text", textarea: true },
          ]}
        />
      </Section>

      <Section n={5} title="What's included">
        <Field label="Heading" name="includedHeading" defaultValue={content.includedHeading} />
        <Field label="Intro line" name="includedIntro" defaultValue={content.includedIntro} />
        <Field label="Items (one per line)" name="includedItems" defaultValue={content.includedItems.join("\n")} textarea rows={6} />
      </Section>

      <Section n={6} title="Photos of finished jobs" hint="Before / after pairs convert best. Real photos only.">
        <Field label="Heading" name="galleryHeading" defaultValue={content.galleryHeading} />
        <Field label="Intro line" name="galleryIntro" defaultValue={content.galleryIntro} />
        <RepeatingFieldList
          name="gallery"
          defaultValue={content.gallery}
          emptyItem={{ image: "", alt: "", caption: "" }}
          itemLabel={(i) => i.caption}
          fields={[
            { key: "image", label: "Photo", image: true, altKey: "alt" },
            { key: "caption", label: "Caption (e.g. Before, After)" },
          ]}
        />
      </Section>

      <Section n={7} title="Reviews" hint="The reviews themselves are the shared ones (Shared sections → Testimonials).">
        <Field label="Heading" name="reviewsHeading" defaultValue={content.reviewsHeading} />
      </Section>

      <Section n={8} title="Prices" hint="Showing a price range filters out enquiries you can't serve and builds trust. Keep them to what you really quote.">
        <Field label="Heading" name="pricingHeading" defaultValue={content.pricingHeading} />
        <Field label="Intro" name="pricingIntro" defaultValue={content.pricingIntro} textarea rows={2} />
        <RepeatingFieldList
          name="pricingTiers"
          defaultValue={content.pricingTiers}
          emptyItem={{ name: "", price: "", description: "", features: [] }}
          itemLabel={(i) => i.name}
          fields={[
            { key: "name", label: "Name" },
            { key: "price", label: "Price (e.g. From £8,000)" },
            { key: "description", label: "One line", textarea: true },
            { key: "features", label: "Points", lines: true },
          ]}
        />
        <Field label="Note under the prices" name="pricingNote" defaultValue={content.pricingNote} textarea rows={2} />
      </Section>

      <Section n={9} title="How it works">
        <Field label="Heading" name="stepsHeading" defaultValue={content.stepsHeading} />
        <RepeatingFieldList
          name="steps"
          defaultValue={content.steps}
          emptyItem={{ title: "", body: "" }}
          itemLabel={(i) => i.title}
          fields={[
            { key: "title", label: "Step" },
            { key: "body", label: "Text", textarea: true },
          ]}
        />
      </Section>

      <Section n={10} title="Why choose us">
        <Field label="Heading" name="guaranteeHeading" defaultValue={content.guaranteeHeading} />
        <RepeatingFieldList
          name="guaranteeItems"
          defaultValue={content.guaranteeItems}
          emptyItem={{ title: "", body: "" }}
          itemLabel={(i) => i.title}
          fields={[
            { key: "title", label: "Title" },
            { key: "body", label: "Text", textarea: true },
          ]}
        />
      </Section>

      <Section n={11} title="FAQs" hint="Answer the objections that stop people enquiring: cost, time, mess, finance, area.">
        <Field label="Heading" name="faqHeading" defaultValue={content.faqHeading} />
        <FaqEditor initial={content.faqs} />
      </Section>

      <Section n={12} title="Final quote form">
        <Field label="Heading" name="ctaHeading" defaultValue={content.ctaHeading} />
        <Field label="Text" name="ctaBody" defaultValue={content.ctaBody} textarea rows={2} />
      </Section>

      <Section n={13} title="Buttons">
        <Field label="In-page buttons (go to the quote form)" name="quoteButtonLabel" defaultValue={content.quoteButtonLabel} />
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Phone bar — call button" name="stickyCallLabel" defaultValue={content.stickyCallLabel} />
          <Field label="Phone bar — quote button" name="stickyQuoteLabel" defaultValue={content.stickyQuoteLabel} />
        </div>
      </Section>

      <button type="submit" className="rounded-lg bg-[#c5eb02] text-black text-sm font-semibold px-6 py-3 hover:bg-[#c5eb02]/80">
        Save Draft
      </button>
    </form>
  );
}
