import Link from "next/link";
import { listBlocksWithDirty } from "@/lib/db/pageContent";
import { PAGE_CONTENT_META, type PageContentKey } from "@/data/pageContent";
import SaveBanner from "../../_components/SaveBanner";

interface Props {
  searchParams: Promise<{ saved?: string; published?: string; error?: string }>;
}

export default async function PageContentListPage({ searchParams }: Props) {
  const params = await searchParams;
  const blocks = await listBlocksWithDirty();
  const dirtyByKey = new Map(blocks.map((b) => [b.key, b.dirty]));

  const groups: ("Shared Sections" | "Page Headers")[] = ["Shared Sections", "Page Headers"];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Page Content</h1>
      <p className="text-white/50 mb-6 text-sm">
        Edit the copy in shared sections and page headers across the site. Changes save as
        drafts — nothing goes live until you click Publish Changes in the sidebar.
      </p>

      <SaveBanner
        saved={params.saved === "1"}
        error={params.error}
      />
      {params.published !== undefined && (
        <p className="-mt-4 mb-6 text-sm text-white/50">
          Published {params.published} block{params.published === "1" ? "" : "s"}.
        </p>
      )}

      {groups.map((group) => {
        const keys = (Object.keys(PAGE_CONTENT_META) as PageContentKey[]).filter(
          (key) => PAGE_CONTENT_META[key].group === group,
        );

        return (
          <div key={group} className="mb-8">
            <h2 className="text-sm font-bold uppercase text-white/50 mb-3">{group}</h2>
            <div className="bg-[#101314] border border-white/10 rounded-xl divide-y divide-white/10">
              {keys.map((key) => {
                const meta = PAGE_CONTENT_META[key];
                const dirty = dirtyByKey.get(key) ?? false;
                return (
                  <Link
                    key={key}
                    href={`/admin/page-content/${key}`}
                    className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-white/5"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{meta.label}</p>
                      <p className="text-xs text-white/40 truncate">{meta.routes.join(", ")}</p>
                    </div>
                    {dirty && (
                      <span className="shrink-0 text-[10px] font-bold uppercase text-amber-300 bg-amber-500/10 px-2 py-1 rounded-full">
                        Unpublished changes
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
