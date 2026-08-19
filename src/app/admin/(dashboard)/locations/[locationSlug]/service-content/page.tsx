import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentSiteConfig } from "@/lib/cms";
import { getLocationServiceContentForLocation } from "@/lib/db/locationServiceContent";
import SaveBanner from "../../../../_components/SaveBanner";
import LocationServiceContentForm from "../../../../_components/LocationServiceContentForm";

interface Props {
  params: Promise<{ locationSlug: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}

export default async function LocationServiceContentPage({ params, searchParams }: Props) {
  const { locationSlug } = await params;
  const search = await searchParams;
  const { locations, services } = await getCurrentSiteConfig();

  const location = locations.find((l) => l.slug === locationSlug);
  if (!location) {
    notFound();
  }

  const overrides = await getLocationServiceContentForLocation(locationSlug);
  const overrideBySlug = new Map(overrides.map((o) => [o.serviceSlug, o]));

  return (
    <div>
      <Link href="/admin/locations" className="text-sm text-white/50 hover:text-white">
        ← All Locations
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-1">
        Service content for {location.name}
      </h1>
      <p className="text-white/50 mb-6 text-sm">
        Unique copy for each /locations/{location.slug}/[service] page. Leave a
        service&apos;s intro blank and that page keeps rendering its current
        templated default — nothing breaks while you work through the list.
      </p>

      <SaveBanner saved={search.saved === "1"} error={search.error} />

      <div className="space-y-3">
        {services.map((service) => (
          <div
            key={service.slug}
            className="bg-[#101314] border border-white/10 rounded-xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4">
              <span className="font-semibold text-white">{service.shortName}</span>
              {overrideBySlug.has(service.slug) && (
                <span className="text-[10px] font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                  Customised
                </span>
              )}
            </div>
            <details>
              <summary className="cursor-pointer px-5 py-2 text-sm text-white/50 hover:bg-white/5 border-t border-white/10">
                Edit content
              </summary>
              <div className="px-5 pb-5 pt-2">
                <LocationServiceContentForm
                  locationSlug={location.slug}
                  serviceSlug={service.slug}
                  initial={overrideBySlug.get(service.slug)}
                />
              </div>
            </details>
          </div>
        ))}
      </div>
    </div>
  );
}
