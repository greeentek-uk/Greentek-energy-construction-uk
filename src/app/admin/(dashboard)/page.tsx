import Link from "next/link";
import { getCurrentSiteConfig, getCurrentBlogPosts } from "@/lib/cms";

export default async function AdminHomePage() {
  const [site, posts] = await Promise.all([
    getCurrentSiteConfig(),
    getCurrentBlogPosts(),
  ]);

  const cards = [
    { href: "/admin/seo", label: "Page SEO", count: "Meta titles & descriptions" },
    { href: "/admin/blog", label: "Blog Posts", count: `${posts.length} posts` },
    { href: "/admin/services", label: "Services", count: `${site.services.length} services` },
    { href: "/admin/projects", label: "Projects", count: `${site.projects.length} projects` },
    { href: "/admin/locations", label: "Locations", count: `${site.locations.length} areas` },
    { href: "/admin/settings", label: "Company Settings", count: "Phone, email, social & more" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
      <p className="text-zinc-500 mb-8">
        Edit the live site&apos;s content, blog, and SEO without touching
        code. Changes go live immediately — no redeploy required.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="block rounded-xl border border-zinc-200 bg-white p-5 hover:border-zinc-400 hover:shadow-sm transition-all"
          >
            <p className="font-semibold text-zinc-900">{card.label}</p>
            <p className="text-sm text-zinc-500 mt-1">{card.count}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
