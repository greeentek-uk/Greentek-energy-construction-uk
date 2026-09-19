import Image from "next/image";
import Link from "next/link";
import type { ContentBlock } from "@/data/content";

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

export default function ContentBlocks({ blocks }: { blocks?: ContentBlock[] }) {
  if (!blocks || blocks.length === 0) return null;

  return (
    // site-prose: callers now place this in the full-width site container, so
    // the body copy holds its own reading width, left-aligned to the page edge.
    <article className="prose prose-invert site-prose">
      {blocks.map((block, idx) => {
        if (block.type === "heading") {
          const Tag = block.level === 3 ? "h3" : "h2";
          return (
            <Tag
              key={idx}
              className={
                block.level === 3
                  ? `text-xl md:text-2xl font-bold leading-snug text-white mt-8 mb-4 ${richLinks}`
                  : `text-[1.625rem] md:text-[2.5rem] font-bold leading-[1.2] text-white mt-12 mb-6 ${richLinks}`
              }
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
