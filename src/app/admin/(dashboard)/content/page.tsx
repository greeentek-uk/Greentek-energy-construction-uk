import Link from "next/link";
import { getCurrentSiteConfig, getCurrentBlogPosts } from "@/lib/cms";
import { listBlocksWithDirty } from "@/lib/db/pageContent";
import { getPages } from "@/lib/db/pages";
import { CONTENT_PAGES, UNUSED_BLOCKS } from "@/data/adminPages";
import { PAGE_CONTENT_META } from "@/data/pageContent";
import SaveBanner from "../../_components/SaveBanner";

interface Props {
  searchParams: Promise<{ published?: string; error?: string }>;
}

/**
 * The panel's front door for content: every page on the site, and where to
 * edit it. Fixed pages (home, about, the listing pages) open a list of their
 * sections in page order; pages that come in sets (services, locations,
 * projects, posts) open their own list.
 */
export default async function ContentHubPage({ searchParams }: Props) {
  const [params, site, posts, pages, blocks] = await Promise.all([
    searchParams,
    getCurrentSiteConfig(),
    getCurrentBlogPosts(),
    getPages(),
    listBlocksWithDirty(),
  ]);
  const dirty = new Set(blocks.filter((b) => b.dirty).map((b) => b.key));

  const collections = [
    {
      href: "/admin/services",
      label: "Service pages",
      detail: `${site.services.length} pages at /services/…`,
    },
    {
      href: "/admin/locations",
      label: "Location pages",
      detail: `${site.locations.length} areas, each with ${site.services.length} service pages`,
    },
    { href: "/admin/projects", label: "Project pages", detail: `${site.projects.length} pages at /projects/…` },
    { href: "/admin/blog", label: "Blog posts", detail: `${posts.length} posts` },
    { href: "/admin/pages", label: "Other pages", detail: `${pages.length} pages made in the panel` },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Pages</h1>
      <p className="text-white/50 mb-6 text-sm">
        Pick the page you want to change, then the section on it. Sections shared by several pages
        say so in their editor. Changes to these sections save as drafts — nothing goes live until
        you click Publish Changes in the sidebar.
      </p>

      <SaveBanner error={params.error} />
      {params.published !== undefined && (
        <p className="-mt-4 mb-6 text-sm text-white/50">
          Published {params.published} section{params.published === "1" ? "" : "s"}.
        </p>
      )}

      <h2 className="text-sm font-bold uppercase text-white/50 mb-3">Single pages</h2>
      <ul className="grid gap-3 sm:grid-cols-2 mb-8">
        {CONTENT_PAGES.map((page) => {
          const pending = page.sections.filter((s) => dirty.has(s.key)).length;
          return (
            <li key={page.id}>
              <Link
                href={`/admin/content/${page.id}`}
                className="block h-full rounded-xl border border-white/10 bg-[#101314] px-4 py-3 hover:border-[#c5eb02]"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-white">{page.label}</p>
                  {pending > 0 && (
                    <span className="text-[10px] font-bold uppercase text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full">
                      {pending} unpublished
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/40">
                  {page.id === "shared" ? "Every service & location page" : page.path} ·{" "}
                  {page.sections.length} section{page.sections.length === 1 ? "" : "s"}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>

      <h2 className="text-sm font-bold uppercase text-white/50 mb-3">Pages that come in sets</h2>
      <ul className="bg-[#101314] border border-white/10 rounded-xl divide-y divide-white/10 mb-8">
        {collections.map((c) => (
          <li key={c.href}>
            <Link href={c.href} className="flex items-center justify-between px-4 py-3 hover:bg-white/5">
              <span className="font-medium text-white">{c.label}</span>
              <span className="text-xs text-white/40">{c.detail}</span>
            </Link>
          </li>
        ))}
      </ul>

      {UNUSED_BLOCKS.length > 0 && (
        <>
          <h2 className="text-sm font-bold uppercase text-white/50 mb-1">Not on any page</h2>
          <p className="text-xs text-white/40 mb-3">Kept in case they&apos;re used again; editing them changes nothing live.</p>
          <ul className="flex flex-wrap gap-2">
            {UNUSED_BLOCKS.map((key) => (
              <li key={key}>
                <Link
                  href={`/admin/page-content/${key}`}
                  className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60 hover:text-white"
                >
                  {PAGE_CONTENT_META[key].label}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
