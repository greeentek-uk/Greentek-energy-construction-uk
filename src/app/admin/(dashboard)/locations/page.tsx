import Link from "next/link";
import { getCurrentSiteConfig } from "@/lib/cms";
import { deleteLocationAction } from "../../_actions/content";
import SaveBanner from "../../_components/SaveBanner";
import LocationForm from "../../_components/LocationForm";
import ConfirmSubmitButton from "../../_components/ConfirmSubmitButton";

interface Props {
  searchParams: Promise<{ saved?: string; deleted?: string; error?: string }>;
}

export default async function LocationsAdminPage({ searchParams }: Props) {
  const params = await searchParams;
  const { locations } = await getCurrentSiteConfig();

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold">Locations</h1>
        <Link
          href="/admin/locations/new"
          className="rounded-lg bg-zinc-900 text-white text-sm font-semibold px-4 py-2 hover:bg-zinc-800"
        >
          + New Location
        </Link>
      </div>
      <p className="text-zinc-500 mb-6 text-sm">
        Edit the areas Greentek covers and the copy shown on each location
        page.
      </p>

      <SaveBanner
        saved={params.saved === "1" || params.deleted === "1"}
        error={params.error}
      />

      <div className="space-y-3">
        {locations.map((location) => (
          <div
            key={location.slug}
            className="bg-white border border-zinc-200 rounded-xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4">
              <span className="font-semibold text-zinc-900">{location.name}</span>
              <form action={deleteLocationAction}>
                <input type="hidden" name="slug" value={location.slug} />
                <ConfirmSubmitButton
                  message={`Delete "${location.name}"? This cannot be undone.`}
                  className="text-xs font-semibold text-red-600 hover:underline"
                >
                  Delete
                </ConfirmSubmitButton>
              </form>
            </div>
            <details>
              <summary className="cursor-pointer px-5 py-2 text-sm text-zinc-500 hover:bg-zinc-50 border-t border-zinc-100">
                Edit details
              </summary>
              <div className="px-5 pb-5 pt-2">
                <LocationForm initial={location} />
              </div>
            </details>
          </div>
        ))}
        {locations.length === 0 && (
          <p className="text-sm text-zinc-400">No locations yet.</p>
        )}
      </div>
    </div>
  );
}
