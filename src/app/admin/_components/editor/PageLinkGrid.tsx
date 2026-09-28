import Link from "next/link";

export interface PageLink {
  label: string;
  href: string;
  /** Has copy of its own, rather than all defaults. */
  customised?: boolean;
  /** Marks the page being edited, when the grid includes it. */
  current?: boolean;
}

/**
 * A grid of links to related page editors — a service's six area versions,
 * an area's eleven services — so moving between the pages that share copy is
 * one click rather than a trip back through two lists.
 */
export default function PageLinkGrid({ links }: { links: PageLink[] }) {
  return (
    <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {links.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            aria-current={link.current ? "page" : undefined}
            className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
              link.current
                ? "border-[#c5eb02] bg-[#c5eb02]/10 text-white"
                : "border-white/10 bg-white/5 text-white/80 hover:border-[#c5eb02] hover:text-white"
            }`}
          >
            <span className="truncate">{link.label}</span>
            <span
              className={`shrink-0 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full ${
                link.customised ? "text-green-400 bg-green-500/10" : "text-white/40 bg-white/5"
              }`}
            >
              {link.customised ? "Own copy" : "Defaults"}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
