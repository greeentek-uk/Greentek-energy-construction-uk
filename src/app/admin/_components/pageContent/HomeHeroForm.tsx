"use client";
import Field from "../Field";
import RepeatingFieldList from "../RepeatingFieldList";
import { saveBlockDraftAction } from "../../_actions/pageContent";
import type { HomeHeroContent } from "@/data/pageContent";

export default function HomeHeroForm({ content }: { content: HomeHeroContent }) {
  return (
    <form action={saveBlockDraftAction} className="space-y-6">
      <input type="hidden" name="blockKey" value="home-hero" />
      <Field
        label="Trust Badge Suffix (shown on every slide)"
        name="trustBadgeSuffix"
        defaultValue={content.trustBadgeSuffix}
        required
      />

      <div>
        <p className="text-xs font-semibold text-white/50 mb-2">
          Hero Slides — background image, heading and CTA rotate every few
          seconds on the homepage.
        </p>
        <RepeatingFieldList
          name="slides"
          defaultValue={content.slides}
          emptyItem={{
            image: "",
            headingLine1: "",
            headingLine2: "",
            body: "",
            ctaLabel: "",
          }}
          itemLabel={(item) => `${item.headingLine1} ${item.headingLine2}`}
          fields={[
            { key: "image", label: "Background Image", image: true },
            { key: "headingLine1", label: "Heading Line 1" },
            { key: "headingLine2", label: "Heading Line 2" },
            { key: "body", label: "Body", textarea: true },
            { key: "ctaLabel", label: "CTA Button Label" },
          ]}
        />
      </div>

      <button type="submit" className="rounded-lg bg-[#c5eb02] text-black text-sm font-semibold px-6 py-3 hover:bg-[#c5eb02]/80">
        Save Draft
      </button>
    </form>
  );
}
