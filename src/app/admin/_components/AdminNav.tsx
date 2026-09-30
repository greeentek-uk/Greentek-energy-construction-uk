"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  /** Other paths that belong to this item, e.g. a block editor reached from Pages. */
  also?: string[];
  /** Only this exact path, for items whose path prefixes others. */
  exact?: boolean;
}

/**
 * Grouped by what the editor is trying to do. The flat list of twenty items
 * put "Page Content", "Pages", "Services" and "Locations" side by side as if
 * they were different kinds of thing, when all four are "change a page". Now
 * every page on the site is under Pages, and the rest is site-wide settings,
 * SEO, and media.
 */
const GROUPS: { title?: string; items: NavItem[] }[] = [
  { items: [{ href: "/admin", label: "Dashboard", exact: true }] },
  {
    title: "Pages",
    items: [
      { href: "/admin/content", label: "All pages", exact: true, also: ["/admin/page-content"] },
      { href: "/admin/content/home", label: "Home page" },
      { href: "/admin/content/about", label: "About page" },
      { href: "/admin/services", label: "Services", also: ["/admin/content/services"] },
      { href: "/admin/locations", label: "Locations", also: ["/admin/content/locations"] },
      { href: "/admin/projects", label: "Projects", also: ["/admin/content/projects"] },
      { href: "/admin/blog", label: "Blog posts" },
      { href: "/admin/authors", label: "Blog authors" },
      { href: "/admin/pages", label: "Other pages" },
      { href: "/admin/content/shared", label: "Shared sections" },
    ],
  },
  {
    title: "Site-wide",
    items: [
      { href: "/admin/menus", label: "Menus" },
      { href: "/admin/footer-cta", label: "Footer CTA" },
      { href: "/admin/settings", label: "Company settings" },
    ],
  },
  {
    title: "SEO",
    items: [
      { href: "/admin/seo", label: "Page SEO" },
      { href: "/admin/seo-settings", label: "SEO settings" },
      { href: "/admin/schema", label: "Schema (JSON-LD)" },
      { href: "/admin/sitemap", label: "Sitemap" },
      { href: "/admin/redirects", label: "Redirects & 404s" },
      { href: "/admin/local-seo", label: "Local SEO" },
      { href: "/admin/site-files", label: "robots.txt & llms.txt" },
    ],
  },
  {
    title: "Media & tracking",
    items: [
      { href: "/admin/media", label: "Media" },
      { href: "/admin/images", label: "Image delivery" },
      { href: "/admin/scripts", label: "Scripts & tracking" },
      { href: "/admin/revisions", label: "Version history" },
    ],
  },
];

function isActive(item: NavItem, path: string): boolean {
  const under = (base: string) => path === base || path.startsWith(`${base}/`);
  if (item.also?.some(under)) return true;
  return item.exact ? path === item.href : under(item.href);
}

export default function AdminNav({ dirtyCount }: { dirtyCount: number }) {
  const path = usePathname();

  return (
    <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
      {GROUPS.map((group, i) => (
        <div key={group.title ?? i}>
          {group.title && (
            <p className="px-3 mb-1 text-[10px] font-bold uppercase tracking-wide text-white/35">
              {group.title}
            </p>
          )}
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const active = isActive(item, path);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-[#c5eb02]/10 text-[#c5eb02]"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item.label}
                  {item.href === "/admin/content" && dirtyCount > 0 && (
                    <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded-full">
                      {dirtyCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
