import Link from "next/link";
import { notFound } from "next/navigation";
import { listBlocksWithDirty } from "@/lib/db/pageContent";
import { getContentPage, pagesShowingBlock } from "@/data/adminPages";
import { PAGE_CONTENT_META } from "@/data/pageContent";
import { EditorHeader } from "../../../_components/editor/EditorLayout";

interface Props {
  params: Promise<{ pageId: string }>;
}

/** One fixed page's sections, top to bottom, each opening its editor. */
export default async function ContentPageSections({ params }: Props) {
  const { pageId } = await params;
  const page = getContentPage(pageId);
  if (!page) notFound();

  const blocks = await listBlocksWithDirty();
  const dirty = new Set(blocks.filter((b) => b.dirty).map((b) => b.key));
  const isShared = page.id === "shared";

  return (
    <div>
      <EditorHeader
        crumbs={[{ label: "Pages", href: "/admin/content" }, { label: page.label }]}
        title={page.label}
        livePath={isShared ? undefined : page.path}
      >
        <p className="mt-2 text-sm text-white/60">
          {isShared
            ? "Shown on every service, location and location + service page. A page can give itself its own stats and process steps in its editor."
            : "Sections in the order they appear on the page."}
        </p>
      </EditorHeader>

      <ol className="bg-[#101314] border border-white/10 rounded-xl divide-y divide-white/10">
        {page.sections.map((section, i) => {
          const others = pagesShowingBlock(section.key).filter((p) => p.id !== page.id);
          return (
            <li key={`${section.key}-${i}`}>
              <Link
                href={`/admin/page-content/${section.key}`}
                className="flex items-center gap-4 px-4 py-3 hover:bg-white/5"
              >
                <span className="w-6 shrink-0 text-sm font-bold text-[#c5eb02]">{i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-white">
                    {PAGE_CONTENT_META[section.key].label}
                  </span>
                  {section.note && <span className="block text-xs text-white/50">{section.note}</span>}
                  {others.length > 0 && (
                    <span className="block text-xs text-white/35">
                      Also on: {others.map((p) => p.label).join(", ")}
                    </span>
                  )}
                </span>
                {dirty.has(section.key) && (
                  <span className="shrink-0 text-[10px] font-bold uppercase text-amber-300 bg-amber-500/10 px-2 py-1 rounded-full">
                    Unpublished
                  </span>
                )}
                <span className="shrink-0 text-xs font-semibold text-white/60">Edit →</span>
              </Link>
            </li>
          );
        })}
      </ol>

      {page.children && (
        <Link
          href={page.children.href}
          className="mt-4 inline-block rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-white hover:border-[#c5eb02]"
        >
          {page.children.label} →
        </Link>
      )}
    </div>
  );
}
