import Link from "@/components/ui/Link";
import FittedImage from "@/components/ui/FittedImage";
import type { BlogPost } from "@/data/blogs";
import { categoryPath } from "@/lib/blogCategories";

/**
 * One post card — the blog listing, category pages and the "Related articles"
 * row at the end of a post all use this, so they can't drift apart.
 */
export default function BlogCard({ post, sizes }: { post: BlogPost; sizes: string }) {
  return (
    <article className="group rounded-xl overflow-hidden border border-white/10 bg-[#101314] transition-all duration-300 hover:border-[#c5eb02] hover:-translate-y-1 h-full flex flex-col">
      <Link href={`/blog/${post.slug}`} className="relative block aspect-[4/5] shrink-0 overflow-hidden bg-black" tabIndex={-1} aria-hidden="true">
        <FittedImage src={post.coverImage} sizes={sizes} alt={post.coverImageAlt} />
      </Link>
      <div className="p-5 md:p-6 flex flex-col flex-grow">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3 text-xs font-semibold uppercase">
          {post.category && (
            <Link href={categoryPath(post.category)} className="text-[#c5eb02] hover:underline">
              {post.category}
            </Link>
          )}
          <time dateTime={post.date} className="text-white/50">
            {new Date(post.date).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" })}
          </time>
        </div>
        <h3 className="text-lg md:text-xl font-bold text-white leading-snug line-clamp-3 mb-3">
          <Link href={`/blog/${post.slug}`} className="group-hover:text-[#c5eb02] transition-colors">
            {post.title}
          </Link>
        </h3>
        <p className="text-sm md:text-base leading-relaxed line-clamp-3 text-white/70 mb-5">{post.excerpt}</p>
        <Link href={`/blog/${post.slug}`} className="mt-auto text-sm font-bold text-[#c5eb02] hover:text-[#c5eb02]/80">
          Read article →
        </Link>
      </div>
    </article>
  );
}
