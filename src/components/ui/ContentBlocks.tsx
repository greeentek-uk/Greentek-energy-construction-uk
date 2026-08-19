import Link from "next/link";
import type { ContentBlock } from "@/data/content";

/** Renders a block array (heading/paragraph/list/cta) shared by blog posts, services, and locations. */
export default function ContentBlocks({ blocks }: { blocks?: ContentBlock[] }) {
  if (!blocks || blocks.length === 0) return null;

  return (
    <article className="prose prose-invert max-w-none">
      {blocks.map((block, idx) => {
        if (block.type === "heading") {
          return (
            <h2
              key={idx}
              className="text-[1.625rem] md:text-[2.5rem] font-bold leading-[1.2] text-white mt-12 mb-6"
            >
              {block.text}
            </h2>
          );
        }

        if (block.type === "paragraph") {
          return (
            <p
              key={idx}
              className="text-lg text-white/80 leading-relaxed mb-6 font-medium"
            >
              {block.text}
            </p>
          );
        }

        if (block.type === "list") {
          return (
            <ul key={idx} className="space-y-4 mb-8 list-disc list-inside">
              {block.items?.map((item, itemIdx) => (
                <li
                  key={itemIdx}
                  className="text-lg text-white/80 leading-relaxed font-medium"
                >
                  {item}
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === "cta") {
          return (
            <div
              key={idx}
              className="my-12 p-8 md:p-12 bg-white/5 rounded-xl border border-[#c5eb02]"
            >
              <h3 className="text-xl md:text-2xl font-bold text-white mb-4">
                Ready to Get Started?
              </h3>
              <p className="text-lg text-white/80 mb-8 font-medium">
                {block.text ||
                  "Discover how Greentek can help you achieve your energy and construction goals."}
              </p>
              <Link
                href={block.ctaLink || "/contact"}
                className="inline-flex items-center justify-center px-6 md:px-8 py-4 rounded-full bg-[#c5eb02] text-black text-sm font-bold hover:bg-[#c5eb02]/80 transition-all shadow-xl shadow-zinc-900/10"
              >
                {block.ctaText || "Get in Touch"}
              </Link>
            </div>
          );
        }

        return null;
      })}
    </article>
  );
}
