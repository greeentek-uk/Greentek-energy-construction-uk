import Link from "next/link";
import { getSeoOverride } from "@/lib/seo";
import { getAllRoutes } from "@/lib/routes";
import { SITE_URL } from "@/lib/structuredData";
import SaveBanner from "../../../_components/SaveBanner";
import SeoOverrideForm from "../../../_components/SeoOverrideForm";

interface Props {
  searchParams: Promise<{ path?: string; saved?: string; error?: string }>;
}

export default async function EditSeoPage({ searchParams }: Props) {
  const params = await searchParams;
  const path = params.path || "/";

  const [override, routes] = await Promise.all([getSeoOverride(path), getAllRoutes()]);
  const route = routes.find((r) => r.path === path);

  return (
    <div>
      <Link href="/admin/seo" className="text-sm text-white/50 hover:text-white">
        ← All Pages
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-1 break-all">
        {route?.label || "Edit SEO"}
      </h1>
      <p className="text-white/50 mb-6 text-sm break-all">{path}</p>

      <SaveBanner saved={params.saved === "1"} error={params.error} />

      <div className="bg-[#101314] border border-white/10 rounded-xl p-6">
        <SeoOverrideForm
          path={path}
          override={override}
          preview={{
            title: route?.label || path,
            description:
              "This page's own description will be used here unless you set one above.",
            url: `${SITE_URL}${path}`,
          }}
        />
      </div>
    </div>
  );
}
