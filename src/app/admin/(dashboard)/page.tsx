import Link from "next/link";
import { getCurrentSiteConfig, getCurrentBlogPosts } from "@/lib/cms";
import { listBlocksWithDirty } from "@/lib/db/pageContent";
import { getRedirects } from "@/lib/db/redirects";
import { getNotFoundEntries } from "@/lib/db/notFoundLog";
import { getPages } from "@/lib/db/pages";
import { refreshLiveSiteAction } from "../_actions/cache";

interface Props {
  searchParams: Promise<{ cache?: string; message?: string }>;
}

export default async function AdminHomePage({ searchParams }: Props) {
  const params = await searchParams;
  const [site, posts, pageContentBlocks, redirects, notFound] = await Promise.all([
    getCurrentSiteConfig(),
    getCurrentBlogPosts(),
    listBlocksWithDirty(),
    getRedirects(),
    getNotFoundEntries(),
  ]);
  const pageCount = (await getPages()).length;
  const redirectCount = redirects.length;
  const notFoundCount = notFound.filter((entry) => !entry.resolved).length;
  const dirtyCount = pageContentBlocks.filter((b) => b.dirty).length;

  const cards = [
    { href: "/admin/seo", label: "Page SEO", count: "Meta titles & descriptions" },
    {
      href: "/admin/page-content",
      label: "Page Content",
      count: dirtyCount > 0 ? `${dirtyCount} unpublished change${dirtyCount === 1 ? "" : "s"}` : "Shared sections & page headers",
    },
    { href: "/admin/pages", label: "Pages", count: `${pageCount} pages` },
    { href: "/admin/menus", label: "Menus", count: "Header & footer links" },
    { href: "/admin/footer-cta", label: "Footer CTA", count: "Footer heading & buttons, per page" },
    { href: "/admin/blog", label: "Blog Posts", count: `${posts.length} posts` },
    { href: "/admin/services", label: "Services", count: `${site.services.length} services` },
    { href: "/admin/projects", label: "Projects", count: `${site.projects.length} projects` },
    { href: "/admin/locations", label: "Locations", count: `${site.locations.length} areas` },
    { href: "/admin/seo-settings", label: "SEO Settings", count: "Templates, social & verification" },
    { href: "/admin/schema", label: "Schema (JSON-LD)", count: "Structured data per page" },
    { href: "/admin/sitemap", label: "Sitemap", count: "What's included & excluded" },
    {
      href: "/admin/redirects",
      label: "Redirects & 404s",
      count: `${redirectCount} redirects · ${notFoundCount} missing pages`,
    },
    { href: "/admin/local-seo", label: "Local SEO", count: "Hours, coordinates & service area" },
    { href: "/admin/scripts", label: "Scripts & Tracking", count: "Analytics, pixels & tags" },
    { href: "/admin/site-files", label: "robots.txt & llms.txt", count: "Crawler & AI instructions" },
    { href: "/admin/media", label: "Media", count: "Images & alt text coverage" },
    { href: "/admin/images", label: "Image Delivery", count: "Cloudinary compression & sizing" },
    { href: "/admin/revisions", label: "Version History", count: "Undo a bad edit" },
    { href: "/admin/settings", label: "Company Settings", count: "Phone, email, social & more" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
      <p className="text-white/50 mb-8">
        Edit the live site&apos;s content, blog, and SEO without touching
        code. Most changes go live immediately — Page Content edits save as
        drafts until you click Publish Changes in the sidebar.
      </p>
      {params.cache === "refreshed" && (
        <div className="mb-6 text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3">
          Live site cache cleared. Every page will rebuild from the current content on its
          next visit.
        </div>
      )}
      {params.cache === "error" && (
        <div className="mb-6 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
          <strong>Couldn&apos;t reach the live site:</strong> {params.message}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="block rounded-xl border border-white/10 bg-[#101314] p-5 hover:border-white/20 hover:shadow-sm transition-all"
          >
            <p className="font-semibold text-white">{card.label}</p>
            <p className="text-sm text-white/50 mt-1">{card.count}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-white/10 bg-[#101314] p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-white">Live site cache</p>
          <p className="text-sm text-white/50 mt-1 max-w-xl">
            Your changes refresh the live site automatically as you save them. Use this only
            if something you published still looks old.
          </p>
        </div>
        <form action={refreshLiveSiteAction}>
          <button
            type="submit"
            className="rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-white/80 hover:text-white hover:border-[#c5eb02]/50 transition-colors"
          >
            Refresh live site
          </button>
        </form>
      </div>
    </div>
  );
}
