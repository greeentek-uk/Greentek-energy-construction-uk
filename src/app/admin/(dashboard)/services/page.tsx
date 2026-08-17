import Link from "next/link";
import { getCurrentSiteConfig } from "@/lib/cms";
import { deleteServiceAction } from "../../_actions/content";
import SaveBanner from "../../_components/SaveBanner";
import ServiceForm from "../../_components/ServiceForm";
import ConfirmSubmitButton from "../../_components/ConfirmSubmitButton";

interface Props {
  searchParams: Promise<{ saved?: string; deleted?: string; error?: string }>;
}

export default async function ServicesAdminPage({ searchParams }: Props) {
  const params = await searchParams;
  const { services } = await getCurrentSiteConfig();

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold">Services</h1>
        <Link
          href="/admin/services/new"
          className="rounded-lg bg-zinc-900 text-white text-sm font-semibold px-4 py-2 hover:bg-zinc-800"
        >
          + New Service
        </Link>
      </div>
      <p className="text-zinc-500 mb-6 text-sm">
        Edit the copy, image, and highlights shown on each service page.
      </p>

      <SaveBanner
        saved={params.saved === "1" || params.deleted === "1"}
        error={params.error}
      />

      <div className="space-y-3">
        {services.map((service) => (
          <div
            key={service.slug}
            className="bg-white border border-zinc-200 rounded-xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4">
              <span className="font-semibold text-zinc-900">{service.title}</span>
              <form action={deleteServiceAction}>
                <input type="hidden" name="slug" value={service.slug} />
                <ConfirmSubmitButton
                  message={`Delete "${service.title}"? This cannot be undone.`}
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
                <ServiceForm initial={service} />
              </div>
            </details>
          </div>
        ))}
        {services.length === 0 && (
          <p className="text-sm text-zinc-400">No services yet.</p>
        )}
      </div>
    </div>
  );
}
