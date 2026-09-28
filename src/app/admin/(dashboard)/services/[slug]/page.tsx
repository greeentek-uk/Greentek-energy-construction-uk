import { notFound } from "next/navigation";
import { getCurrentSiteConfig, getPageContent } from "@/lib/cms";
import { getAllLocationServiceContent } from "@/lib/db/locationServiceContent";
import { deleteServiceAction } from "../../../_actions/content";
import SaveBanner from "../../../_components/SaveBanner";
import ServiceForm from "../../../_components/ServiceForm";
import ConfirmSubmitButton from "../../../_components/ConfirmSubmitButton";
import InternalLinkSuggestions from "../../../_components/InternalLinkSuggestions";
import { EditorHeader } from "../../../_components/editor/EditorLayout";
import PageLinkGrid from "../../../_components/editor/PageLinkGrid";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}

export default async function EditServicePage({ params, searchParams }: Props) {
  const [{ slug }, search] = await Promise.all([params, searchParams]);
  const [{ services, locations, projects }, combos, sharedProcess, sharedStats] = await Promise.all([
    getCurrentSiteConfig(),
    getAllLocationServiceContent(),
    getPageContent("process"),
    getPageContent("stats"),
  ]);

  const service = services.find((s) => s.slug === slug);
  if (!service) notFound();

  const customised = new Set(
    combos.filter((c) => c.serviceSlug === slug).map((c) => c.locationSlug),
  );

  return (
    <div>
      <EditorHeader
        crumbs={[{ label: "Services", href: "/admin/services" }, { label: service.title }]}
        title={service.title}
        livePath={`/services/${service.slug}`}
        actions={
          <form action={deleteServiceAction}>
            <input type="hidden" name="slug" value={service.slug} />
            <ConfirmSubmitButton
              message={`Delete "${service.title}"? This cannot be undone.`}
              className="text-xs font-semibold text-red-400 hover:text-red-300"
            >
              Delete
            </ConfirmSubmitButton>
          </form>
        }
      >
        <div className="mt-5 rounded-xl border border-white/10 bg-[#101314] p-4">
          <p className="text-sm font-semibold text-white">This service in each area</p>
          <p className="text-xs text-white/50 mb-3">
            Each has its own page that falls back to this one field by field. Open one to give it
            its own copy.
          </p>
          <PageLinkGrid
            links={locations.map((location) => ({
              label: `${service.shortName} in ${location.name}`,
              href: `/admin/locations/${location.slug}/services/${service.slug}`,
              customised: customised.has(location.slug),
            }))}
          />
        </div>
      </EditorHeader>

      <SaveBanner saved={search.saved === "1"} error={search.error} />

      <ServiceForm
        initial={service}
        projects={projects}
        inherited={{ process: sharedProcess, stats: sharedStats }}
        bodyExtras={
          <InternalLinkSuggestions content={service.content} currentPath={`/services/${service.slug}`} />
        }
      />
    </div>
  );
}
