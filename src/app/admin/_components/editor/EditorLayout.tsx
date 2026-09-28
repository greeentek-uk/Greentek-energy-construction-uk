import type { ReactNode } from "react";

/**
 * The frame every page editor (service, location, location + service) shares.
 *
 * These forms each run to a dozen sections. As one undivided column, with every
 * heading and label pooled in a box at the bottom, nobody could find the field
 * for the thing they were looking at on the live page. So the editor now reads
 * top to bottom in the same order as the page, each section a card holding its
 * copy *and* its headings, with a sticky jump menu above and a sticky Save
 * below.
 *
 * No hooks, so it renders inside the client form components as-is.
 */

export interface EditorSectionLink {
  id: string;
  title: string;
}

/** Sticky row of links to each section, in page order. */
export function EditorNav({ sections }: { sections: EditorSectionLink[] }) {
  return (
    <nav
      aria-label="Sections on this page"
      className="sticky top-0 z-20 -mx-2 mb-6 bg-black/95 backdrop-blur border-b border-white/10 px-2 py-3"
    >
      <p className="text-[10px] font-bold uppercase tracking-wide text-white/40 mb-2">
        Sections, in page order
      </p>
      <div className="flex flex-wrap gap-1.5">
        {sections.map((section, i) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/70 hover:border-[#c5eb02] hover:text-white transition-colors"
          >
            <span className="text-white/35 mr-1">{i + 1}</span>
            {section.title}
          </a>
        ))}
      </div>
    </nav>
  );
}

/** One section of the page: its copy and its headings together. */
export function EditorSection({
  id,
  number,
  title,
  description,
  children,
}: {
  id: string;
  number?: number;
  title: string;
  /** Where this appears on the page, and what falls back to what. */
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    // scroll-mt clears the sticky nav when jumped to.
    <section
      id={id}
      className="scroll-mt-40 rounded-xl border border-white/10 bg-[#101314] p-5 md:p-6 space-y-4"
    >
      <header>
        <h2 className="text-base font-bold text-white">
          {number !== undefined && <span className="text-[#c5eb02] mr-2">{number}.</span>}
          {title}
        </h2>
        {description && <p className="mt-1 text-xs text-white/50">{description}</p>}
      </header>
      {children}
    </section>
  );
}

/** Save stays in reach at the bottom of the screen, wherever the editor is scrolled to. */
export function SaveBar({ label = "Save", liveHref }: { label?: string; liveHref?: string }) {
  return (
    <div className="sticky bottom-0 z-20 -mx-2 mt-6 flex items-center justify-between gap-4 border-t border-white/10 bg-black/95 backdrop-blur px-2 py-3">
      {liveHref ? (
        <a
          href={liveHref}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-white/60 hover:text-white"
        >
          View live page ↗
        </a>
      ) : (
        <span />
      )}
      <button
        type="submit"
        className="rounded-lg bg-[#c5eb02] text-black text-sm font-semibold px-6 py-2.5 hover:bg-[#c5eb02]/80"
      >
        {label}
      </button>
    </div>
  );
}

/**
 * Renders the nav plus numbered sections from one list, so the menu and the
 * sections can't disagree about order or names.
 */
export function EditorSections({
  sections,
}: {
  sections: (EditorSectionLink & { description?: ReactNode; content: ReactNode })[];
}) {
  return (
    <>
      <EditorNav sections={sections} />
      <div className="space-y-5">
        {sections.map((section, i) => (
          <EditorSection
            key={section.id}
            id={section.id}
            number={i + 1}
            title={section.title}
            description={section.description}
          >
            {section.content}
          </EditorSection>
        ))}
      </div>
    </>
  );
}

/** The header every page editor opens with: where you are, and the live page. */
export function EditorHeader({
  crumbs,
  title,
  livePath,
  actions,
  children,
}: {
  crumbs: { label: string; href?: string }[];
  title: string;
  livePath?: string;
  actions?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="mb-6">
      <nav aria-label="Breadcrumb" className="text-sm text-white/50 flex flex-wrap gap-1.5">
        {crumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-white/25">/</span>}
            {crumb.href ? (
              <a href={crumb.href} className="hover:text-white">
                {crumb.label}
              </a>
            ) : (
              <span className="text-white/70">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{title}</h1>
        <div className="flex items-center gap-4">
          {livePath && (
            <a
              href={livePath}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-white/60 hover:text-white"
            >
              {livePath} ↗
            </a>
          )}
          {actions}
        </div>
      </div>
      {children}
    </div>
  );
}
