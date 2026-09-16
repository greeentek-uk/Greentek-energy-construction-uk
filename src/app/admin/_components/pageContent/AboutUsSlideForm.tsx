"use client";
import Field from "../Field";
import ImageUploadField from "../ImageUploadField";
import { saveBlockDraftAction } from "../../_actions/pageContent";
import type { AboutCard, AboutUsSlideContent } from "@/data/pageContent";

const CARD_NAMES = ["Left card — Solar & renewables", "Right card — Construction"];

const EMPTY_CARD: AboutCard = {
  title: "",
  body: "",
  image: "",
  imageAlt: "",
  linkLabel: "",
  href: "",
};

export default function AboutUsSlideForm({ content }: { content: AboutUsSlideContent }) {
  // Blocks saved before the cards existed have no `cards` array at all.
  const cards = [0, 1].map((i) => content.cards?.[i] ?? EMPTY_CARD);

  return (
    <form action={saveBlockDraftAction} className="space-y-6">
      <input type="hidden" name="blockKey" value="about-us-slide" />
      <Field label="Eyebrow" name="eyebrow" defaultValue={content.eyebrow} required />
      <Field label="Heading" name="heading" defaultValue={content.heading} required />
      <Field label="Body" name="body" textarea defaultValue={content.body} required />

      <div className="border-t border-white/10 pt-6 space-y-2">
        <p className="text-sm font-bold text-white">Feature cards</p>
        <p className="text-xs text-white/40">
          Two cards side by side under the heading — text on the left of each, image on the
          right. A card with no title is hidden; a card with no image shows its text only.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {cards.map((card, i) => (
          <div key={i} className="space-y-4 rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold text-white/50">{CARD_NAMES[i]}</p>
            <Field label="Title" name={`card${i}_title`} defaultValue={card.title} />
            <Field label="Text" name={`card${i}_body`} textarea rows={3} defaultValue={card.body} />
            <ImageUploadField
              name={`card${i}_image`}
              label="Image"
              defaultValue={card.image}
              altName={`card${i}_imageAlt`}
              altDefaultValue={card.imageAlt}
              altFallback={card.title}
            />
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Button text"
                name={`card${i}_linkLabel`}
                defaultValue={card.linkLabel}
                placeholder="Find out more"
              />
              <Field
                label="Button link"
                name={`card${i}_href`}
                defaultValue={card.href}
                placeholder="/energy-solutions"
              />
            </div>
          </div>
        ))}
      </div>

      <button type="submit" className="rounded-lg bg-[#c5eb02] text-black text-sm font-semibold px-6 py-3 hover:bg-[#c5eb02]/80">
        Save Draft
      </button>
    </form>
  );
}
