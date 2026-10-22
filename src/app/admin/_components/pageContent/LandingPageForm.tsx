"use client";
import Field from "../Field";
import ImageUploadField from "../ImageUploadField";
import RepeatingFieldList from "../RepeatingFieldList";
import FaqEditor from "../FaqEditor";
import { saveBlockDraftAction } from "../../_actions/pageContent";
import type { LandingPageContent, PageContentKey } from "@/data/pageContent";

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
        the sitemap. Every quote button opens the same quote form, and enquiries from it arrive marked
        &quot;Ad landing page&quot; with the ad campaign they came from. The sections below are in the
        order the page shows them.
      </p>

      <Section n={1} title="Browser tab & shares">
        <Field label="Title" name="metaTitle" defaultValue={content.metaTitle} />
        <Field label="Description" name="metaDescription" defaultValue={content.metaDescription} textarea rows={2} />
      </Section>

      <Section n={2} title="Offer strip (top of the page)" hint="One line. Leave blank to hide it.">
        <Field label="Text" name="offerBar" defaultValue={content.offerBar} />
      </Section>

      <Section n={3} title="Hero" hint="Say what the ad promised, in the same words: visitors who see what they clicked on are far more likely to stay.">
        <Field label="Rating pill text (after the stars; the score is the shared Trustpilot one)" name="ratingText" defaultValue={content.ratingText} />
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Heading (H1, the whole line)" name="heroHeading" defaultValue={content.heroHeading} />
          <Field label="Words in the heading to mark in green (optional)" name="heroHighlight" defaultValue={content.heroHighlight} />
        </div>
        <Field label="Text under the heading" name="heroBody" defaultValue={content.heroBody} textarea rows={3} />
        <Field label="Ticks under the buttons (one per line, three)" name="heroTicks" defaultValue={content.heroTicks.join("\n")} textarea rows={3} />
        <ImageUploadField
          name="heroImage"
          label="Photo (right-hand side)"
          defaultValue={content.heroImage}
          altName="heroImageAlt"
          altDefaultValue={content.heroImageAlt}
        />
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Quote button text (every quote button on the page)" name="quoteButtonLabel" defaultValue={content.quoteButtonLabel} />
          <Field label="Line under the buttons (e.g. Join 500+ homeowners…)" name="socialProofLine" defaultValue={content.socialProofLine} />
        </div>
      </Section>

      <Section n={4} title="Before & after" hint="Real jobs only. A short result as the title converts better than a job name.">
        <Field label="Heading" name="resultsHeading" defaultValue={content.resultsHeading} />
        <Field label="Intro line" name="resultsIntro" defaultValue={content.resultsIntro} />
        <RepeatingFieldList
          name="results"
          defaultValue={content.results}
          emptyItem={{ before: "", beforeAlt: "", after: "", afterAlt: "", title: "", body: "" }}
          itemLabel={(i) => i.title}
          fields={[
            { key: "before", label: "Before photo", image: true, altKey: "beforeAlt" },
            { key: "after", label: "After photo", image: true, altKey: "afterAlt" },
            { key: "title", label: "Result (title)" },
            { key: "body", label: "One line about the job", textarea: true },
          ]}
        />
      </Section>

      <Section n={5} title="The problem" hint="The reader's own doubts, then why it's different with you.">
        <Field label="Heading" name="problemHeading" defaultValue={content.problemHeading} />
        <Field label="Questions they're asking themselves (one per line)" name="problemQuestions" defaultValue={content.problemQuestions.join("\n")} textarea rows={3} />
        <Field label="Text (blank line between paragraphs)" name="problemBody" defaultValue={content.problemBody} textarea rows={5} />
        <ImageUploadField
          name="problemImage"
          label="Photo (optional)"
          defaultValue={content.problemImage}
          altName="problemImageAlt"
          altDefaultValue={content.problemImageAlt}
        />
      </Section>

      <Section n={6} title="Reviews" hint="The reviews themselves are the shared ones (Shared sections → Testimonials). Three also appear in the strip under the hero.">
        <Field label="Heading" name="reviewsHeading" defaultValue={content.reviewsHeading} />
      </Section>

      <Section n={7} title="Scrolling benefits strip" hint="A few words each, one per line.">
        <Field label="Items" name="tickerItems" defaultValue={content.tickerItems.join("\n")} textarea rows={5} />
      </Section>

      <Section n={8} title="Image and text blocks" hint="They alternate left and right. A block without a photo shows its points in a highlighted panel instead.">
        <RepeatingFieldList
          name="features"
          defaultValue={content.features}
          emptyItem={{ heading: "", body: "", bullets: [], image: "", imageAlt: "" }}
          itemLabel={(i) => i.heading}
          fields={[
            { key: "heading", label: "Heading" },
            { key: "body", label: "Text", textarea: true },
            { key: "bullets", label: "Points", lines: true },
            { key: "image", label: "Photo (optional)", image: true, altKey: "imageAlt" },
          ]}
        />
      </Section>

      <Section n={9} title="Prices" hint="Showing a range filters out enquiries you can't serve and builds trust. Keep them to what you really quote.">
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

      <Section n={10} title="Guarantee banner">
        <Field label="Heading" name="guaranteeHeading" defaultValue={content.guaranteeHeading} />
        <Field label="Text" name="guaranteeBody" defaultValue={content.guaranteeBody} textarea rows={3} />
      </Section>

      <Section n={11} title="Steps">
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

      <Section n={12} title="Numbers" hint="Only figures you can stand behind. Four fit on one row.">
        <RepeatingFieldList
          name="stats"
          defaultValue={content.stats}
          emptyItem={{ value: "", label: "" }}
          itemLabel={(i) => `${i.value} ${i.label}`}
          fields={[
            { key: "value", label: "Number (e.g. 500+)" },
            { key: "label", label: "Label" },
          ]}
        />
      </Section>

      <Section n={13} title="Areas we cover" hint="Leave the place names blank to show your location pages (Admin → Locations) instead.">
        <Field label="Heading" name="areasHeading" defaultValue={content.areasHeading} />
        <Field label="Text" name="areasBody" defaultValue={content.areasBody} textarea rows={2} />
        <Field label="Place names (one per line)" name="areaNames" defaultValue={content.areaNames.join("\n")} textarea rows={6} />
      </Section>

      <Section n={14} title="FAQs" hint="Answer the objections that stop people enquiring: cost, time, mess, finance, area.">
        <Field label="Heading" name="faqHeading" defaultValue={content.faqHeading} />
        <FaqEditor initial={content.faqs} />
      </Section>

      <Section n={15} title="Closing section with the quote form">
        <Field label="Heading" name="finalHeading" defaultValue={content.finalHeading} />
        <Field label="Text" name="finalBody" defaultValue={content.finalBody} textarea rows={2} />
        <Field label="Ticks (one per line)" name="finalTicks" defaultValue={content.finalTicks.join("\n")} textarea rows={3} />
        <ImageUploadField
          name="finalImage"
          label="Background photo"
          defaultValue={content.finalImage}
          altName="finalImageAlt"
          altDefaultValue={content.finalImageAlt}
        />
      </Section>

      <Section n={16} title="Quote form & phone bar" hint="The form opens from every quote button, and sits in the closing section.">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Form heading" name="formHeading" defaultValue={content.formHeading} />
          <Field label="Form subheading" name="formSubheading" defaultValue={content.formSubheading} />
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
