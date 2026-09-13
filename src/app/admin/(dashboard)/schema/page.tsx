import Link from "next/link";
import { getAllRoutes } from "@/lib/routes";
import { getSchemaOverrides, GLOBAL_SCHEMA_PATH } from "@/lib/db/schemaOverrides";
import SaveBanner from "../../_components/SaveBanner";

interface Props {
  searchParams: Promise<{ deleted?: string; error?: string }>;
}

export default async function SchemaListPage({ searchParams }: Props) {
  const [params, routes, overrides] = await Promise.all([
    searchParams,
    getAllRoutes(),
    getSchemaOverrides(),
  ]);

  const groups = Array.from(new Set(routes.map((r) => r.group)));
  const global = overrides[GLOBAL_SCHEMA_PATH];
  const globalCount = global?.entries.filter((e) => e.enabled).length ?? 0;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Schema (JSON-LD)</h1>
      <p className="text-white/50 mb-6 text-sm">
        Add structured data to any page. Every page already ships schema built from its own
        content — LocalBusiness site-wide, plus Service, Location or BlogPosting where they
        apply — so use this for the extras Google asks for: FAQ, breadcrumbs, reviews.
      </p>

      <SaveBanner saved={params.deleted === "1"} error={params.error} />

      <div className="mb-8">
        <h2 className="text-sm font-bold uppercase text-white/50 mb-3">Site-wide</h2>
        <div className="bg-[#101314] border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-white">Every page</p>
            <p className="text-xs text-white/40">
              Rendered in the layout, on top of the built-in LocalBusiness schema
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {globalCount > 0 && (
              <span className="text-[10px] font-bold uppercase text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
                {globalCount} schema
              </span>
            )}
            <Link
              href={`/admin/schema/edit?path=${encodeURIComponent(GLOBAL_SCHEMA_PATH)}`}
              className="text-sm font-semibold text-white hover:underline"
            >
              Edit
            </Link>
          </div>
        </div>
      </div>

      {groups.map((group) => (
        <div key={group} className="mb-8">
          <h2 className="text-sm font-bold uppercase text-white/50 mb-3">{group}</h2>
          <div className="bg-[#101314] border border-white/10 rounded-xl divide-y divide-white/10">
            {routes
              .filter((r) => r.group === group)
              .map((r) => {
                const override = overrides[r.path];
                const count = override?.entries.filter((e) => e.enabled).length ?? 0;
                return (
                  <div
                    key={r.path}
                    className="flex items-center justify-between gap-4 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{r.label}</p>
                      <p className="text-xs text-white/40 truncate">{r.path}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {count > 0 && override?.replaceDefault && (
                        <span className="text-[10px] font-bold uppercase text-amber-300 bg-amber-500/10 px-2 py-1 rounded-full">
                          Replaces default
                        </span>
                      )}
                      {count > 0 && (
                        <span className="text-[10px] font-bold uppercase text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
                          {count} schema
                        </span>
                      )}
                      <Link
                        href={`/admin/schema/edit?path=${encodeURIComponent(r.path)}`}
                        className="text-sm font-semibold text-white hover:underline"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}
