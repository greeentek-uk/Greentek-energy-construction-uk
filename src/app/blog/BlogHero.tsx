import type { ReactNode } from "react";

/**
 * The blog's title hero, shared by /blog and the category pages so they read
 * as one section of the site. Keeps its original widths: heroes are exempt
 * from site-container by the owner's decision (see CLAUDE.md).
 */
export default function BlogHero({ title, intro }: { title: ReactNode; intro: string }) {
  return (
    <section className="relative bg-[url('/images/footer/footer-bg.webp')] bg-cover overflow-hidden">
      <div className="bg-black/60 pt-30 py-20">
        <div className="absolute top-0 right-0 w-80 h-80 bg-green-500/10 rounded-full blur-3xl" />
        <div className="mx-auto max-w-5xl px-6 text-center relative z-10">
          <h1 className="text-[2rem] md:text-[3.5rem] font-bold leading-[1.15] text-white mb-4">{title}</h1>
          <p className="text-[15px] md:text-base text-white/80 max-w-2xl mx-auto leading-relaxed font-normal">
            {intro}
          </p>
        </div>
      </div>
    </section>
  );
}
