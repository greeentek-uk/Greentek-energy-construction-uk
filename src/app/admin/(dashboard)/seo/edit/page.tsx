import Link from "next/link";
import { getSeoOverride } from "@/lib/seo";
import { saveSeoOverrideAction } from "../../../_actions/seo";
import SaveBanner from "../../../_components/SaveBanner";

interface Props {
  searchParams: Promise<{ path?: string; saved?: string; error?: string }>;
}

export default async function EditSeoPage({ searchParams }: Props) {
  const params = await searchParams;
  const path = params.path || "/";
  const override = await getSeoOverride(path);

  return (
    <div>
      <Link
        href="/admin/seo"
        className="text-sm text-zinc-500 hover:text-zinc-900"
      >
        ← All Pages
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-1 break-all">
        Edit SEO: {path}
      </h1>
      <p className="text-zinc-500 mb-6 text-sm">
        Leave a field blank to use the site&apos;s default for this page.
      </p>

      <SaveBanner saved={params.saved === "1"} error={params.error} />

      <form
        action={saveSeoOverrideAction}
        className="space-y-4 bg-white border border-zinc-200 rounded-xl p-6"
      >
        <input type="hidden" name="path" value={path} />
        <div>
          <label className="block text-xs font-semibold text-zinc-600 mb-1">
            Meta Title
          </label>
          <input
            name="title"
            defaultValue={override?.title || ""}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
            placeholder="Leave blank for default"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-600 mb-1">
            Meta Description
          </label>
          <textarea
            name="description"
            defaultValue={override?.description || ""}
            rows={3}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
            placeholder="Leave blank for default"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-zinc-900 text-white text-sm font-semibold px-5 py-2.5 hover:bg-zinc-800"
        >
          Save
        </button>
      </form>
    </div>
  );
}
