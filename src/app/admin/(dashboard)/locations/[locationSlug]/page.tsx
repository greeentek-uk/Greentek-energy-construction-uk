import { notFound } from "next/navigation";
import { getCurrentSiteConfig, getPageContent } from "@/lib/cms";
import { getLocationServiceContentForLocation } from "@/lib/db/locationServiceContent";
import { deleteLocationAction } from "../../../_actions/content";
import SaveBanner from "../../../_components/SaveBanner";
import LocationForm from "../../../_components/LocationForm";
import ConfirmSubmitButton from "../../../_components/ConfirmSubmitButton";
import InternalLinkSuggestions from "../../../_components/InternalLinkSuggestions";
import { EditorHeader } from "../../../_components/editor/EditorLayout";
import PageLinkGrid from "../../../_components/editor/PageLinkGrid";
import FocusKeywordBox from "../../../_components/FocusKeywordBox";

interface Props {
  params: Promise<{ locationSlug: string }>;
  searchParams: Promise<{ saved?: string; error?: string; keywordSaved?: string }>;
}

export default async function EditLocationPage({ params, searchParams }: Props) {
  const [{ locationSlug }, search] = await Promise.all([params, searchParams]);
  const [{ locations, services, projects }, combos, sharedProcess, sharedStats] = await Promise.all([
    getCurrentSiteConfig(),
    getLocationServiceContentForLocation(locationSlug),
    getPageContent("process"),
    getPageContent("stats"),
  ]);

  const location = locations.find((l) => l.slug === locationSlug);
  if (!location) notFound();

  const customised = new Set(combos.map((c) => c.serviceSlug));

  return (
    <div>
      <EditorHeader
        crumbs={[{ label: "Locations", href: "/admin/locations" }, { label: location.name }]}
        title={`${location.name} page`}
        livePath={`/locations/${location.slug}`}
        actions={
          <form action={deleteLocationAction}>
            <input type="hidden" name="slug" value={location.slug} />
            <ConfirmSubmitButton
              message={`Delete "${location.name}"? This cannot be undone.`}
              className="text-xs font-semibold text-red-400 hover:text-red-300"
            >
              Delete
            </ConfirmSubmitButton>
          </form>
        }
      />

      <FocusKeywordBox
        path={`/locations/${location.slug}`}
        returnTo={`/admin/locations/${location.slug}`}
        saved={search.keywordSaved === "1"}
      />

      <SaveBanner saved={search.saved === "1"} error={search.error} />

      <LocationForm
        initial={location}
        projects={projects.map(({ slug, title }) => ({ slug, title }))}
        inherited={{ process: sharedProcess, stats: sharedStats }}
        bodyExtras={
          <InternalLinkSuggestions content={location.content} currentPath={`/locations/${location.slug}`} />
        }
        servicePages={
          <PageLinkGrid
            links={services.map((service) => ({
              label: `${service.shortName} in ${location.name}`,
              href: `/admin/locations/${location.slug}/services/${service.slug}`,
              customised: customised.has(service.slug),
            }))}
          />
        }
      />
    </div>
  );
}
