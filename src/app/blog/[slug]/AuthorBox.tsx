import Image from "next/image";
import type { Author } from "@/data/authors";

/**
 * "About the author" at the end of a post: who wrote it and why they know the
 * subject. Only rendered when the post has an author picked in the panel.
 */
export default function AuthorBox({ author }: { author: Author }) {
  const initials = author.name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside
      aria-labelledby="about-the-author"
      className="mt-16 rounded-xl border border-white/10 bg-[#101314] p-6 md:p-8"
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full border-2 border-[#c5eb02] bg-white/5 md:h-36 md:w-36">
          {author.photo ? (
            <Image
              src={author.photo}
              alt={author.photoAlt || author.name}
              fill
              sizes="144px"
              className="object-cover object-center"
            />
          ) : (
            <span className="grid h-full w-full place-items-center text-3xl font-bold text-[#c5eb02]">
              {initials}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p id="about-the-author" className="text-xs font-bold uppercase tracking-wide text-white/50">
            About the author
          </p>
          <p className="mt-2 text-xl md:text-2xl font-bold text-white">
            {author.profileUrl ? (
              <a
                href={author.profileUrl}
                target="_blank"
                rel="noopener noreferrer author"
                className="hover:text-[#c5eb02] transition-colors"
              >
                {author.name}
              </a>
            ) : (
              author.name
            )}
          </p>
          {author.role && <p className="mt-1 text-sm font-semibold italic text-[#c5eb02]">{author.role}</p>}
          {author.bio && (
            <p
              className="mt-4 text-base leading-relaxed text-white/75 [&_a]:text-[#c5eb02] [&_a]:underline [&_b]:font-bold [&_strong]:font-bold [&_b]:text-white [&_strong]:text-white"
              // Sanitized on save (lib/richText.ts), like all panel rich text.
              dangerouslySetInnerHTML={{ __html: author.bio }}
            />
          )}
        </div>
      </div>
    </aside>
  );
}
