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
      <p className="text-zinc-500 mb-8 text-sm">
        Set a custom meta title/description for any page. Pages without an
        override use the site&apos;s built-in default copy.
      </p>

      {groups.map((group) => (
        <div key={group} className="mb-8">
          <h2 className="text-sm font-bold uppercase text-zinc-500 mb-3">
            {group}
          </h2>
          <div className="bg-white border border-zinc-200 rounded-xl divide-y divide-zinc-100">
            {routes
              .filter((r) => r.group === group)
              .map((r) => (
                <div
                  key={r.path}
                  className="flex items-center justify-between gap-4 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-900 truncate">
                      {r.label}
                    </p>
                    <p className="text-xs text-zinc-400 truncate">{r.path}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {overrides[r.path] && (
                      <span className="text-[10px] font-bold uppercase text-green-700 bg-green-50 px-2 py-1 rounded-full">
                        Custom
                      </span>
                    )}
                    <Link
                      href={`/admin/seo/edit?path=${encodeURIComponent(r.path)}`}
                      className="text-sm font-semibold text-zinc-900 hover:underline"
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
