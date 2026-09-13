import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getBreadcrumbSettings } from "@/lib/db/breadcrumbs";
import { SITE_URL } from "@/lib/structuredData";

export interface Crumb {
  label: string;
  /** Omitted on the final crumb, which is the current page. */
  href?: string;
}

/**
 * Visual breadcrumb trail plus its matching BreadcrumbList JSON-LD.
 *
 * The two are emitted together on purpose: Google only shows breadcrumbs in a
 * result when the markup matches what's on the page, so generating them from
 * one source keeps them from drifting apart.
 */
export default async function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  const settings = await getBreadcrumbSettings();
  if (!settings.enabled || crumbs.length === 0) return null;

  const trail: Crumb[] = settings.showHome
    ? [{ label: settings.homeLabel, href: "/" }, ...crumbs]
    : crumbs;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.label,
      ...(crumb.href ? { item: `${SITE_URL}${crumb.href}` } : {}),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <nav aria-label="Breadcrumb" className="px-5 sm:px-15 py-3">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-white/50">
          {trail.map((crumb, index) => {
            const isLast = index === trail.length - 1;
            return (
              <li key={`${crumb.label}-${index}`} className="flex items-center gap-1.5">
                {index > 0 &&
                  (settings.separator === "chevron" ? (
                    <ChevronRight className="h-3.5 w-3.5 text-white/30" aria-hidden />
                  ) : (
                    <span className="text-white/30" aria-hidden>
                      {settings.separator}
                    </span>
                  ))}
                {crumb.href && !isLast ? (
                  <Link href={crumb.href} className="hover:text-white transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-white/80" aria-current={isLast ? "page" : undefined}>
                    {crumb.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
