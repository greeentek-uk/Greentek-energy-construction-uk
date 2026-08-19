import Link from "next/link";
import { getCurrentSiteConfig, getCurrentBlogPosts } from "@/lib/cms";
import { listBlocksWithDirty } from "@/lib/db/pageContent";

export default async function AdminHomePage() {
  const [site, posts, pageContentBlocks] = await Promise.all([
    getCurrentSiteConfig(),
    getCurrentBlogPosts(),
    listBlocksWithDirty(),
  ]);
  const dirtyCount = pageContentBlocks.filter((b) => b.dirty).length;

  const cards = [
    { href: "/admin/seo", label: "Page SEO", count: "Meta titles & descriptions" },
    {
      href: "/admin/page-content",
      label: "Page Content",
      count: dirtyCount > 0 ? `${dirtyCount} unpublished change${dirtyCount === 1 ? "" : "s"}` : "Shared sections & page headers",
    },
    { href: "/admin/blog", label: "Blog Posts", count: `${posts.length} posts` },
    { href: "/admin/services", label: "Services", count: `${site.services.length} services` },
    { href: "/admin/projects", label: "Projects", count: `${site.projects.length} projects` },
    { href: "/admin/locations", label: "Locations", count: `${site.locations.length} areas` },
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
    </div>
  );
}
