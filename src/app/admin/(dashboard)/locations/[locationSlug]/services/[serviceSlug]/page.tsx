import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentSiteConfig, getPageContent } from "@/lib/cms";
import { getAllLocationServiceContent } from "@/lib/db/locationServiceContent";
import SaveBanner from "../../../../../_components/SaveBanner";
import LocationServiceContentForm from "../../../../../_components/LocationServiceContentForm";
import { EditorHeader } from "../../../../../_components/editor/EditorLayout";
import PageLinkGrid from "../../../../../_components/editor/PageLinkGrid";

interface Props {
  params: Promise<{ locationSlug: string; serviceSlug: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}

/**
 * One /locations/[loc]/[svc] page. Every field falls back to the service's
 * page, so the header says so and links to it, and to this service's other
 * areas and this area's other services, since those are the pages someone
 * working through the combos moves between.
 */
export default async function EditLocationServicePage({ params, searchParams }: Props) {
  const [{ locationSlug, serviceSlug }, search] = await Promise.all([params, searchParams]);
  const [{ locations, services, projects }, combos, sharedProcess, sharedStats] = await Promise.all([
    getCurrentSiteConfig(),
    getAllLocationServiceContent(),
    getPageContent("process"),
    getPageContent("stats"),
  ]);

  const location = locations.find((l) => l.slug === locationSlug);
  const service = services.find((s) => s.slug === serviceSlug);
  if (!location || !service) notFound();

  const customised = new Set(combos.map((c) => `${c.locationSlug}/${c.serviceSlug}`));
  const initial = combos.find(
    (c) => c.locationSlug === location.slug && c.serviceSlug === service.slug,
  );
  const comboHref = (loc: string, svc: string) => `/admin/locations/${loc}/services/${svc}`;

  return (
    <div>
      <EditorHeader
        crumbs={[
          { label: "Locations", href: "/admin/locations" },
          { label: location.name, href: `/admin/locations/${location.slug}` },
          { label: service.shortName },
        ]}
        title={`${service.shortName} in ${location.name}`}
        livePath={`/locations/${location.slug}/${service.slug}`}
      >
        <p className="mt-2 text-sm text-white/60">
          Only this page changes. Anything left blank shows the{" "}
          <Link href={`/admin/services/${service.slug}`} className="underline hover:text-white">
            {service.title} service page
          </Link>
          &apos;s copy, pre-filled or greyed out below.
        </p>
        <details className="mt-4 rounded-xl border border-white/10 bg-[#101314] p-4">
          <summary className="cursor-pointer text-sm font-semibold text-white">
            Jump to a related page
          </summary>
          <p className="mt-3 mb-2 text-xs font-semibold text-white/50">
            {service.shortName} in other areas
          </p>
          <PageLinkGrid
            links={locations.map((l) => ({
              label: l.name,
              href: comboHref(l.slug, service.slug),
              customised: customised.has(`${l.slug}/${service.slug}`),
              current: l.slug === location.slug,
            }))}
          />
          <p className="mt-4 mb-2 text-xs font-semibold text-white/50">
            Other services in {location.name}
          </p>
          <PageLinkGrid
            links={services.map((s) => ({
              label: s.shortName,
              href: comboHref(location.slug, s.slug),
              customised: customised.has(`${location.slug}/${s.slug}`),
              current: s.slug === service.slug,
            }))}
          />
        </details>
      </EditorHeader>

      <SaveBanner saved={search.saved === "1"} error={search.error} />

      <LocationServiceContentForm
        location={{ slug: location.slug, name: location.name }}
        service={{
          slug: service.slug,
          title: service.title,
          shortName: service.shortName,
          description: service.description,
          highlights: service.highlights,
        }}
        projects={projects.map(({ slug, title, service }) => ({ slug, title, service }))}
        initial={initial}
        // What this page shows while it has no copy of its own, so the editor
        // starts from it rather than from blank fields.
        inherited={{
          problem: service.problem,
          pricing: service.pricing,
          sections: {
            labels: service.sections?.labels,
            process: service.sections?.process ?? sharedProcess,
            stats: service.sections?.stats ?? sharedStats,
          },
        }}
      />
    </div>
  );
}
