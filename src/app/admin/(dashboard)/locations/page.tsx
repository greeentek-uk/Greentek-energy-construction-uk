import Link from "next/link";
import { getCurrentSiteConfig } from "@/lib/cms";
import { getAllLocationServiceContent } from "@/lib/db/locationServiceContent";
import SaveBanner from "../../_components/SaveBanner";

interface Props {
  searchParams: Promise<{ deleted?: string; error?: string }>;
}

/**
 * Every area, with its own page and its service pages one click away. The
 * location + service pages used to sit two screens down, inside a list of
 * eleven collapsed forms; here each is a direct link.
 */
export default async function LocationsAdminPage({ searchParams }: Props) {
  const params = await searchParams;
  const [{ locations, services }, combos] = await Promise.all([
    getCurrentSiteConfig(),
    getAllLocationServiceContent(),
  ]);
  const customised = new Set(combos.map((c) => `${c.locationSlug}/${c.serviceSlug}`));

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold">Locations</h1>
        <Link
          href="/admin/locations/new"
          className="rounded-lg bg-[#c5eb02] text-black text-sm font-semibold px-4 py-2 hover:bg-[#c5eb02]/80"
        >
          + New Location
        </Link>
      </div>
      <p className="text-white/50 mb-6 text-sm">
        Each area has its own page, plus one page per service in that area. The{" "}
        <Link href="/admin/content/locations" className="underline hover:text-white">
          /locations listing page
        </Link>{" "}
        itself is edited under Pages.
      </p>

      <SaveBanner saved={params.deleted === "1"} error={params.error} />

      <div className="space-y-4">
        {locations.map((location) => (
          <section
            key={location.slug}
            className="bg-[#101314] border border-white/10 rounded-xl overflow-hidden"
          >
            <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-white/10">
              <Link href={`/admin/locations/${location.slug}`} className="min-w-0 group">
                <p className="font-semibold text-white group-hover:text-[#c5eb02]">{location.name}</p>
                <p className="text-xs text-white/40">/locations/{location.slug}</p>
              </Link>
              <div className="flex shrink-0 items-center gap-4 text-xs font-semibold">
                <a
                  href={`/locations/${location.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-white/50 hover:text-white"
                >
                  View ↗
                </a>
                <Link
                  href={`/admin/locations/${location.slug}`}
                  className="rounded-lg border border-white/15 px-3 py-1.5 text-white hover:border-[#c5eb02]"
                >
                  Edit {location.name} page
                </Link>
              </div>
            </div>
            <div className="px-5 py-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-white/40 mb-2">
                Service pages in {location.name}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {services.map((service) => {
                  const own = customised.has(`${location.slug}/${service.slug}`);
                  return (
                    <Link
                      key={service.slug}
                      href={`/admin/locations/${location.slug}/services/${service.slug}`}
                      title={own ? "Has its own copy" : "All defaults"}
                      className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75 hover:border-[#c5eb02] hover:text-white"
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${own ? "bg-green-400" : "bg-white/25"}`}
                      />
                      {service.shortName}
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        ))}
        {locations.length === 0 && <p className="text-sm text-white/40">No locations yet.</p>}
      </div>
    </div>
  );
}
