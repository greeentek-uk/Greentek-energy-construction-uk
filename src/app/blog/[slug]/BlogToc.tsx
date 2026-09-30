import type { TocEntry } from "@/lib/toc";

/**
 * The post's table of contents: a sticky card beside the article on desktop,
 * a collapsible block under the cover image on phones. Plain anchor links to
 * the heading ids ContentBlocks renders — no script needed to jump.
 */
function Entries({ entries }: { entries: TocEntry[] }) {
  const top = Math.min(...entries.map((e) => e.level));
  return (
    <ol className="space-y-1">
      {entries.map((entry) => (
        <li key={entry.id} style={{ paddingLeft: `${(entry.level - top) * 0.875}rem` }}>
          <a
            href={`#${entry.id}`}
            className={`block rounded-md px-2 py-1.5 leading-snug transition-colors hover:bg-white/5 hover:text-[#c5eb02] ${
              entry.level === top ? "text-sm font-semibold text-white/85" : "text-[13px] text-white/60"
            }`}
          >
            {entry.label}
          </a>
        </li>
      ))}
    </ol>
  );
}

export function BlogTocAside({ entries, title }: { entries: TocEntry[]; title: string }) {
  return (
    // Sticky beside the article; scrolls on its own if the list is long.
    <aside className="hidden lg:block lg:sticky lg:top-28 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-xl border border-white/10 bg-[#101314] p-5">
      <nav aria-label="Table of contents">
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-white/50">{title}</p>
        <Entries entries={entries} />
      </nav>
    </aside>
  );
}

export function BlogTocInline({ entries, title }: { entries: TocEntry[]; title: string }) {
  return (
    <details className="lg:hidden mt-6 rounded-xl border border-white/10 bg-[#101314] p-4 group">
      <summary className="cursor-pointer list-none flex items-center justify-between text-sm font-bold text-white">
        {title}
        <span className="text-white/50 transition-transform group-open:rotate-180">⌄</span>
      </summary>
      <nav aria-label="Table of contents" className="mt-3">
        <Entries entries={entries} />
      </nav>
    </details>
  );
}
