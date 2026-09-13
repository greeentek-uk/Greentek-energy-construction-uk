import Link from "next/link";
import { getAllRoutes } from "@/lib/routes";
import { getCurrentSeoOverrides } from "@/lib/cms";

export default async function SeoListPage() {
  const [routes, overrides] = await Promise.all([
    getAllRoutes(),
    getCurrentSeoOverrides(),
  ]);
  const groups = Array.from(new Set(routes.map((r) => r.group)));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Page SEO</h1>
      <p className="text-white/50 mb-8 text-sm">
        Per-page title, description, canonical, social cards and crawler directives.
        Anything left blank falls back to the site-wide template in{" "}
        <span className="text-white/70">SEO Settings</span>.
      </p>

      {groups.map((group) => (
        <div key={group} className="mb-8">
          <h2 className="text-sm font-bold uppercase text-white/50 mb-3">
            {group}
          </h2>
          <div className="bg-[#101314] border border-white/10 rounded-xl divide-y divide-white/10">
            {routes
              .filter((r) => r.group === group)
              .map((r) => (
                <div
                  key={r.path}
                  className="flex items-center justify-between gap-4 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {r.label}
                    </p>
                    <p className="text-xs text-white/40 truncate">{r.path}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {overrides[r.path]?.noindex && (
                      <span className="text-[10px] font-bold uppercase text-red-400 bg-red-500/10 px-2 py-1 rounded-full">
                        Noindex
                      </span>
                    )}
                    {overrides[r.path] && !overrides[r.path]?.noindex && (
                      <span className="text-[10px] font-bold uppercase text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
                        Custom
                      </span>
                    )}
                    <Link
                      href={`/admin/seo/edit?path=${encodeURIComponent(r.path)}`}
                      className="text-sm font-semibold text-white hover:underline"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
