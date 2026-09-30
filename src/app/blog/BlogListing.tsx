"use client";

import Link from "@/components/ui/Link";
import Image from "next/image";
import { useMemo, useState } from "react";
import type { BlogPost } from "@/data/blogs";
import { categoryPath, type BlogCategory } from "@/lib/blogCategories";

/**
 * The blog listing, shared by /blog and each /blog/category/[slug] page:
 * search across the top, categories down the left, posts on the right.
 *
 * Categories are links to their own pages rather than an in-page filter, so
 * each one is a real URL a search engine can crawl and a reader can share.
 * Search stays in the browser and works within whatever page it's on.
 */
export default function BlogListing({
  posts,
  categories,
  totalPosts,
  activeSlug,
  title,
}: {
  /** The posts this page lists — every post, or one category's. */
  posts: BlogPost[];
  categories: BlogCategory[];
  /** For the "All articles" count, which is the same on every page. */
  totalPosts: number;
  /** The category page being shown; undefined on /blog. */
  activeSlug?: string;
  title: string;
}) {
  const [query, setQuery] = useState("");

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter((post) =>
      [post.title, post.excerpt, post.category, ...(post.keywords ?? [])]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [posts, query]);

  const categoryLinks = [
    { name: "All articles", href: "/blog", count: totalPosts, active: !activeSlug },
    ...categories.map((c) => ({
      name: c.name,
      href: categoryPath(c.name),
      count: c.count,
      active: c.slug === activeSlug,
    })),
  ];

  return (
    <section className="py-10 md:py-14">
      <div className="site-container">
        {/* Search */}
        <label htmlFor="blog-search" className="sr-only">
          Search articles
        </label>
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            id="blog-search"
            type="search"
            placeholder={activeSlug ? `Search ${title.toLowerCase()}…` : "Search articles by title, keyword or topic…"}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 md:py-4 rounded-xl border border-white/15 bg-white/5 text-white outline-none transition-all text-sm md:text-base placeholder:text-white/50 focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20"
          />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[16rem_1fr] lg:items-start">
          {/* Categories */}
          <aside className="rounded-xl border border-white/10 bg-[#101314] p-5 lg:sticky lg:top-28">
            <h2 className="text-sm font-bold uppercase tracking-wide text-white/60 mb-3">Categories</h2>
            <nav aria-label="Blog categories">
              <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
                {categoryLinks.map((c) => (
                  <li key={c.href}>
                    <Link
                      href={c.href}
                      aria-current={c.active ? "page" : undefined}
                      className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                        c.active
                          ? "bg-[#c5eb02] text-black"
                          : "bg-white/5 text-white/80 hover:bg-white/10 hover:text-white lg:bg-transparent"
                      }`}
                    >
                      {c.name}
                      <span className={`text-xs ${c.active ? "text-black/60" : "text-white/40"}`}>{c.count}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Posts */}
          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-6">
              <h2 className="text-[1.5rem] md:text-[2rem] font-bold leading-tight text-white">{title}</h2>
              <p className="text-sm text-white/50">
                {query.trim()
                  ? `${shown.length} result${shown.length === 1 ? "" : "s"} for “${query.trim()}”`
                  : `${posts.length} article${posts.length === 1 ? "" : "s"}`}
              </p>
            </div>

            {shown.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {shown.map((post) => (
                  <article
                    key={post.id}
                    className="group rounded-xl overflow-hidden border border-white/10 bg-[#101314] transition-all duration-300 hover:border-[#c5eb02] hover:-translate-y-1 h-full flex flex-col"
                  >
                    <Link href={`/blog/${post.slug}`} className="relative block aspect-[4/5] overflow-hidden" tabIndex={-1} aria-hidden="true">
                      <Image
                        src={post.coverImage}
                        sizes="(min-width: 1280px) 25vw, (min-width: 768px) 40vw, 100vw"
                        alt={post.coverImageAlt}
                        fill
                        className="object-cover object-center"
                      />
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
                      <Link
                        href={`/blog/${post.slug}`}
                        className="mt-auto text-sm font-bold text-[#c5eb02] hover:text-[#c5eb02]/80"
                      >
                        Read article →
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-white/10 py-16 text-center">
                <p className="text-lg text-white/80 mb-2">No articles found.</p>
                <p className="text-sm text-white/50">
                  Try a different search{activeSlug ? ", or look in All articles" : ""}.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
