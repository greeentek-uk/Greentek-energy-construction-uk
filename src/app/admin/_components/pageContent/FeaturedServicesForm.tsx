"use client";
import Field from "../Field";
import RepeatingFieldList from "../RepeatingFieldList";
import { saveBlockDraftAction } from "../../_actions/pageContent";
import type { FeaturedServicesContent } from "@/data/pageContent";

export default function FeaturedServicesForm({ content }: { content: FeaturedServicesContent }) {
  return (
    <form action={saveBlockDraftAction} className="space-y-6">
      <input type="hidden" name="blockKey" value="featured-services" />
      <Field label="Eyebrow" name="eyebrow" defaultValue={content.eyebrow} required />
      <Field label="Heading" name="heading" defaultValue={content.heading} required />
      <Field label="Subheading" name="subheading" textarea defaultValue={content.subheading} />

      <div className="space-y-2">
        <p className="text-sm font-bold text-white">Services</p>
        <p className="text-xs text-white/40">
          Shown as alternating rows — the first with text on the left, the next with text on
          the right, and so on. Use the arrows to reorder.
        </p>
      </div>
      <RepeatingFieldList
        name="items"
        defaultValue={content.items}
        emptyItem={{ title: "", body: "", image: "", imageAlt: "", linkLabel: "Find out more", href: "" }}
        itemLabel={(item) => item.title}
        fields={[
          { key: "title", label: "Title" },
          { key: "body", label: "Text", textarea: true },
          { key: "image", label: "Image", image: true, altKey: "imageAlt", altFallbackKey: "title" },
          { key: "linkLabel", label: "Button text" },
          { key: "href", label: "Button link (e.g. /services/loft-insulation)" },
        ]}
      />

      <div className="border-t border-white/10 pt-6 space-y-4">
        <div>
          <p className="text-sm font-bold text-white">Accreditation strip</p>
          <p className="text-xs text-white/40">
            Sits between the second and third service. The logos and their links come from{" "}
            <span className="text-white/70">Page Content → Accreditations</span>, so they stay
            the same everywhere they appear.
          </p>
        </div>
        <Field
          label="Strip heading"
          name="accreditationHeading"
          defaultValue={content.accreditationHeading}
          placeholder="Certified and accredited with"
        />
        <Field
          label="Strip text (optional)"
          name="accreditationBody"
          defaultValue={content.accreditationBody}
        />
      </div>

      <button type="submit" className="rounded-lg bg-[#c5eb02] text-black text-sm font-semibold px-6 py-3 hover:bg-[#c5eb02]/80">
        Save Draft
      </button>
    </form>
  );
}
