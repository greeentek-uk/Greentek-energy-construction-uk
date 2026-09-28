import Link from "next/link";
import { getCurrentSiteConfig } from "@/lib/cms";
import SaveBanner from "../../_components/SaveBanner";

interface Props {
  searchParams: Promise<{ deleted?: string; error?: string }>;
}

/**
 * Every service page, each opening its own editor. The list used to hold the
 * whole form for all eleven, collapsed, which made the one you wanted hard to
 * find and impossible to link to.
 */
export default async function ServicesAdminPage({ searchParams }: Props) {
  const params = await searchParams;
  const { services, locations } = await getCurrentSiteConfig();

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold">Services</h1>
        <Link
          href="/admin/services/new"
          className="rounded-lg bg-[#c5eb02] text-black text-sm font-semibold px-4 py-2 hover:bg-[#c5eb02]/80"
        >
          + New Service
        </Link>
      </div>
      <p className="text-white/50 mb-6 text-sm">
        One page per service at /services/[service]. Each is also shown in {locations.length} areas —
        those versions are edited from the service or from the area. The{" "}
        <Link href="/admin/content/services" className="underline hover:text-white">
          /services listing page
        </Link>{" "}
        itself is edited under Pages.
      </p>

      <SaveBanner saved={params.deleted === "1"} error={params.error} />

      <ul className="bg-[#101314] border border-white/10 rounded-xl divide-y divide-white/10">
        {services.map((service) => (
          <li key={service.slug} className="flex items-center justify-between gap-4 px-5 py-3">
            <Link href={`/admin/services/${service.slug}`} className="min-w-0 group">
              <p className="font-semibold text-white group-hover:text-[#c5eb02] truncate">
                {service.title}
              </p>
              <p className="text-xs text-white/40 truncate">/services/{service.slug}</p>
            </Link>
            <div className="flex shrink-0 items-center gap-4 text-xs font-semibold">
              <a
                href={`/services/${service.slug}`}
                target="_blank"
                rel="noreferrer"
                className="text-white/50 hover:text-white"
              >
                View ↗
              </a>
              <Link
                href={`/admin/services/${service.slug}`}
                className="rounded-lg border border-white/15 px-3 py-1.5 text-white hover:border-[#c5eb02]"
              >
                Edit page
              </Link>
            </div>
          </li>
        ))}
        {services.length === 0 && <li className="px-5 py-4 text-sm text-white/40">No services yet.</li>}
      </ul>
    </div>
  );
}
