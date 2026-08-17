"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useMemo } from "react";
import type { BlogPost } from "@/data/blogs";

export function BlogFilterClient({ posts: blogPosts }: { posts: BlogPost[] }) {
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(blogPosts.map((post) => post.category)))],
    [blogPosts],
  );
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Filter posts based on category and search query
  const filteredPosts = useMemo(() => {
    let filtered =
      activeCategory === "All"
        ? blogPosts
        : blogPosts.filter((post) => post.category === activeCategory);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.excerpt.toLowerCase().includes(query) ||
          post.category.toLowerCase().includes(query),
      );
    }

    return filtered;
  }, [activeCategory, searchQuery, blogPosts]);

  // Featured post is the first one (always visible if "All" is selected and no search)
  const featuredPost =
    activeCategory === "All" && !searchQuery ? blogPosts[0] : null;
  const latestPosts = featuredPost
    ? filteredPosts.filter((p) => p.id !== featuredPost.id)
    : filteredPosts;

  return (
    <>
      {/* Search & Filter Section */}
      <section className="py-10 md:py-12 border-b border-[#c5eb02]">
        <div className="mx-auto max-w-5xl px-6">
          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/80"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search articles by title, keyword, or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 md:py-4 rounded-xl border border-[#c5eb02] focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 outline-none transition-all text-sm md:text-base placeholder:text-white/80"
              />
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 md:gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 md:px-5 py-2 md:py-2.5 rounded-full font-bold text-xs md:text-sm transition-all duration-300 whitespace-nowrap ${
                  activeCategory === category
                    ? "bg-[#c5eb02] text-black shadow-lg shadow-[#c5eb02]/30 scale-105"
                    : "bg-zinc-100 text-black hover:bg-zinc-200 hover:scale-105"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Article Section */}
      {featuredPost && (
        <section className="py-12 md:py-16 border-b border-[#c5eb02]">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="text-[1.625rem] md:text-[2.5rem] font-bold leading-[1.2] text-[#c5eb02] mb-10 md:mb-12 mx-auto text-center">
              Featured Article
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-center">
              {/* Featured Image */}
              <Link href={`/blog/${featuredPost.slug}`}>
                <div className="relative h-80 md:h-96 lg:h-[420px] rounded-xl overflow-hidden group cursor-pointer flex items-center justify-center">
                  <Image
                    src={featuredPost.coverImage}
                    alt={featuredPost.coverImageAlt}
                    fill
                    className="object-contain object-center"
                    priority
                  />
                </div>
              </Link>

              {/* Featured Content */}
              <div className="flex flex-col justify-between">
                <div>
                  <time className="inline-block text-xs font-semibold text-white/80 uppercase mb-4">
                    {new Date(featuredPost.date).toLocaleDateString("en-GB", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                  <h3 className="text-xl md:text-2xl font-bold text-white leading-[1.3] mb-4 md:mb-6">
                    {featuredPost.title}
                  </h3>
                  <p className="text-base md:text-lg text-white/80 leading-relaxed mb-6 md:mb-8 font-medium">
                    {featuredPost.excerpt}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                  <Link
                    href={`/blog/${featuredPost.slug}`}
                    className="inline-flex items-center justify-center px-6 md:px-8 py-4 rounded-xl bg-[#c5eb02] text-black text-sm md:text-[15px] font-bold hover:bg-[#c5eb02]/80  transition-all active:scale-95"
                  >
                    Read Article →
                  </Link>
                  {featuredPost.instagramUrl && (
                    <a
                      href={featuredPost.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-6 md:px-8 py-3 md:py-4 rounded-xl bg-white text-zinc-900 text-xs md:text-sm font-bold  transition-all border  active:scale-95"
                    >
                      View Instagram Post
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Latest Insights Grid */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-[1.625rem] md:text-[2.5rem] font-bold leading-[1.2] text-[#c5eb02] mb-10 md:mb-12 mx-auto text-center">
            {activeCategory === "All" && !searchQuery
              ? "Latest Insights"
              : `${activeCategory} Insights`}
            {searchQuery && (
              <span className="text-zinc-500 font-normal ml-2">
                ({latestPosts.length} results)
              </span>
            )}
          </h2>

          {latestPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
              {latestPosts.map((post) => (
                <article
                  key={post.id}
                  className="group rounded-xl overflow-hidden border border-[#c5eb02] hover:border-[#c5eb02]  shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-green-900/15 hover:-translate-y-1 h-full flex flex-col"
                >
                  {/* Card Image */}
                  <Link
                    href={`/blog/${post.slug}`}
                    className="block relative overflow-hidden  aspect-[3/4] cursor-pointer flex items-start justify-start"
                  >
                    <Image
                      src={post.coverImage}
                      alt={post.coverImageAlt}
                      fill
                      className="object-contain object-center"
                    />
                  </Link>

                  {/* Card Content */}
                  <div className="p-6 md:p-8 flex flex-col flex-grow">
                    <time className="text-xs font-semibold text-white/80 uppercase mb-3">
                      {new Date(post.date).toLocaleDateString("en-GB", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </time>

                    <Link href={`/blog/${post.slug}`}>
                      <h3 className="text-xl md:text-2xl font-bold text-white leading-snug group-hover:text-[#c5eb02] transition-colors line-clamp-3 mb-3 flex-grow cursor-pointer">
                        {post.title}
                      </h3>
                    </Link>

                    <p className="text-sm md:text-base leading-relaxed mb-4 line-clamp-2 text-white/80">
                      {post.excerpt}
                    </p>

                    {/* Card Footer */}
                    <div className="flex flex-col gap-3 pt-4 border-t border-[#c5eb02] mt-auto">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center justify-center text-xs md:text-sm font-bold text-[#c5eb02] hover:text-green-700 transition-colors"
                      >
                        Read Article →
                      </Link>
                      {post.instagramUrl && (
                        <a
                          href={post.instagramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center text-xs font-bold hover:text-[#c5eb02] text-white/80 transition-colors"
                        >
                          View Instagram Post
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-lg text-zinc-600 mb-2">No articles found.</p>
              <p className="text-sm text-zinc-500">
                Try adjusting your search or category filters.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Follow on Instagram CTA */}
      <section className="py-12 md:py-16 border-t border-[#c5eb02]">
        <div className="mx-auto max-w-5xl px-6">
          <div className="p-8 md:p-12 rounded-xl border border-[#c5eb02] text-center">
            <div className="flex justify-center mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
              Follow Greentek on Instagram
            </h3>
            <p className="text-white/80 text-sm md:text-base font-medium mb-6">
              @greentekenergy.uk
            </p>
            <p className="text-white/80 text-base md:text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
              Get daily energy-saving tips, project updates, home improvement
              ideas, and exclusive insights into renewable energy solutions.
            </p>
            <a
              href="https://www.instagram.com/greentekenergy.uk/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 md:px-8 py-4 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white text-sm md:text-[15px] font-bold hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 hover:shadow-lg hover:shadow-purple-900/30 transition-all active:scale-95"
            >
              Follow on Instagram →
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
