import type { ReactNode } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageSchema from "@/components/site/PageSchema";

/**
 * Shell for the legal pages (privacy, terms). They used to be white pages with
 * Tailwind's green-600 and tiny uppercase headings — the only light pages on a
 * dark site, so following the footer link felt like leaving it. They now use
 * the same title hero as the blog and the dark body every other page has.
 */
export default function LegalPage({
  path,
  title,
  highlight,
  intro,
  children,
}: {
  path: string;
  title: string;
  /** Last word(s) of the H1, shown in the brand colour like the other title heroes. */
  highlight: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <PageSchema path={path} />
      <Header />
      <main className="flex-1">
        <section className="relative bg-[url('/images/footer/footer-bg.webp')] bg-cover overflow-hidden">
          <div className="bg-black/60 pt-30 py-20">
            <div className="mx-auto max-w-5xl px-6 text-center relative z-10">
              <h1 className="text-[2rem] md:text-[3.5rem] font-bold leading-[1.15] text-white mb-4">
                {title} <span className="text-[#c5eb02]">{highlight}</span>
              </h1>
              <p className="text-[15px] md:text-base text-white/80 max-w-2xl mx-auto leading-relaxed font-normal">
                {intro}
              </p>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-20">
          <div className="site-container">
            <div className="site-prose space-y-10 text-base leading-relaxed text-white/75">{children}</div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export function LegalSection({
  heading,
  id,
  children,
}: {
  heading: string;
  id?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={`space-y-4 ${id ? "scroll-mt-28" : ""}`}>
      <h2 className="text-xl md:text-2xl font-bold leading-tight text-white">{heading}</h2>
      {children}
    </section>
  );
}

/** Bulleted list in the legal pages' body style (hanging indent, lime markers). */
export function LegalList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc list-outside space-y-2 pl-5 marker:text-[#c5eb02]">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}
