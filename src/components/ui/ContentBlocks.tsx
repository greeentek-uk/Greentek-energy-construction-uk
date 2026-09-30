import Image from "next/image";
import Link from "@/components/ui/Link";
import type { ContentBlock } from "@/data/content";
import { headingAnchors, headingLevel } from "@/lib/toc";

/**
 * Renders a block array shared by blog posts, services, locations and pages.
 *
 * `text` and list items carry inline HTML (bold, italic, links) that was
 * sanitized to a narrow allowlist when it was saved, so it is injected here
 * rather than escaped — that's what makes in-copy internal links possible.
 */
function Rich({ html, className }: { html: string; className?: string }) {
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

const richLinks =
  "[&_a]:text-[#c5eb02] [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-[#c5eb02]/80 [&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic";

/** A clear step down in size per level, so the hierarchy reads on the page. */
const HEADING_CLASSES: Record<number, string> = {
  1: "text-[2rem] md:text-[3rem] font-bold leading-[1.15] text-white mt-12 mb-6",
  2: "text-[1.625rem] md:text-[2.5rem] font-bold leading-[1.2] text-white mt-12 mb-6",
  3: "text-xl md:text-2xl font-bold leading-snug text-white mt-8 mb-4",
  4: "text-lg md:text-xl font-bold leading-snug text-white mt-7 mb-3",
  5: "text-base md:text-lg font-bold leading-snug text-white mt-6 mb-2",
  6: "text-sm md:text-base font-bold uppercase tracking-wide text-white/80 mt-6 mb-2",
};

export default function ContentBlocks({
  blocks: all,
  omit,
}: {
  blocks?: ContentBlock[];
  /** Block types this page doesn't show — blog posts leave out "cta". */
  omit?: ContentBlock["type"][];
}) {
  const blocks = omit?.length ? all?.filter((b) => !omit.includes(b.type)) : all;
  if (!blocks || blocks.length === 0) return null;
  const anchors = headingAnchors(blocks);

  return (
    // site-prose: callers now place this in the full-width site container, so
    // the body copy holds its own reading width, left-aligned to the page edge.
    <article className="prose prose-invert site-prose">
      {blocks.map((block, idx) => {
        if (block.type === "heading") {
          const level = headingLevel(block);
          const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
          return (
            <Tag
              key={idx}
              // The id is what the table of contents links to; scroll-mt keeps
              // the heading clear of the sticky header when jumped to.
              id={anchors[idx]}
              className={`scroll-mt-28 ${HEADING_CLASSES[level]} ${richLinks}`}
              dangerouslySetInnerHTML={{ __html: block.text ?? "" }}
            />
          );
        }

        if (block.type === "paragraph") {
          return (
            <p
              key={idx}
              className={`text-lg text-white/80 leading-relaxed mb-6 font-medium ${richLinks}`}
              dangerouslySetInnerHTML={{ __html: block.text ?? "" }}
            />
          );
        }

        if (block.type === "quote") {
          return (
            <blockquote
              key={idx}
              className={`my-8 border-l-4 border-[#c5eb02] pl-6 text-xl md:text-2xl text-white font-medium leading-snug ${richLinks}`}
              dangerouslySetInnerHTML={{ __html: block.text ?? "" }}
            />
          );
        }

        if (block.type === "list") {
          const Tag = block.ordered ? "ol" : "ul";
          return (
            <Tag
              key={idx}
              className={`space-y-4 mb-8 ${block.ordered ? "list-decimal" : "list-disc"} list-inside`}
            >
              {block.items?.map((item, itemIdx) => (
                <li
                  key={itemIdx}
                  className={`text-lg text-white/80 leading-relaxed font-medium ${richLinks}`}
                >
                  <Rich html={item} />
                </li>
              ))}
            </Tag>
          );
        }

        if (block.type === "image" && block.src) {
          return (
            <figure key={idx} className="my-10">
              <div className="relative w-full overflow-hidden rounded-xl border border-white/10">
                <Image
                  src={block.src}
                  alt={block.alt ?? ""}
                  width={1200}
                  height={675}
                  sizes="(min-width: 1024px) 760px, 100vw"
                  className="w-full h-auto object-cover"
                />
              </div>
              {block.caption && (
                <figcaption className="mt-3 text-sm text-white/50 text-center">
                  {block.caption}
                </figcaption>
              )}
            </figure>
          );
        }

        if (block.type === "table" && block.rows?.length) {
          const header = block.headerRow !== false && block.rows.length > 1;
          const head = header ? block.rows[0] : null;
          const body = header ? block.rows.slice(1) : block.rows;
          return (
            // A real <table>, not a grid of divs: it's what search engines lift
            // into comparison snippets. Wide tables scroll inside this box on a
            // phone — overflow-x here is fine, nothing sticky lives inside it.
            <figure key={idx} className="not-prose my-10">
              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full min-w-lg border-collapse text-left text-base">
                  {block.caption && (
                    <caption className="caption-bottom px-4 py-3 text-sm text-white/50 text-left">
                      {block.caption}
                    </caption>
                  )}
                  {head && (
                    <thead className="bg-white/5">
                      <tr>
                        {head.map((cell, c) => (
                          <th
                            key={c}
                            scope="col"
                            className={`border-b border-white/15 px-4 py-3 font-bold text-white ${richLinks}`}
                          >
                            <Rich html={cell} />
                          </th>
                        ))}
                      </tr>
                    </thead>
                  )}
                  <tbody>
                    {body.map((row, r) => (
                      <tr key={r} className="border-b border-white/10 last:border-b-0 even:bg-white/2">
                        {row.map((cell, c) => (
                          <td
                            key={c}
                            className={`px-4 py-3 align-top text-white/80 leading-relaxed ${richLinks}`}
                          >
                            <Rich html={cell} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </figure>
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
              <p
                className={`text-lg text-white/80 mb-8 font-medium ${richLinks}`}
                dangerouslySetInnerHTML={{
                  __html:
                    block.text ||
                    "Discover how Greentek can help you achieve your energy and construction goals.",
                }}
              />
              <Link
                href={block.ctaLink || "/contact"}
                className="inline-block rounded-lg bg-[#c5eb02] px-8 py-4 font-semibold text-black hover:bg-[#c5eb02]/80 transition-colors"
              >
                {block.ctaText || "Get a Free Quote"}
              </Link>
            </div>
          );
        }

        return null;
      })}
    </article>
  );
}
