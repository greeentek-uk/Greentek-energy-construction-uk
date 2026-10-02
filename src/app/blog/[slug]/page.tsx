import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "@/components/ui/Link";
import FittedImage from "@/components/ui/FittedImage";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getPublicBlogPosts } from "@/lib/cms";
import { buildBlogPostingJsonLd, SITE_URL } from "@/lib/structuredData";
import ContentBlocks from "@/components/ui/ContentBlocks";
import PageSchema from "@/components/site/PageSchema";
import { withSeoOverride } from "@/lib/seo";
import Breadcrumbs from "@/components/site/Breadcrumbs";
import FaqSection from "@/components/site/FaqSection";
import { buildToc, DEFAULT_TOC_TITLE } from "@/lib/toc";
import { categoryPath } from "@/lib/blogCategories";
import { BlogTocAside, BlogTocInline } from "./BlogToc";
import AuthorBox from "./AuthorBox";
import { getAuthorBySlug } from "@/lib/db/authors";

interface Props {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const blogPosts = await getPublicBlogPosts();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return {
      title: "Blog Post Not Found",
    };
  }

  const metadata = await withSeoOverride(`/blog/${post.slug}`, {
    kind: "blog",
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    // Landscape suits link previews; the portrait card image is the fallback.
    image: post.heroImage || post.coverImage,
    ogType: "article",
    vars: { category: post.category, date: post.date },
  });

  return {
    ...metadata,
    keywords: post.keywords,
    openGraph: {
      ...metadata.openGraph,
      type: "article",
      publishedTime: post.date,
      authors: ["Greentek"],
    },
  };
}

export async function generateStaticParams() {
  const blogPosts = await getPublicBlogPosts();
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const blogPosts = await getPublicBlogPosts();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  const author = await getAuthorBySlug(post.authorSlug);
  const jsonLd = buildBlogPostingJsonLd(post, SITE_URL, author);
  const toc = buildToc(post.content, post.toc);
  const tocTitle = post.toc?.title?.trim() || DEFAULT_TOC_TITLE;

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <PageSchema path={`/blog/${post.slug}`} defaultJsonLd={jsonLd} />
      <Breadcrumbs
        crumbs={[{ label: "Blog", href: "/blog" }, { label: post.title }]}
      />
      <Header />

      <main className="flex-1">
        {/* Hero — category, date and title only. The excerpt is for the blog
            cards and the meta description, not repeated above the article. */}
        <section className="py-12 md:py-20">
          <div className="site-container text-center">
            <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
              {post.category && (
                <Link
                  href={categoryPath(post.category)}
                  className="inline-block bg-[#c5eb02] text-black text-xs font-bold px-4 py-2 rounded-full hover:bg-[#c5eb02]/80"
                >
                  {post.category}
                </Link>
              )}
              <time dateTime={post.date} className="text-sm text-white/70 font-medium">
                {new Date(post.date).toLocaleDateString("en-GB", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </div>
            <h1 className="text-[2rem] md:text-[3.5rem] font-bold leading-[1.15] text-white text-balance">
              {post.title}
            </h1>
          </div>
        </section>

        {/* Cover image with the table of contents on the right, then the
            article. The contents stay beside the article as it scrolls. */}
        <section className="pb-12 lg:pb-24">
          <div
            className={`site-container ${
              toc.length ? "grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start" : ""
            }`}
          >
            <div className="min-w-0">
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black">
              <FittedImage
                src={post.heroImage || post.coverImage}
                sizes="(min-width: 1024px) 60vw, 100vw"
                alt={(post.heroImage && post.heroImageAlt) || post.coverImageAlt}
                priority
              />
            </div>
            {toc.length > 0 && <BlogTocInline entries={toc} title={tocTitle} />}

            <div className="mt-10">
              <ContentBlocks blocks={post.content} omit={["cta"]} />
            </div>

            {author && <AuthorBox author={author} />}

            {/* Related Links */}
            <div className="mt-16 pt-12 border-t border-white/10">
              <h3 className="text-[1.25rem] md:text-[1.5rem] font-bold leading-[1.3] text-white mb-8">
                Next Steps
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link
                  href="/services"
                  className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-[#c5eb02] hover:bg-white/10 transition-all"
                >
                  <h4 className="text-lg font-bold text-white mb-2">
                    View Our Services
                  </h4>
                  <p className="text-white/70 text-sm mb-4">
                    Explore solar PV, heat pumps, insulation, and refurbishment
                    solutions.
                  </p>
                  <span className="text-[#c5eb02] font-bold text-sm">
                    Learn More →
                  </span>
                </Link>
                <Link
                  href="/contact"
                  className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-[#c5eb02] hover:bg-white/10 transition-all"
                >
                  <h4 className="text-lg font-bold text-white mb-2">
                    Contact Us
                  </h4>
                  <p className="text-white/70 text-sm mb-4">
                    Ready to transform your energy? Get a free consultation
                    today.
                  </p>
                  <span className="text-[#c5eb02] font-bold text-sm">
                    Get in Touch →
                  </span>
                </Link>
              </div>
            </div>

            {/* No Instagram block and no in-body call to action on posts, by the
                owner's decision: Next Steps above already offers Contact Us. */}
            </div>

            {toc.length > 0 && <BlogTocAside entries={toc} title={tocTitle} />}
          </div>
        </section>

        {/* Back to Blog */}
        <section className="py-12 border-t border-white/10">
          <div className="site-container">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-[#c5eb02] font-bold hover:text-[#c5eb02]/80"
            >
              ← Back to Blog
            </Link>
          </div>
        </section>
      </main>

      <FaqSection faqs={post.faqs} />
      <Footer />
    </div>
  );
}
