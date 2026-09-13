import Link from "next/link";
import { getPages } from "@/lib/db/pages";
import { deletePageAction } from "../../_actions/pages";
import SaveBanner from "../../_components/SaveBanner";
import ConfirmSubmitButton from "../../_components/ConfirmSubmitButton";

interface Props {
  searchParams: Promise<{ saved?: string; deleted?: string; error?: string }>;
}

export default async function PagesListPage({ searchParams }: Props) {
  const [params, pages] = await Promise.all([searchParams, getPages()]);

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-1">
        <h1 className="text-2xl font-bold">Pages</h1>
        <Link
          href="/admin/pages/new"
          className="rounded-lg bg-[#c5eb02] text-black text-sm font-semibold px-4 py-2 hover:bg-[#c5eb02]/80"
        >
          + New Page
        </Link>
      </div>
      <p className="text-white/50 mb-6 text-sm">
        Standalone pages — cost guides, a grants hub, a team page. Services, locations,
        projects and blog posts have their own sections.
      </p>

      <SaveBanner saved={Boolean(params.saved || params.deleted)} error={params.error} />

      {pages.length === 0 ? (
        <p className="text-sm text-white/40 bg-[#101314] border border-white/10 rounded-xl px-5 py-10 text-center">
          No pages yet. Create one and it goes live at its own URL.
        </p>
      ) : (
        <div className="bg-[#101314] border border-white/10 rounded-xl divide-y divide-white/10">
          {pages.map((page) => (
            <div key={page.slug} className="flex items-center justify-between gap-4 px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{page.title}</p>
                <p className="text-xs text-white/40 truncate font-mono">/{page.slug}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                    page.published
                      ? "text-green-400 bg-green-500/10"
                      : "text-amber-300 bg-amber-500/10"
                  }`}
                >
                  {page.published ? "Live" : "Draft"}
                </span>
                {page.published && (
                  <a
                    href={`/${page.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-white/50 hover:text-white"
                  >
                    View ↗
                  </a>
                )}
                <Link
                  href={`/admin/pages/${page.slug}`}
                  className="text-sm font-semibold text-white hover:underline"
                >
                  Edit
                </Link>
                <form action={deletePageAction}>
                  <input type="hidden" name="slug" value={page.slug} />
                  <ConfirmSubmitButton
                    message={`Delete "${page.title}"? You'll be able to restore it from Revisions.`}
                    className="text-sm font-semibold text-red-400 hover:underline"
                  >
                    Delete
                  </ConfirmSubmitButton>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
