import { getMenus } from "@/lib/db/menus";
import { getCurrentSiteConfig } from "@/lib/cms";
import { getPages } from "@/lib/db/pages";
import SaveBanner from "../../_components/SaveBanner";
import MenuEditor from "../../_components/MenuEditor";

interface Props {
  searchParams: Promise<{ saved?: string; error?: string }>;
}

export default async function MenusPage({ searchParams }: Props) {
  const [params, menus, site, pages] = await Promise.all([
    searchParams,
    getMenus(),
    getCurrentSiteConfig(),
    getPages(),
  ]);

  // Everything real that can be linked to, so nobody has to type a URL and
  // typo their way into a broken nav item.
  const suggestions = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "Projects", href: "/projects" },
    { label: "Locations", href: "/locations" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    ...pages.filter((p) => p.published).map((p) => ({ label: p.title, href: `/${p.slug}` })),
    ...site.services.map((s) => ({ label: s.shortName, href: `/services/${s.slug}` })),
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Menus</h1>
      <p className="text-white/50 mb-6 text-sm">
        The links in the header and footer, shown on every page.
      </p>

      <SaveBanner saved={params.saved === "1"} error={params.error} />

      <MenuEditor initial={menus} suggestions={suggestions} />
    </div>
  );
}
