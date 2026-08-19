import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlockDraft, listBlocksWithDirty } from "@/lib/db/pageContent";
import {
  PAGE_CONTENT_KEYS,
  PAGE_CONTENT_META,
  type PageContentKey,
  type PageContentMap,
} from "@/data/pageContent";
import { publishBlockAction } from "../../../_actions/pageContent";
import SaveBanner from "../../../_components/SaveBanner";
import ConfirmSubmitButton from "../../../_components/ConfirmSubmitButton";
import HomeHeroForm from "../../../_components/pageContent/HomeHeroForm";
import WhyUsForm from "../../../_components/pageContent/WhyUsForm";
import HomeWhyChooseUsForm from "../../../_components/pageContent/HomeWhyChooseUsForm";
import TestimonialsForm from "../../../_components/pageContent/TestimonialsForm";
import FaqForm from "../../../_components/pageContent/FaqForm";
import AreasForm from "../../../_components/pageContent/AreasForm";
import CorePillarsForm from "../../../_components/pageContent/CorePillarsForm";
import VerticalsForm from "../../../_components/pageContent/VerticalsForm";
import AccreditationsForm from "../../../_components/pageContent/AccreditationsForm";
import ProcessForm from "../../../_components/pageContent/ProcessForm";
import BrandsForm from "../../../_components/pageContent/BrandsForm";
import StatsForm from "../../../_components/pageContent/StatsForm";
import AboutUsSlideForm from "../../../_components/pageContent/AboutUsSlideForm";
import ProjectsPreviewForm from "../../../_components/pageContent/ProjectsPreviewForm";
import PageHeaderForm from "../../../_components/pageContent/PageHeaderForm";
import AboutPageForm from "../../../_components/pageContent/AboutPageForm";

interface Props {
  params: Promise<{ key: string }>;
  searchParams: Promise<{ saved?: string; published?: string; error?: string }>;
}

function isPageContentKey(value: string): value is PageContentKey {
  return (PAGE_CONTENT_KEYS as readonly string[]).includes(value);
}

export default async function EditPageContentPage({ params, searchParams }: Props) {
  const { key } = await params;
  const sp = await searchParams;

  if (!isPageContentKey(key)) {
    notFound();
  }

  const content = await getBlockDraft(key);
  if (!content) {
    notFound();
  }

  const blocks = await listBlocksWithDirty();
  const dirty = blocks.find((b) => b.key === key)?.dirty ?? false;

  return (
    <div>
      <Link href="/admin/page-content" className="text-sm text-white/50 hover:text-white">
        ← All Page Content
      </Link>
      <div className="flex items-center justify-between gap-4 mt-2 mb-6">
        <h1 className="text-2xl font-bold">{PAGE_CONTENT_META[key].label}</h1>
        <div className="flex items-center gap-3">
          {dirty ? (
            <>
              <span className="shrink-0 text-[10px] font-bold uppercase text-amber-300 bg-amber-500/10 px-2 py-1 rounded-full">
                Unpublished changes
              </span>
              <form action={publishBlockAction}>
                <input type="hidden" name="blockKey" value={key} />
                <ConfirmSubmitButton
                  message={`Publish "${PAGE_CONTENT_META[key].label}"? This goes live immediately, only for this section.`}
                  className="rounded-lg bg-[#c5eb02] text-black text-sm font-semibold px-4 py-2 hover:bg-[#c5eb02]/80"
                >
                  Publish this section
                </ConfirmSubmitButton>
              </form>
            </>
          ) : (
            <span className="shrink-0 text-[10px] font-bold uppercase text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
              Published
            </span>
          )}
        </div>
      </div>

      {sp.published !== undefined && (
        <p className="-mt-4 mb-6 text-sm text-white/50">
          {sp.published === "1"
            ? "Published — this section is now live."
            : "Nothing to publish — draft already matched the live version."}
        </p>
      )}
      <SaveBanner saved={sp.saved === "1"} error={sp.error} />

      <div className="bg-[#101314] border border-white/10 rounded-xl p-6">
        {(() => {
          switch (key) {
            case "home-hero":
              return <HomeHeroForm content={content as PageContentMap["home-hero"]} />;
            case "why-us":
              return <WhyUsForm content={content as PageContentMap["why-us"]} />;
            case "home-why-choose-us":
              return <HomeWhyChooseUsForm content={content as PageContentMap["home-why-choose-us"]} />;
            case "testimonials":
              return <TestimonialsForm content={content as PageContentMap["testimonials"]} />;
            case "faq":
              return <FaqForm content={content as PageContentMap["faq"]} />;
            case "areas":
              return <AreasForm content={content as PageContentMap["areas"]} />;
            case "core-pillars":
              return <CorePillarsForm content={content as PageContentMap["core-pillars"]} />;
            case "verticals":
              return <VerticalsForm content={content as PageContentMap["verticals"]} />;
            case "accreditations":
              return <AccreditationsForm content={content as PageContentMap["accreditations"]} />;
            case "process":
              return <ProcessForm content={content as PageContentMap["process"]} />;
            case "brands":
              return <BrandsForm content={content as PageContentMap["brands"]} />;
            case "stats":
              return <StatsForm content={content as PageContentMap["stats"]} />;
            case "about-us-slide":
              return <AboutUsSlideForm content={content as PageContentMap["about-us-slide"]} />;
            case "projects-preview":
              return <ProjectsPreviewForm content={content as PageContentMap["projects-preview"]} />;
            case "services-page-header":
            case "locations-page-header":
            case "projects-page-header":
              return <PageHeaderForm blockKey={key} content={content as PageContentMap["services-page-header"]} />;
            case "about-page":
              return <AboutPageForm content={content as PageContentMap["about-page"]} />;
          }
        })()}
      </div>
    </div>
  );
}
